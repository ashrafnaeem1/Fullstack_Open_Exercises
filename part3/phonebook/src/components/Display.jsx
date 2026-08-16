import { useState, useEffect, useRef } from "react";
import "./styles/Display.css";

const POKEMON_BASE_HUES = {
  black: { hue: 220, sat: 15, light: 30 },
  blue: { hue: 210, sat: 70, light: 82 },
  brown: { hue: 25, sat: 55, light: 75 },
  gray: { hue: 210, sat: 10, light: 80 },
  green: { hue: 130, sat: 65, light: 80 },
  pink: { hue: 330, sat: 75, light: 85 },
  purple: { hue: 270, sat: 65, light: 82 },
  red: { hue: 0, sat: 75, light: 82 },
  white: { hue: 210, sat: 10, light: 95 },
  yellow: { hue: 50, sat: 85, light: 80 },
};

const Display = ({ personsToShow, deletePerson }) => {
  const [personStyles, setPersonStyles] = useState({});
  const styleCache = useRef({});

  const hashFNV1a = (str) => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }
    return hash >>> 0;
  };

  const getFallbackStyle = (str) => {
    if (!str) {
      return { backgroundColor: "#e2e8f0", color: "#0f172a" };
    }
    const hash = Math.abs(hashFNV1a(str));
    const hue = hash % 360;
    return {
      backgroundColor: `hsl(${hue}, 70%, 85%)`,
      color: `hsl(${hue}, 80%, 20%)`,
    };
  };

  const getPokemonShadeStyle = (colorName, str) => {
    const base = POKEMON_BASE_HUES[colorName];
    if (!base) {
      return getFallbackStyle(str);
    }

    const hash = Math.abs(hashFNV1a(str));
    const hueShift = (hash % 21) - 10;
    const satShift = (hash % 15) - 7;
    const lightShift = ((hash >> 2) % 11) - 5;

    const finalHue = (base.hue + hueShift + 360) % 360;
    const finalSat = Math.max(
      10,
      Math.min(100, base.sat + satShift),
    );
    const finalLight = Math.max(
      20,
      Math.min(95, base.light + lightShift),
    );

    const textColor =
      finalLight > 50
        ? `hsl(${finalHue}, ${finalSat}%, 20%)`
        : `hsl(${finalHue}, ${finalSat}%, 90%)`;

    return {
      backgroundColor: `hsl(${finalHue}, ${finalSat}%, ${finalLight}%)`,
      color: textColor,
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchColors = async () => {
      let cacheUpdated = false;

      for (const person of personsToShow) {
        if (!person.name || styleCache.current[person.name]) {
          continue;
        }

        const queryName = person.name.trim().toLowerCase();

        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${queryName}`,
          );

          if (!response.ok) {
            styleCache.current[person.name] = getFallbackStyle(
              person.name,
            );
            cacheUpdated = true;
            continue;
          }

          const data = await response.json();
          const colorName = data?.color?.name;

          styleCache.current[person.name] =
            getPokemonShadeStyle(colorName, person.name);
          cacheUpdated = true;
        } catch {
          styleCache.current[person.name] = getFallbackStyle(
            person.name,
          );
          cacheUpdated = true;
        }
      }

      if (cacheUpdated && isMounted) {
        setPersonStyles({ ...styleCache.current });
      }
    };

    fetchColors();

    return () => {
      isMounted = false;
    };
  }, [personsToShow]);

  const getStyleForPerson = (name) => {
    return personStyles[name] || getFallbackStyle(name);
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
                style={getStyleForPerson(person.name)}
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
