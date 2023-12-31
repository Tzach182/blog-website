import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "blogposts",
    password: "A1234567",
    port: 5432,
});

db.connect();

let blogList = [{id: 1, title: "start", content: "this is a demo to get a feel for it" }];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

async function getBlogs() {
    const result = await db.query("SELECT * FROM post");
    blogList = result.rows;
}

/*
    displays main webpage with the list of blogs
*/
app.get("/", async (req, res) => {
    //console.log(blogList);
    await getBlogs();
    res.render("index.ejs", {
        blogList : blogList,
    });
  });

/*
    displays addPost page for adding posts
*/
app.get("/addPost", (req,res) => {

    res.render("addBlog.ejs");
});

/*
    deals with logic of adding posts
    and then rerouts to main page
*/
app.post("/submit", async (req, res) => {
    //console.log("this is the body " + req.body["blogName"]);
    const title = req.body.title;
    const content = req.body.content;
    try {
        const result = await db.query("INSERT INTO post (title, content) VALUES ($1, $2) RETURNING *",[title, content]);
        //console.log(result);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    };
});


/*
    finds requested blog and displays it on the page
*/
app.get("/blog/:id", async (req, res) => {
    
    console.log(req.params.id);
    const id = parseInt(req.params.id);
    try {
        const result = await db.query("SELECT * FROM post WHERE id = $1",[id]);
        let blog = result.rows;
        console.log(blog);
        res.render("blog.ejs", blog[0]);
    } catch (err) {
        console.log(err);
    }

});


/*
    displays delete blog page
*/
app.get("/delete/:id", async (req, res) => {
    //console.log(req.params.id);
    const id = req.params.id;
    try {
        await db.query("DELETE FROM post WHERE id = $1", [id]);
        res.redirect("/");
    } catch(err) {
        console.log(err);
    }
});


/*
    displays edit blog page
*/
app.post("/edit", async (req, res) => {
    const id = req.body.id;
    try {
        const result = await db.query("SELECT * FROM post WHERE id = $1",[id]);
        let blogToEdit = result.rows;
        console.log(blogToEdit);
        res.render("edit.ejs", blogToEdit[0]);
    } catch (err) {
        console.log(err);
    };    
});

/*
    deals with the edit blog logic, returns status message
*/
app.post("/edit/submit", async (req, res) => {
   const id = req.body.id;
   console.log(id);
   const content = req.body.content;
   const title = req.body.title;

   try {
       await db.query("UPDATE post SET title = $1, content = $2 WHERE id = $3",[title, content, id]);
       //console.log(result);
       res.redirect("/");
   } catch (err) {
       console.log(err);
   };

});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

