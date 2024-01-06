import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
const saltRounds = 10;

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.eventNames.DB_PORT,
});

db.connect();


passport.use(new LocalStrategy(
    async (username, password, done) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if(!user) {
            return done(null, false, {message: 'Incorrect username'});
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch) {
            return done(null, false, {message: 'Incorrect password'});
        }

        return done(null, user);


    } catch (err) {return done(err);}

}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

let blogList = [{id: 1, title: "start", content: "this is a demo to get a feel for it" }];



async function getBlogs(id) {
    console.log(id);
    const result = await db.query("SELECT * FROM blogs WHERE userid = $1 ORDER BY id ASC", [id]);
    console.log(result);
    return result.rows;
};

/*
routes 
-----------------------------------------------------------------
*/

/*
login / register
------------------------------------------------------------------
*/
app.get("/", (req, res) => {
    res.render("landingPage.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", async (req, res) => {

    const userName = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, async function(err, hash) {
        console.log(hash);

        try {
            await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [userName, hash]);
            res.redirect("/login");

        } catch (err) {
            console.log(err);
            res.render("/errorpage", {message: "Couldn't add user"});
        }
    });
    
    
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", passport.authenticate('local', {
    successRedirect: "/bloglist",
    failureRedirect:"/login"
}));

/*
main pages
--------------------------------------------------------
*/

app.get("/bloglist", async (req, res) => {
    
    if (req.isAuthenticated()) {
        const user = req.user;
        const id = user.id;
        const blogList = await getBlogs(id)
        console.log(blogList);
        res.render("index.ejs", {blogList: blogList});
      } else {
        res.redirect('/login');
      }
    });


app.get("/addPost", (req,res) => {
    if (req.isAuthenticated()) {
        res.render("addBlog.ejs");
    } else {
        res.redirect("/login");
    }
    
});


app.post("/submit", async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const user = req.user;
    const userId = user.id;
    const creationDate = new Date();
    try {
        const result = await db.query("INSERT INTO blogs (title, content, userid, creationdate) VALUES ($1, $2, $3, $4) RETURNING *",[title, content, userId, creationDate]);
        console.log(result);
        res.redirect("/bloglist");
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

