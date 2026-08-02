const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(express.json());

// newly created token, `:body`
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

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
const getIds = () => [...persons.map((person) => person.id)];

const getInfo = () => {
  const headcount = persons.length;
  const date = Date().toString();

  const info = `<p>Phonebook has info for ${headcount} people.</p>
                <p>${date}</p>`;

  return info;
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.statusMessage = "The requested id does not exist.";
    response.status(404).end();
  }
});

app.get("/info", (request, response) => {
  const info = getInfo();
  response.send(info);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const old_copy = persons;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const max = 1000000;
  let newId;

  // Keep generating a new ID as long as it exists in the phonebook
  do {
    newId = String(Math.floor(Math.random() * max));
  } while (persons.some((person) => person.id === newId));

  return newId;
};

app.post("/api/persons/", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    const field = !body.name ? "name" : "number";
    return response.status(400).json({
      error: `missing ${field}, the ${field} is required.`,
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(409).json({
      error:
        "The requested name is already taken. Name must be unique.",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number || "",
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

let __requestLogger_log_serial_number__ = 0;
function requestLogger(request, response, next) {
  console.log("--- [ Request ] ---");
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log(
    "Serial No.:",
    __requestLogger_log_serial_number__,
  );
  console.log("--- [ END LOG ] ---");

  __requestLogger_log_serial_number__ += 1;
  next();
}
