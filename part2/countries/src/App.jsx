import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { use } from "react";

const API_URL =
  "https://studies.cs.helsinki.fi/restcountries/api/all";
const MAX_MATCHES_THRESHOLD = 10;

const App = () => {
  const [countriesData, setCountriesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => setCountriesData(response.data));
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchingCountries = countriesData
    .map((country) => country.name.common)
    .filter((name) =>
      name.toLowerCase().startsWith(normalizedQuery),
    );

  const hasMatches = matchingCountries.length > 0;
  const hasTooManyMatches =
    matchingCountries.length > MAX_MATCHES_THRESHOLD;
  const showList = !hasTooManyMatches && hasMatches;
  const hasExactMatch = matchingCountries.length === 1;

  const noticeMessage = hasTooManyMatches
    ? "Too many matches, specify another filter."
    : !hasMatches
      ? "Did not find any country matching your query."
      : "";

  const handleShowCountry = (country) => {
    console.log("Pressed `Show` for india.", country);
    setSearchQuery(country);
  };

  return (
    <>
      <CountrySearch
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Notice message={noticeMessage} />

      {showList && !hasExactMatch && (
        <CountriesTable
          countries={matchingCountries}
          RowElement={CountryRowWithShowButton}
          handleShowCountry={handleShowCountry}
        />
      )}

      {hasExactMatch && (
        <Display
          country={matchingCountries[0]}
          countriesData={countriesData}
        />
      )}
    </>
  );
};

const Display = ({ country, countriesData }) => {
  const countryData = countriesData.find(
    (item) =>
      item.name.common.trim().toLowerCase() ===
      country.trim().toLowerCase(),
  );
  const capital = countryData.capital?.at(0);
  const area = countryData.area;
  const languages_object = countryData.languages;
  const flags_object = countryData.flags;
  const flag_urls = Object.values(flags_object).filter((val) =>
    val.startsWith("http"),
  );
  const flag_url = flag_urls?.at(0);

  return (
    <main>
      <h1>{country}</h1>
      <p className="countryCapital">Capital: {capital}</p>
      <p className="countryArea">Area: {area}</p>

      <h2>Languages</h2>
      <ul className="languageList">
        {Object.values(languages_object).map((lang, i) => (
          <li key={lang + " " + i.toString()}>{lang}</li>
        ))}
      </ul>
      <img
        src={flag_url}
        alt={`${country}'s flag.`}
        className="countryFlag"
      />
      <Weather capital={capital} />
    </main>
  );
};

const Weather = ({ capital }) => {
  const [weather, setWeather] = useState(null);
  // Track loading based on whether we have capital and haven't loaded weather yet
  const [loading, setLoading] = useState(Boolean(capital));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!capital) return;

    let isMounted = true; // Cleanup flag to prevent updates on unmounted components
    const apiKey = import.meta.env.VITE_SOME_KEY;
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`;

    axios
      .get(apiURL)
      .then((response) => {
        if (isMounted) {
          setWeather(response.data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch weather data:", err);
          setError("Could not load weather information.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false; // Clean up on unmount or when 'capital' changes
    };
  }, [capital]);

  if (!capital)
    return <div>Please provide a capital city.</div>;
  if (loading) return <div>Loading weather...</div>;
  if (error) return <div>{error}</div>;
  if (!weather) return null;

  const iconName = weather.weather[0].icon;
  const weatherImage = `https://openweathermap.org/img/wn/${iconName}@2x.png`;

  return (
    <div>
      <h2>Weather in {capital}</h2>
      <p>Temperature: {weather.main.temp} °C</p>
      <img
        src={weatherImage}
        alt={weather.weather[0].description}
        className="weatherIcon"
      />
      <p>Wind: {weather.wind.speed} m/s</p>
    </div>
  );
};

const Notice = ({ message }) => {
  if (!message) return null;

  return <div className="notice">{message}</div>;
};

const CountrySearch = ({ value, onChange }) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="countrySearch">find countries: </label>
      <input
        id="countrySearch"
        name="countrySearch"
        type="text"
        value={value}
        onChange={onChange}
      />
    </form>
  );
};

const CountriesTable = ({
  countries,
  RowElement,
  handleShowCountry,
}) => {
  return (
    <table className="countryTableWithShowButtons">
      <tbody>
        {countries.map((country) => (
          <RowElement
            country={country}
            handleShowCountry={handleShowCountry}
            key={country}
          />
        ))}
      </tbody>
    </table>
  );
};

const CountryRowWithShowButton = ({
  country,
  handleShowCountry,
}) => {
  return (
    <tr className="countryRow">
      <td className="countryNameCell">
        <span className="countryName">{country}</span>
      </td>
      <td className="showButtonCell">
        <button
          className="showButton"
          onClick={() => handleShowCountry(country)}
        >
          Show
        </button>
      </td>
    </tr>
  );
};

export default App;
