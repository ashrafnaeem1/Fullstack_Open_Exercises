import "./styles/Display.css";

const Display = ({ personsToShow, deletePerson }) => {
  /**
   * MurmurHash3 (32-bit) – excellent distribution, fast, deterministic.
   */
  const hashMurmur3 = (key, seed = 0) => {
    let k,
      h = seed;
    const remainder = key.length & 3;
    const bytes = key.length - remainder;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;

    for (let i = 0; i < bytes; i += 4) {
      k =
        (key.charCodeAt(i) & 0xff) |
        ((key.charCodeAt(i + 1) & 0xff) << 8) |
        ((key.charCodeAt(i + 2) & 0xff) << 16) |
        ((key.charCodeAt(i + 3) & 0xff) << 24);

      k = Math.imul(k, c1);
      k = (k << 15) | (k >>> 17);
      k = Math.imul(k, c2);

      h ^= k;
      h = (h << 13) | (h >>> 19);
      h = Math.imul(h, 5) + 0xe6546b64;
    }

    k = 0;
    switch (remainder) {
      case 3:
        k ^= (key.charCodeAt(bytes + 2) & 0xff) << 16;
      /* fallthrough */
      case 2:
        k ^= (key.charCodeAt(bytes + 1) & 0xff) << 8;
      /* fallthrough */
      case 1:
        k ^= key.charCodeAt(bytes) & 0xff;
        k = Math.imul(k, c1);
        k = (k << 15) | (k >>> 17);
        k = Math.imul(k, c2);
        h ^= k;
    }

    h ^= key.length;
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;

    return h >>> 0;
  };

  // Generates background and text color combination
  const stringToColorCombo = (str) => {
    if (!str) {
      console.log("This so bad.");
      return { backgroundColor: "#e2e8f0", color: "#0f172a" };
    }

    const hash = Math.abs(hashMurmur3(str));
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
