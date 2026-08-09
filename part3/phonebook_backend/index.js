require("dotenv").config();
const Person = require("./models/person");

const express = require("express");
const morgan = require("morgan");
const axios = require("axios");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
  ),
);

let persons = [];

const getInfo = () => {
  const headcount = persons.length;
  const date = new Date().toString();
  return `<p>Phonebook has info for ${headcount} people.</p><p>${date}</p>`;
};

// Routes
app.get("/", (request, response) => {
  response.send(
    "<h1>If you are seeing this message then frontend integration is faulty.</h1>",
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response
      .status(404)
      .json({ error: "The requested id does not exist." });
  }
});

app.get("/info", (request, response) => {
  response.send(getInfo());
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  let okay = false;
  Person.findByIdAndDelete(id).then((result) => {
    okay = true;
  });

  if (okay) {
    persons = persons.filter((p) => p.id !== id);
    response.status(204).end();
  } else {
    console.log(
      `An error occured while deleting person with id=${id}`,
    );
  }
});

const generateId = () => {
  const max = 1000000;
  let newId;
  do {
    newId = String(Math.floor(Math.random() * max));
  } while (persons.some((p) => p.id === newId));
  return newId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    const field = !body.name ? "name" : "number";
    return response.status(400).json({
      error: `missing ${field}, the ${field} is required.`,
    });
  }

  if (persons.find((p) => p.name === body.name)) {
    return response.status(409).json({
      error:
        "The requested name is already taken. Name must be unique.",
    });
  }

  const personObject = {
    name: body.name,
    number: body.number,
  };
  const person = new Person(personObject);

  person
    .save()
    .then((savedPerson) => {
      persons = persons.concat(personObject);
      response.json(savedPerson);
    })
    .catch(() => {
      console.log("Something bad happened.");
    });
});

// Unknown Endpoint Middleware (must be registered after valid routes)
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

axios
  .get(`http://localhost:${PORT}/api/persons`)
  .then((response) => (persons = response.data));
