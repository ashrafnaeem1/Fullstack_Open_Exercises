import "./styles/Display.css";

const Display = ({ personsToShow, deletePerson }) => {
  const hashFNV1a = (str) => {
    let hash = 0x811c9dc5; // 32-bit FNV offset basis
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      // multiply by 32-bit FNV prime (16777619)
      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }
    return hash >>> 0; // return as unsigned 32-bit integer
  };

  // Generates background and text color combination
  const stringToColorCombo = (str) => {
    if (!str) {
      console.log("This so bad.");
      return { backgroundColor: "#e2e8f0", color: "#0f172a" };
    }

    const hash = Math.abs(hashFNV1a(str));
    console.log(`The hash is ${hash}`);

    // Pick hue (0-360) deterministically from the string hash
    const hue = hash % 360;
    console.log(`hue ${hue}`);

    // Use light pastels for background so text is easily readable
    const backgroundColor = `hsl(${hue}, 70%, 85%)`;
    console.log(`bgcolor ${hue}`);
    // Dark text matching the same hue tone
    const textColor = `hsl(${hue}, 80%, 20%)`;
    console.log(`txt color ${hue}`);

    return `${backgroundColor} ${textColor}`;
  };

  // Gets the style for given text.
  const getColorStyle = (text) => {
    let [bg, color] = stringToColorCombo(text).split(") h");
    bg = bg + ")";
    color = "h" + color;
    const style_out = { backgroundColor: bg, color: color };
    console.log(
      `HERE: ${style_out.backgroundColor} ${style_out.color}`,
    );
    return style_out;
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
