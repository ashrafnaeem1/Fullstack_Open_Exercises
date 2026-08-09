import { useState, useEffect } from "react";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Display from "./components/Display";
import personService from "./services/personService";
import Notification from "./components/Notification";

import "./App.css";

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

    if (!newName) {
      setNotification(
        "Cannot submit a contact with an empty name.",
      );
      setStatus("error");
      console.log("Prevented attempt to submit an empty name.");
      return;
    }

    // prettier-ignore-start
    if (persons.some((p) => p.name === newName)) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one.`,
        )
      ) {
        let person = null;
        const index = persons.map((p, i) => {
          if (p.name === newName) {
            person = p;
            return i;
          }
        });
        const updatedPerson = {
          ...person,
          number: newNumber,
        };
        if (person) {
          console.log(
            `updating db ${updatedPerson.name} to ${updatedPerson.number}`,
          );
          personService.update(
            person.id,
            updatedPerson,
            (error) => {
              setNotification(
                `Information of "${person.name}" has already been removed from server.`,
              );
              setStatus("error");
              console.log(
                "An attempt to change a number that has been deleted from database has been detected.",
              );
              console.log(
                `The following exception has been caught:\n${error}`,
              );
            },
          );
          setNotification(
            `Successfully changed number of "${person.name}".`,
          );
          setStatus("success");
          const persons_copy = [...persons];
          persons_copy[index] = updatedPerson;
          console.log(persons_copy[index]);
          setPersons(persons_copy);
        }
      }
      return;
    }
    // prettier-ignore-end

    const maxId =
      persons.length > 0
        ? Math.max(...persons.map((p) => Number(p.id)))
        : 0;

    const person = {
      name: newName,
      number: newNumber,
      id: String(maxId + 1),
    };

    personService.create(person).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
      setNotification(`Added "${person.name}" successfully.`);
      setStatus("success");
      setNewName("");
      setNewNumber("");
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
    setNotification(`Successfully removed "${person.name}".`);
    setStatus("success");
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
        ?<Notification message={notification} status={status}/>
        :<></>
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

      <p>
        <span className="delayNotice">
          Note that it may take some while to show/update
          contacts/persons-list.
        </span>
      </p>

      <Display
        personsToShow={personsToShow}
        deletePerson={deletePerson}
      />
    </>
  );
};

export default App;
