const mongoose = require('mongoose')
const Book = require('./book')
const authorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }
},{collection: 'Authors'})
// here i am going to make an update 
// if i delete an author 
// what happen to that book which was
//  associated with that author
// to access author we are using a normal 
// function in place of => this


authorSchema.pre('remove', function(next) {
    Book.find({ author: this.id }, (err, books) => {
      if (err) {
        next(err)
      } else if (books.length > 0) {
        next(new Error('This author has books still'))
      } else {
        next()
      }
    })
  })

module.exports = mongoose.model('Author', authorSchema)