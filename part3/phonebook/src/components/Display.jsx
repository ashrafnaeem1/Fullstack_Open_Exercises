import "./styles/Display.css";

const Display = ({ personsToShow, deletePerson }) => {
  return (
    <>
      <div>
        <span className="delayInfo">
          NOTE: It may take a while to update the numbers.
          Kindly wait if any delay is found.
        </span>
      </div>
      <div>
        <h2>Numbers</h2>
        <table className="contactsTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {personsToShow.map((person) => (
              <tr key={person.name}>
                <td className="contactName">{person.name}</td>
                <td className="contactNumber">
                  {person.number}
                </td>
                <td className="actionDelete">
                  <button
                    className="deleteButton"
                    onClick={() => deletePerson(person)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Display;
