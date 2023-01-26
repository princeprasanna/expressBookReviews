const { json } = require('express');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const { getBookByisbn, getBookByauthor, getBookBytitle } = require('../services/booksService')
const public_users = express.Router();
const axios = require('axios')
const http = require('http')



public_users.post("/register", (req, res) => {
  //Write your code here

  const { username, password } = req.body

  try {
    if (!username) {
      return res.status(400).json({ code: 400, message: "Bad request!. username not provided" })
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ code: 400, message: "Bad request!. Invalid password" })
    }

    if (!isValid(username)) {
      return res.status(400).json({ code: 400, message: `A user with username ${username} already exist!` })
    }

    const newUser = { username, password }
    users.push(newUser)
    return res.status(201).json(newUser)

  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message })
  }

});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here

  const { isbn } = req.params
  try {
    const book = getBookByisbn({ isbn, books })
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.code).json(error)
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  const { author } = req.params
  try {
    const book = getBookByauthor({ author, books })
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.code).json(error)
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here

  const { title } = req.params
  try {
    const book = getBookBytitle({ title, books })
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.code).json(error)
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here

  const { isbn } = req.params
  try {
    const book = getBookByisbn({ isbn, books })
    if (!book[isbn].reviews) {
      return res.status(404).json({ message: `Book with isbn ${isbn} dont have any reviews` })
    }
    return res.status(200).json(book[isbn].reviews);
  } catch (error) {
    return res.status(error.code || 500).json(error)
  }
});



const axiosAction = {
  // getting the list of books available in the shop using callback
  getAllBooks: async () => {

    http.get('http://localhost:5000/', res => {
      let data = ''
      res.on('error', e => {
        console.error(err.response ? err.response.data : err.message)
      })
      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        console.log("\n\n======================All Books======================")
        console.log(JSON.parse(data))
      })
    })
  },


  // getting the list of book by isbn using promise
  getBookByisbn: (isbn) => {
    axios.get('http://localhost:5000/isbn/' + isbn).then(res => {
      console.log(`\n\n======================Get book by isbn: ${isbn}======================`)
      console.log(res.data)
    }).catch(err => { console.error(err.response ? err.response.data : err.message) })
  },

  // getting the list of book by author
  getBookByauthor: async (author) => {
    try {
      const { data } = await axios.get('http://localhost:5000/author/' + author)
      console.log(`\n\n======================Get book by author: ${author}======================`)
      console.log(data)
    } catch (error) {
      console.error(error.response ? error.response.data : error.message)
    }
  },

  //   getting the list of book by title
  getBookBytitle: async (title) => {
    try {
      const { data } = await axios.get('http://localhost:5000/title/' + title)
      console.log(`\n\n======================Get book by title ${title}======================`)
      console.log(data)
    } catch (error) {
      console.error(error.response ? error.response.data : error.message)
    }
  },
}

axiosAction.getAllBooks()
axiosAction.getBookByisbn(1)
axiosAction.getBookByauthor('Hans Christian Andersen')
axiosAction.getBookBytitle('The Epic Of Gilgamesh')


module.exports.general = public_users;