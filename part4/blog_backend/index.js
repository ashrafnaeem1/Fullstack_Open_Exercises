require('dotenv').config()
const Blog = require('./models/blog')
const {
  MissingFieldError,
  DuplicateNameError,
  NotFoundError,
} = require('./errors')
const {
  unknownEndpoint,
  errorHandler,
} = require('./middleware/errorHandler')

const express = require('express')
const morgan = require('morgan')

const app = express()

// Middleware
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
  ),
)

// Wraps an async route handler so a rejected promise (or thrown error)
// is forwarded to next(error) instead of needing a try/catch in every
// route. This is what lets routes stay error-handling-free below.
const asyncHandler = (fn) => (request, response, next) =>
  Promise.resolve(fn(request, response, next)).catch(next)

const getInfoText = (headcount) => {
  const date = new Date().toString()
  return `<p>Phonebook has info for ${headcount} people.</p><p>${date}</p>`
}

// Routes
app.get('/', (request, response) => {
  response.send(
    '<h1>If you are seeing this message then frontend integration is faulty.</h1>',
  )
})

app.get(
  '/api/blogs',
  asyncHandler(async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
  }),
)

app.get(
  '/api/blogs/:id',
  asyncHandler(async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      throw new NotFoundError()
    }
    response.json(blog)
  }),
)

app.get(
  '/info',
  asyncHandler(async (request, response) => {
    const headcount = await Blog.countDocuments({})
    response.send(getInfoText(headcount))
  }),
)

app.delete(
  '/api/blogs/:id',
  asyncHandler(async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }),
)

app.post(
  '/api/blogs',
  asyncHandler(async (request, response) => {
    const { title, author, url, likes } = request.body

    if (!title) {
      throw new MissingFieldError('title')
    }
    if (!author) {
      throw new MissingFieldError('author')
    }
    if (!url) {
      throw new MissingFieldError('url')
    }
    if (!likes) {
      throw new MissingFieldError('likes')
    }

    const existingBlog = await Blog.findOne({ title })
    if (existingBlog) {
      throw new DuplicateNameError()
    }

    const blog = new Blog({ title, author, url, likes })
    const savedBlog = await blog.save()
    response.json(savedBlog)
  }),
)

app.put(
  '/api/blogs/:id',
  asyncHandler(async (request, response) => {
    const { title, author, url, likes } = request.body

    if (!title) {
      throw new MissingFieldError('title')
    }
    if (!author) {
      throw new MissingFieldError('author')
    }
    if (!url) {
      throw new MissingFieldError('url')
    }
    if (!likes) {
      throw new MissingFieldError('likes')
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes },
      { new: true, runValidators: true, context: 'query' },
    )

    if (!updatedBlog) {
      throw new NotFoundError()
    }
    response.json(updatedBlog)
  }),
)

// Unknown Endpoint Middleware (must be registered after valid routes)
app.use(unknownEndpoint)

// Centralized error handler (must be registered last)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
