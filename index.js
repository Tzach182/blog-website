import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

var blogList = [];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

/*
    displays main webpage with the list of blogs
*/
app.get("/", (req, res) => {
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
    const newBlog = {
        blogName : req.body["blogName"],
        blogBody : req.body["blogBody"],
    };
    blogList.push(newBlog);

    res.render("index.ejs", {
        blogList : blogList,
    });
});


/*
    finds requested blog and displays it on the page
*/
app.get("/blog",(req, res) => {
    const nameToFind = req.query.blogName;
    const blog = blogList.find(({blogName}) => blogName === nameToFind);

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


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

