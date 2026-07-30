import "./styles/Form.css";
const Form = ({
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="personInputForm">
      <table className="inputTable">
        <tbody>
          <tr>
            <td>
              <label htmlFor="nameInput">Name: </label>
            </td>
            <td>
              <input
                className="nameInput"
                name="nameInput"
                value={newName}
                onChange={handleNameChange}
              />
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="numberInput">Number: </label>
            </td>
            <td>
              <input
                className="numberInput"
                name="numberInput"
                value={newNumber}
                onChange={handleNumberChange}
              />
            </td>
          </tr>
          <tr>
            <td></td>
            <td className="submitContactButtonCell">
              <button
                className="submitContactButton"
                type="submit"
              >
                Add Contact
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
};

export default Form;
