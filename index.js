import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

let blogList = [{id: 1, title: "start", content: "this is a demo to get a feel for it" }];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

/*
    displays main webpage with the list of blogs
*/
app.get("/", (req, res) => {
    console.log(blogList);
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
app.post("/submit", (req, res) => {
    //console.log("this is the body " + req.body["blogName"]);
    const newBlog = {
        id : blogList.length + 1,
        title : req.body["blogName"],
        content : req.body["blogBody"],
    };
    blogList.push(newBlog);

    res.redirect("/");
});


/*
    finds requested blog and displays it on the page
*/
app.get("/blog/:id",(req, res) => {
    console.log(req.params.id);
    const id = parseInt(req.params.id);
    const blog = blogList.find((blog) => blog.id === id);
    console.log(blog);

    res.render("blog.ejs", blog);
});


/*
    displays delete blog page
*/
app.get("/delete", (req, res) => {
    res.render("delete.ejs");
});


/*
    deals with the blog deletion logic, returns status message
*/
app.post("/delete/submit", (req, res) => {
    const nameToDelete = req.body["blogName"];
    const blogToDelete = blogList.find(({blogName}) => blogName === nameToDelete);
    var message = `${nameToDelete} was not found`;
     
    if (blogToDelete) {
        blogList = blogList.filter(function(blog) { return blog.blogName != nameToDelete; });
        message = `${nameToDelete} deleted succesfully`;
    }

    res.render("delete.ejs", {message : message});
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

