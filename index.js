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
    console.log("this is the body " + req.body["blogName"]);
    const newBlog = {
        id : blogList.length,
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
app.get("/edit", (req, res) => {
    const id = req.body.id;
    const blogToEdit = blogList.find((blog) => blog.id == id);

    res.render("edit.ejs", {blog: blogToEdit});
});


/*
    finds the post to display
*/
app.post("/edit/find", (req, res) => {

    const nameToFind = req.body["blogName"];
    const blog = blogList.find(({blogName}) => blogName === nameToFind);
    var message = "Couldn't find this blog";

    if(blog) {
        message = "Blog was found";
    }

    res.render("edit.ejs", {
        blog : blog,
        message : message
    }); 
});


/*
    deals with the edit blog logic, returns status message
*/
app.post("/edit/submit", (req, res) => {
    const index = blogList.findIndex(blog => {
        return blog.blogName === req.body["blogName"];
    });

    blogList[index].blogName = req.body["blogName"];
    blogList[index].blogBody = req.body["blogBody"];

    res.render("edit.ejs", {message : "edited succesfully"});
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

