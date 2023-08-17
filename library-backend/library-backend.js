const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const AuthorModel = require('./models/authors')
const BookModel = require('./models/books')
const UserModel = require('./models/user')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)



let authors = [
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
    name: 'Joshua Kerievsky', 
  },
  { 
    name: 'Sandi Metz', 
  },
]


let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const booksWithoutId = books.map((book) => {
  const {id, ...rest} = book;
  return rest;
})

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
    saveDataToMongoDB()
  })
  .catch((error) => {
    console.log('error connection to MongoDB', error.message)
  })

  // Function to save authors and books to MongoDB
  const saveDataToMongoDB = async () => {
    try {
      await saveAuthors()
      await saveBooks()
      console.log('Data saved to MongoDB')
    } catch (error) {
      console.log('Error saving data to MongoDB', error.message)
    } 
  }

  // Function to save authors to MongoDB
  const saveAuthors = async () => {
    try {
      for (const authorData of authors) {
        const existAuthor = await AuthorModel.findOne({ name: authorData.name })
        
        if (!existAuthor) {
          const author = new AuthorModel(authorData)
          console.log(author)
          await author.save()
          console.log('Author saved:', author.name);
      } else {
        console.log('Author already exists:', existAuthor.name);
      }
      }
    } catch (error) {
      console.log('Error saving authors:', error.message);
    }
  }

  // Function to save books to MongoDB
  const saveBooks = async () => {
    try {
      for (const bookData of booksWithoutId) {
        const author = await AuthorModel.findOne({ name: bookData.author });
  
        if (!author) {
          console.log(`Author not found for book: ${bookData.title}`);
          continue;
        }
  
        const book = new BookModel({ ...bookData, author: author._id });
        await book.save();
        console.log('Book saved:', book.title);
      }
      console.log('All books saved successfully');
    } catch (error) {
      console.log('Error saving books:', error.message);
    }
  };
  

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }
  type User {
    username: String!
    favoriteGenre: [String]!
    id: ID!
  }
  type Token {
    value: String!
  }

  type Query {
    allBooks(author:String, genre:String): [Book!]
    allAuthors: [Author!]
    bookCount: Int
    authorCount:Int
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int
    ):Author

    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    allBooks: async(root, args) => {
      try {
          let filteredBooks = await BookModel.find({}).populate('author')

        if (args.author) {
          filteredBooks = filteredBooks.filter(book => book.author.name === args.author);
        }
        if (args.genre) {
          filteredBooks = filteredBooks.filter(book => book.genres.includes(args.genre));
        }
        return filteredBooks;
      } catch (error) {
        throw new Error('Error fetching books: ' + error.message)
      }
    }
    ,
    allAuthors: async() => {
      try {
        const authors = await AuthorModel.find({});

        return authors.map(async (author) => {
          return {
            ...author.toObject(),
            bookCount: 
            (await BookModel
              .find({})
              .populate('author'))
              .filter(book => book.author.name === author.name).length,
          };
        });
      } catch (error) {
        throw new Error('Error fetching authors: ' + error.message);
      }
    },
    bookCount: async() => {
      try {
        return await BookModel.countDocuments()
      } catch (error) {
        throw new Error('Error fetching book count: ' + error.message)
      }
    },
    authorCount: async() => {
      try {
        return await AuthorModel.countDocuments()
      } catch (error) {
        throw new Error('Error fetching athor count: ' + error.message)
      }
  },
  me: (root, args, context) => {
    return context.currentUser
  }
},
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      console.log(currentUser)
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }
    
      if (args.title.length < 5) {
        throw new GraphQLError('Book title is too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }
    
      try {
        let author = await AuthorModel.findOne({ name: args.name });
    
        if (!author) {
          author = new AuthorModel({ name: args.name, born: args.born });
          await author.save();
        }
    
        const newBook = new BookModel({
          title: args.title,
          published: args.published || null,
          author: author._id,
          genres: args.genres || [],
        });
    
        await newBook.save();
    
        // Update currentUser's favoriteGenre (assuming this is a valid operation)
        currentUser.favoriteGenre = currentUser.favoriteGenre.concat(newBook.genres);
        await currentUser.save();
    
        return newBook;
      } catch (error) {
        console.error('Error saving book:', error);
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error: error.message,
          },
        });
      }
    },    
    createUser: async (root, args) => {
       // Add validation for username length
      if (args.username.length < 3) {
        throw new GraphQLError('Username is too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }
      const user = new UserModel({ username: args.username })
      
      return user.save()
                 .catch(error => {
                  throw new GraphQLError('Creating the user failed', {
                    extensions: {
                      code: 'BAD_USER_INPUT',
                      invalidArgs: args.name,
                      error
                    }
                  })
                 })
    },
    login: async (root, args) => {
      const user = await UserModel.findOne({ username: args.username })

      if ( !user || args.password !== process.env.JWT_SECRET ) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })        
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
    editAuthor: async(root, args) => {
      try {
        const author = await AuthorModel.findOne({name: args.name})
        if (!author) {
          return null
        }
        author.born = args.setBornTo;
        await author.save()
        return author
      } catch (error) {
        throw new GraphQLError('Error adding book: ', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.author,
            error
          }
      })
    }
  }
}
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})