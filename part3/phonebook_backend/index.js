require("dotenv").config();
const Person = require("./models/person");
const {
  MissingFieldError,
  DuplicateNameError,
  NotFoundError,
} = require("./errors");
const {
  unknownEndpoint,
  errorHandler,
} = require("./middleware/errorHandler");

const express = require("express");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", (req) => {
  if (req.method === "POST" || req.method === "PUT") {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
  ),
);

// Wraps an async route handler so a rejected promise (or thrown error)
// is forwarded to next(error) instead of needing a try/catch in every
// route. This is what lets routes stay error-handling-free below.
const asyncHandler = (fn) => (request, response, next) =>
  Promise.resolve(fn(request, response, next)).catch(next);

const getInfo = (headcount) => {
  const date = new Date().toString();
  return `<p>Phonebook has info for ${headcount} people.</p><p>${date}</p>`;
};

// Routes
app.get("/", (request, response) => {
  response.send(
    "<h1>If you are seeing this message then frontend integration is faulty.</h1>",
  );
});

app.get(
  "/api/persons",
  asyncHandler(async (request, response) => {
    const persons = await Person.find({});
    response.json(persons);
  }),
);

app.get(
  "/api/persons/:id",
  asyncHandler(async (request, response) => {
    const person = await Person.findById(request.params.id);
    if (!person) {
      throw new NotFoundError();
    }
    response.json(person);
  }),
);

app.get(
  "/info",
  asyncHandler(async (request, response) => {
    const headcount = await Person.countDocuments({});
    response.send(getInfo(headcount));
  }),
);

app.delete(
  "/api/persons/:id",
  asyncHandler(async (request, response) => {
    await Person.findByIdAndDelete(request.params.id);
    response.status(204).end();
  }),
);

app.post(
  "/api/persons",
  asyncHandler(async (request, response) => {
    const { name, number } = request.body;

    if (!name) {
      throw new MissingFieldError("name");
    }
    if (!number) {
      throw new MissingFieldError("number");
    }

    const existingPerson = await Person.findOne({ name });
    if (existingPerson) {
      throw new DuplicateNameError();
    }

    const person = new Person({ name, number });
    const savedPerson = await person.save();
    response.json(savedPerson);
  }),
);

// Update an existing person's number (used when the frontend detects a
// duplicate name and the user confirms overwriting it).
app.put(
  "/api/persons/:id",
  asyncHandler(async (request, response) => {
    const { name, number } = request.body;

    if (!number) {
      throw new MissingFieldError("number");
    }

    const updatedPerson = await Person.findByIdAndUpdate(
      request.params.id,
      { name, number },
      { new: true, runValidators: true, context: "query" },
    );

    if (!updatedPerson) {
      throw new NotFoundError();
    }
    response.json(updatedPerson);
  }),
);

// Unknown Endpoint Middleware (must be registered after valid routes)
app.use(unknownEndpoint);

// Centralized error handler (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
