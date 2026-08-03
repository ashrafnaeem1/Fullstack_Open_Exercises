import Form from "./Form";

const PersonForm = ({
  newName,
  newNumber,
  setNewName,
  setNewNumber,
  addPerson,
}) => {
  return (
    <div>
      <h2>Add A New Person</h2>
      <Form
        newName={newName}
        newNumber={newNumber}
        handleNameChange={(e) => setNewName(e.target.value)}
        handleNumberChange={(e) => setNewNumber(e.target.value)}
        handleSubmit={addPerson}
      />
    </div>
  );
};

export default PersonForm;
