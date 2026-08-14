import { useState, useEffect } from "react";
import "./App.css";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Display from "./components/Display";
import personService from "./services/personService";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  useEffect(() => {
    personService.getAll().then((data) => setPersons(data));
  }, []);

  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const [filter, setFilter] = useState("");

  const [status, setStatus] = useState("");
  const [notification, setNotification] = useState("hello");

  const updatePerson = (existingPerson) => {
    const updatedPersonObject = {
      ...existingPerson,
      number: newNumber,
    };

    personService
      .update(existingPerson.id, updatedPersonObject)
      .then((returnedPerson) => {
        setPersons(
          persons.map((p) =>
            p.id !== existingPerson.id ? p : returnedPerson,
          ),
        );

        setStatus("success");
        setNotification(
          `Successfully changed number of "${returnedPerson.name}".`,
        );

        setNewName("");
        setNewNumber("");
      })
      .catch((error) => {
        setStatus("error");
        // E:404 content not found.
        if (error.response && error.response.status === 404) {
          // Person was deleted on the server (e.g. by another
          // client/instance) after this page loaded its copy of persons list.
          setPersons(
            // correct the local copy of persons array.
            persons.filter((p) => p.id !== existingPerson.id),
          );
          setNotification(
            `Information of "${existingPerson.name}" has already been removed from server.`,
          );
        } else {
          setNotification(
            `Failed to update "${existingPerson.name}".`,
          );
        }
      });
  };

  const addNewPerson = () => {
    // logic handling addition of an actual new person.
    const person = {
      name: newName,
      number: newNumber,
    };

    personService
      .create(person)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setStatus("success");
        setNotification(
          `Added "${returnedPerson.name}" successfully.`,
        );
        setNewName("");
        setNewNumber("");
      })
      .catch((error) => {
        setStatus("error");
        setNotification(
          error.response?.data?.error ||
            `Failed to add "${person.name}".`,
        );
      });
  };

  const handleAddPersonForm = (event) => {
    event.preventDefault();

    if (!newName || !newNumber) {
      setStatus("error");
      setNotification(
        "Cannot submit a contact with an empty name or number.",
      );
      console.log(
        "Prevented attempt to submit an empty name or number.",
      );
      return;
    }

    const existingPerson = persons.find(
      (p) =>
        p.name.strip().toLowerCase() ===
        newName.strip().toLowerCase(),
    );

    if (existingPerson) {
      const confirmed = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`,
      );

      if (confirmed) {
        updatePerson(existingPerson);
      }
    }
    // make sure to keep addNewPerson() in else block.
    // otherwise addNewPerson() on pre-existing entries too.
    else {
      addNewPerson();
    }
  };

  const deletePerson = (person) => {
    if (!person.id) {
      console.log(
        `person ${person} doesn't seem like a valid person object.`,
      );
      return;
    }
    personService.remove(person.id);
    const updatedPersons = persons.filter(
      (p) => p.id !== person.id,
    );
    setPersons(updatedPersons);
    setStatus("success");
    setNotification(`Successfully removed "${person.name}".`);
  };

  const personsToShow = persons.filter(
    (person) =>
      person.name
        .toLowerCase()
        .includes(filter.toLowerCase()) ||
      filter.toLowerCase().includes(person.name.toLowerCase()),
  );

  return (
    <>
      <h1 className="headingAppName">Phonebook</h1>

      <Notification message={notification} status={status} />

      <Filter
        filter={filter}
        handleFilterChange={(e) => setFilter(e.target.value)}
      />

      <PersonForm
        newName={newName}
        newNumber={newNumber}
        setNewName={setNewName}
        setNewNumber={setNewNumber}
        handleSubmit={handleAddPersonForm}
      />

      <Display
        personsToShow={personsToShow}
        deletePerson={deletePerson}
      />
    </>
  );
};

export default App;
