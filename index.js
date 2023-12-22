import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

var blogList = [];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {
        blogList : blogList,
    });
  });

app.get("/addPost", (req,res) => {

    res.render("addBlog.ejs");
});

app.post("/submit", (req, res) => {
    const newBlog = {
        blogName : req.body["blogName"],
        blogBody : req.body["blogBody"],
    };
    blogList.push(newBlog);
    //console.log(blogList);

    res.render("index.ejs", {
        blogList : blogList,
    });
});

app.get("/blog",(req, res) => {
    const nameToFind = req.query.blogName;
    const blog = blogList.find(({blogName}) => blogName === nameToFind);
    //console.log();
    res.render("blog.ejs", blog);
}); 

app.get("/delete", (req, res) => {
    res.render("delete.ejs");
});

app.post("/delete/submit", (req, res) => {
    const nameToDelete = req.body["blogName"];
    console.log(nameToDelete);
    const blogToDelete = blogList.find(({blogName}) => blogName === nameToDelete);
    var message = `${nameToDelete} was not found`;
     
    if (blogToDelete) {
        blogList = blogList.filter(function(blog) { return blog.blogName != nameToDelete; });
        message = `${nameToDelete} deleted succesfully`;
    }
    console.log(message);
    console.log(blogList);
    res.render("delete.ejs", {message : message});
    

});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

