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



/**
 * Retrieves blogs for a given user ID from the database.
 * @async
 * @function
 * @param {number} id - User ID.
 * @returns {Promise<Object[]>} Array of blog posts.
 */
async function getBlogs(id) {
    const result = await db.query("SELECT * FROM blogs WHERE userid = $1 ORDER BY id ASC", [id]);
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

/**
 * Handles rendering the landing page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/landing", (req, res) => {
    res.render("landingPage.ejs");
});

/**
 * Handles rendering the registration page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/register", (req, res) => {
    res.render("register.ejs");
});

/**
 * Handles user registration.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
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

/**
 * Handles rendering the login page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/login", (req, res) => {
    res.render("login.ejs");
});

/**
 * Handles user login authentication.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post("/login", passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect:"/login"
}));

/**
 * Handles user logout.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            return res.send("Error during logout");
        }
    });
    res.redirect("/");
});

/*
main pages
--------------------------------------------------------
*/

/**
 * Main page route, renders the index page if the user is authenticated, otherwise redirects to the landing page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/", async (req, res) => {
    
    if (req.isAuthenticated()) {
        const user = req.user;
        const id = user.id;
        const blogList = await getBlogs(id)
        //console.log(blogList);
        res.render("index.ejs", {blogList: blogList});
      } else {
        res.redirect('/landing');
      }
    });

/**
 * Renders the add blog post page if the user is authenticated, otherwise redirects to the login page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/addPost", (req,res) => {
    if (req.isAuthenticated()) {
        res.render("addBlog.ejs");
    } else {
        res.redirect("/login");
    }
    
});

/**
 * Handles the submission of a new blog post.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post("/submit", async (req, res) => {
    if(req.isAuthenticated()) {
        const title = req.body.title;
        const content = req.body.content;
        const user = req.user;
        const userId = user.id;
        const creationDate = new Date();
        try {
            const result = await db.query("INSERT INTO blogs (title, content, userid, creationdate) VALUES ($1, $2, $3, $4) RETURNING *",[title, content, userId, creationDate]);
            //console.log(result);
            res.redirect("/");
        } catch (err) {
            console.log(err);
            res.render("/errorpage", {message: "Couldn't add blog"});
        };
    } else {
        res.render("errorpage.ejs",{message: "not authenticated"});
    }
});


/**
 * Renders the individual blog post page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/blog/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        //console.log(req.params.id);
        const id = parseInt(req.params.id);
        try {
            const result = await db.query("SELECT * FROM blogs WHERE id = $1",[id]);
            let blog = result.rows;
            //console.log(blog);
            res.render("blog.ejs", blog[0]);
        } catch (err) {
            console.log(err);
            res.render("/errorpage", {message: "Error finding blog"});
        }
    } else {
        res.redirect("/login");
    }

});


/**
 * handles the delete blog post logic.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/delete/:id", async (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        try {
            await db.query("DELETE FROM blogs WHERE id = $1", [id]);
            res.redirect("/");
        } catch(err) {
            console.log(err);
        }
    } else {
        redirect("/login");
    }
    //console.log(req.params.id);
    
});


/**
 * Renders the page for editing a blog post.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post("/edit", async (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.body.id;
        try {
            const result = await db.query("SELECT * FROM blogs WHERE id = $1",[id]);
            let blogToEdit = result.rows;
            //console.log(blogToEdit);
            res.render("edit.ejs", blogToEdit[0]);
        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect("/login");
    }
});

/**
 * Handles the submission of an edited blog post.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post("/edit/submit", async (req, res) => {
    if(req.isAuthenticated()) {
        const id = req.body.id;
        console.log(id);
        const content = req.body.content;
        const title = req.body.title;
        const updateDate = new Date();

        try {
            await db.query("UPDATE blogs SET title = $1, content = $2, updatedate = $3  WHERE id = $4",[title, content, updateDate, id]);
            //console.log(result);
            res.redirect("/");
        } catch (err) {
            console.log(err);
        };
    } else {
        res.render("errorpage.ejs",{message: "not authenticated"});
    }

});


/**
 * Starts the Express server on the specified port.
 * @param {number} port - The port on which the server will listen.
 */
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

