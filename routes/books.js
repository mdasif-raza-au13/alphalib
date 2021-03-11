const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin.js');
const auth = require('../middleware/auth.js');
const Book = require('../models/book');
const Author = require('../models/author');
// const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];


// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
});


//here we have New Book Route
router.get('/new',admin, async (req, res) => {
  renderNewPage(res, new Book())
});


// here we Create Book Route
router.post('/',admin, async (req, res) => { 
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    
    description: req.body.description
  })
  // here we are saving our books cover image 
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    
    // res.redirect(`books`)
    res.redirect(`books/${newBook.id}`)
  } catch {
    
    renderNewPage(res, book, true)
  }
});


// populating the data inside the reference
// show Book route here 
router.get('/:id',auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
                           
                           
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
});


// edit book route
router.get('/:id/edit', admin, async (req, res) => {
  
  try{
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  }catch{
    res.redirect('/')
  }
});


// Updating book route
router.put('/:id',admin, async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      res.redirect('/')
    }
  }
});


// deleting the book route here 
router.delete('/:id',admin, async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})
async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }

    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error ccure while Updating Book'
      } else {
        params.errorMessage = 'Error occure while Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
};


// we are checking and saving our image json here
// binary-to-text is base64 
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
};


// in above code buffer is The buffers module provides a way of handling streams of binary data.


module.exports = router; 