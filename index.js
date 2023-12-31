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
    and then rerouts to main page with the updated list
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
app.get("/delete/:id", (req, res) => {
    console.log(req.params.id);
    const id = req.params.id;
    const indexToDelete = blogList.findIndex((blog) => blog.id == id);
    blogList.splice(indexToDelete, 1);
    res.redirect("/");
});


/*
    displays edit blog page
*/
app.post("/edit", (req, res) => {
    const id = req.body.id;
    const blogToEdit = blogList.find((blog) => blog.id == id);
    console.log(blogToEdit);
    res.render("edit.ejs", blogToEdit);
});

/*
    deals with the edit blog logic, returns status message
*/
app.post("/edit/submit", (req, res) => {
   const id = req.body.id;
   console.log(id);
   const blogIndex = blogList.findIndex((blog) => blog.id == req.body.id);
   blogList[blogIndex].content = req.body.content;
   blogList[blogIndex].title = req.body.title;


   console.log(blogIndex);
   res.redirect("/");

});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

