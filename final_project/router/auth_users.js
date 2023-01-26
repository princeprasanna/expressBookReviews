const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const booksService = require('../services/booksService')
const regd_users = express.Router();


let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  const user = users.filter(u => u.username == username)
  if (user.length > 0) {
    return false
  }
  return true
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  try {
    const [user] = users.filter(u => u.username == username)
    const isValidPassword = user.password == password
    if (isValidPassword) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here


  const { username, password } = req.body
  try {
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: "Bad request!. username / password not provided" })
    }

    if (authenticatedUser(username, password)) {

      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });

      req.session.authorization = {
        accessToken, username
      }
      return res.status(200).json({ code: 200, message: `${username} logged in!` })
    }
    return res.status(401).json({ code: 401, message: 'username and password does not match! check again' })
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message })
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params
  const { review } = req.query
  const { username } = req.session.authorization
  try {
    if (!isbn) {
      console.error("Bad request! isbn not provided")
      return res.status(400).json({ code: 400, message: 'Bad request! isbn not provided' })
    }
    if (!review) {
      console.error("Bad request! review not provided")
      return res.status(400).json({ code: 400, message: 'Bad request! review not provided' })
    }
    const book = booksService.getBookByisbn({ isbn, books })

    let existingReview = book[isbn].reviews

    const newReview = {
      [username]: review
    }

    books[isbn].reviews = {
      ...existingReview,
      ...newReview
    }

    return res.status(201).json(books[isbn])
  } catch (error) {
    return res.status(error.code || 500).json({ code: error.code || 500, message: error.message })
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params
  const { username } = req.session.authorization
  try {
    if (!isbn) {
      console.error("Bad request! isbn not provided")
      return res.status(400).json({ code: 400, message: 'Bad request! isbn not provided' })
    }
    delete books[isbn].reviews[username]
    return res.status(200).json({ message: `deleted your review`, book: books[isbn] })

  } catch (error) {
    return res.status(error.code || 500).json({ code: error.code || 500, message: error.message })
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;