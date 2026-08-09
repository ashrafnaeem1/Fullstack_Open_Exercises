import { useState, useEffect } from "react";
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
  const [notification, setNotification] = useState("hello");
  const [status, setStatus] = useState("");

  const addPerson = (event) => {
    event.preventDefault();

    if (!newName || !newNumber) {
      setNotification(
        "Cannot submit a contact with an empty name or number.",
      );
      setStatus("error");
      console.log(
        "Prevented attempt to submit an empty name or number.",
      );
      return;
    }

    const existingPerson = persons.find(
      (p) => p.name === newName,
    );

    if (existingPerson) {
      const confirmed = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`,
      );

      if (!confirmed) {
        return;
      }

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
          if (error.response && error.response.status === 404) {
            // Person was deleted on the server (e.g. by another
            // client/instance) after this page loaded its list.
            setPersons(
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

      return;
    }

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

  const deletePerson = (person) => {
    if (!person.id) {
      console.log(
        `person {${person}} doesn't seem like a valid person object.`,
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

  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <>
      <h1>Phonebook</h1>

      {
        // prettier-ignore
        notification
          ? <Notification message={notification} status={status} />
          : <></>
      }

      <Filter
        filter={filter}
        handleFilterChange={(e) => setFilter(e.target.value)}
      />

      <PersonForm
        newName={newName}
        newNumber={newNumber}
        setNewName={setNewName}
        setNewNumber={setNewNumber}
        addPerson={addPerson}
      />

      <Display
        personsToShow={personsToShow}
        deletePerson={deletePerson}
      />
    </>
  );
};

export default App;
