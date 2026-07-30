import "./styles/Filter.css";

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="filterForm"
    >
      <table className="filterTable">
        <tbody>
          <tr>
            <td>
              <label htmlFor="filter">
                filter shown with:{" "}
              </label>
            </td>
            <td>
              <input
                className="inputFilter"
                name="filter"
                value={filter}
                onChange={handleFilterChange}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
};

export default Filter;
