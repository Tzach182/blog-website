CREATE DATABASE blogposts

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
);

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(45),
    content TEXT,
    userid INT REFERENCES users(id),
    creationdate DATE,
    updateDate DATE
);