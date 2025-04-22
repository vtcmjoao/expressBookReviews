const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    return users.some(u => u.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login. Check credentials" });
    }
    const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review
    if (!review) {
        return res.status(400).json({ message: "Review query parameter required" });
    }
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    const user = req.session.authorization.username;
    books[isbn].reviews[user] = review;
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    const user = req.session.authorization.username;
    if (books[isbn].reviews[user]) {
        delete books[isbn].reviews[user];
        return res.status(200).json({ message: "Review deleted" });
    }
    return res.status(404).json({ message: "No review by this user to delete" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
