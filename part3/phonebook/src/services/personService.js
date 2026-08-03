import axios from "axios";
const base_url = "http://localhost:3001/api/persons";

const getAll = () => {
  const request = axios.get(`${base_url}`);
  return request.then((response) => response.data);
};

const create = (newPersonObject) => {
  const request = axios.post(base_url, newPersonObject);
  return request.then((response) => response.data);
};

const update = (id, newPersonObject, fallback) => {
  return axios
    .put(`${base_url}/${id}`, newPersonObject)
    .then((response) => response.data)
    .catch((error) => fallback(error));
};

const remove = (id) => {
  const request = axios.delete(`${base_url}/${id}`);
  return request;
};

export default { getAll, create, update, remove };
