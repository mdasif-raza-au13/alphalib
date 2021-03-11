const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
const admin = require('../middleware/admin.js');
const auth = require('../middleware/auth.js');


// const author = new Author
//for all author we have this
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
});


//for NEW author we have this
router.get('/new',admin,(req, res) => {
    res.render('authors/new', { author: new Author() })

});


// for creating author route
router.post('/',admin, async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Something went wrong while creating Author'
        })
    }
});


// from browser we can only make a get and post req. 
// from browser we can not do or perform put or delete 
// method install method-override 
router.get('/:id',auth, async (req, res) => {
    try {
      const author = await Author.findById(req.params.id)
      const books = await Book.find({ author: author.id }).limit(6).exec()
      res.render('authors/show', {
        author: author,
        booksByAuthor: books
      })
    } catch {
      res.redirect('/')
    }
});


router.get('/:id/edit',admin, async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
});


// geting author update and saving author in 72 and 73
router.put('/:id',admin, async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Something went wrong while updating Author'
            })
        }
    }
});


// i am using delete in place of get because 
// when we will use get then chrome browser will
// accidentely delete all id of author this issue has came to every one
router.delete('/:id',admin, async (req, res) => {
    let author
    try {
      author = await Author.findById(req.params.id)
      await author.remove()
      res.redirect('/authors')
    } catch {
      if (author == null) {
        res.redirect('/')
      } else {
        res.redirect(`/authors/${author.id}`)
      }
    }
});

  
module.exports = router;