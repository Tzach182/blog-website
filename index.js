import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const blogList = [];

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


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

