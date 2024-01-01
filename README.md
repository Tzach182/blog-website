
Blog Website Project
====================

Overview
--------

This project is a simple blog website that allows users to create, edit, and delete posts. It was built using Express.js as the backend framework, PostgreSQL as the database, and EJS (Embedded JavaScript) for the templating engine. The goal of this project is to provide a basic platform for users to share their thoughts and ideas through blog posts.

Getting Started
---------------

1.  Clone the repository to your local machine:

    git clone https://github.com/your-username/blog-website.git

3.  Navigate to the project directory:

    cd blog-website

5.  Create a table in your PostgreSQL database. Adjust the database connection settings in `index.js` if needed.
6.  Optionally, you can use the provided CSV file (`post.csv`) to populate the database with some test posts.
7.  Update the database connection information, including username, password, and database name in the `index.js` file.
8.  Install the project dependencies using npm:

    npm install

10.  Run the application:

    node index.js

The application will be accessible at `http://localhost:3000` by default. You can change the port by modifying the `PORT` variable in the `index.js` file.

Usage
-----

*   Open your web browser and go to `http://localhost:3000`.
*   You can create new posts by clicking on the "Add Post" button.
*   To edit a post, click on the "Edit" button next to the post.
*   To delete a post, click on the "Delete" button next to the post.

Customization
-------------

If you need to customize the project, consider the following:

*   **Database Configuration:** Adjust the database connection settings in the `index.js` file.
*   **Port Configuration:** Change the port number by modifying the `PORT` variable in the `index.js` file.

Contributing
------------

Feel free to contribute to the project by submitting bug reports, feature requests, or pull requests. Your input is highly appreciated!


Happy blogging!
