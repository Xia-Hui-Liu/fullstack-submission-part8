require('dotenv').config()

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4
  },
  born: {
    type: Number
  }
})

const Author = mongoose.model('Author', authorSchema)

const authors = [
  {
    name: 'Robert Martin',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky'
  },
  { 
    name: 'Sandi Metz'
  }
]

const saveAuthors = async () => {
  try {
    for (const authorData of authors) {
      const author = new Author(authorData)
      await author.save()
      console.log('Author saved:', author.name)
    }
    console.log('All authors saved successfully')
  } catch (error) {
    console.log('Error saving authors:', error.message)
  } finally {
    mongoose.connection.close()
    console.log('MongoDB connection closed')
  }
}

saveAuthors()
