const { ApplicationError } = require('../errors')

// Registered after all valid routes.
const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

// Registered last. Express recognizes this as an error handler because
// it takes four arguments.
const errorHandler = (error, request, response, _next) => {
  console.error(error.message)

  // Errors we threw ourselves (missing field, duplicate name, not found).
  if (error instanceof ApplicationError) {
    return response
      .status(error.statusCode)
      .json({ error: error.message })
  }

  // Malformed MongoDB ObjectId, e.g. GET /api/persons/not-a-real-id
  if (error.name === 'CastError') {
    return response
      .status(400)
      .json({ error: 'malformatted id' })
  }

  // Mongoose schema validation failures (e.g. on findByIdAndUpdate
  // with runValidators: true).
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  // Anything unexpected falls through to a generic 500 instead of
  // crashing the process or leaking internals to the client.
  response.status(500).json({ error: 'internal server error' })
}

module.exports = { unknownEndpoint, errorHandler }
