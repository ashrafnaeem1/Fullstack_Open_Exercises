require("dotenv").config();
const Person = require("./models/person");

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

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response
          .status(404)
          .json({ error: "The requested id does not exist." });
      }
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.countDocuments({})
    .then((headcount) => response.send(getInfo(headcount)))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name || !body.number) {
    const field = !body.name ? "name" : "number";
    return response.status(400).json({
      error: `missing ${field}, the ${field} is required.`,
    });
  }

  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        return response.status(409).json({
          error:
            "The requested name is already taken. Name must be unique.",
        });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person
        .save()
        .then((savedPerson) => response.json(savedPerson))
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

// Update an existing person's number (used when the frontend detects a
// duplicate name and the user confirms overwriting it).
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  if (!number) {
    return response.status(400).json({
      error: "missing number, the number is required.",
    });
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" },
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response
          .status(404)
          .json({ error: "The requested id does not exist." });
      }
    })
    .catch((error) => next(error));
});

// Unknown Endpoint Middleware (must be registered after valid routes)
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// Centralized error handler (must be registered last)
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response
      .status(400)
      .json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
