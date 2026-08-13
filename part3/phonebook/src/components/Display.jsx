import "./styles/Display.css";

const Display = ({ personsToShow, deletePerson }) => {
  // Hashes a string into a consistent integer
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  // Generates background and text color combination
  const stringToColorCombo = (str) => {
    if (!str)
      return { backgroundColor: "#e2e8f0", color: "#0f172a" };

    const hash = Math.abs(hashString(str));

    // Pick hue (0-360) deterministically from the string hash
    const hue = hash % 360;

    // Use light pastels for background so text is easily readable
    const backgroundColor = `hsl(${hue}, 70%, 85%)`;
    // Dark text matching the same hue tone
    const textColor = `hsl(${hue}, 80%, 20%)`;

    return `${backgroundColor} ${textColor}`;
  };

  // Gets the style for given text.
  const getColorStyle = (text) => {
    const [bg, color] = stringToColorCombo(text).split(" ");
    return { backgroundColor: bg, color: color };
  };

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
              <tr
                key={person.name}
                style={{
                  ...getColorStyle(person.name),
                }}
              >
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
