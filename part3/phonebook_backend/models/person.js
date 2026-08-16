const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_APP_NAME = process.env.DB_APP_NAME;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/phonebook?retryWrites=true&w=majority&appName=${DB_APP_NAME}`;

console.log("connecting to", get_masked_uri());
mongoose
  .connect(uri, { family: 4 })

  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [
      3,
      "\nName must be atleast 3 characters long.\n",
    ],
  },
  number: {
    type: String,
    validate: [
      (num) => /^(\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(num),
      "\n" +
        "The number must be of format dd-ddddddX or ddd-dddddX,                   \n" +
        "where d represents a mandatory digit,                                    \n" +
        "there are a total of atleast eight digits in any valid number            \n" +
        "and there are only either two or either three digits before the hyphen.  \n" +
        "Then the hyphen '-' represents a literal hyphen '-'.                     \n" +
        "And X represents an arbitary number of [optional] more digits.           \n" +
        "For eg. 09-1234556 and 040-22334455 are valid phone numbers but          \n" +
        "eg. 1234556, 1-22334455 and 10-22-334455 are invalid.                    \n",
    ],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);

function get_masked_uri() {
  let output_uri = uri;
  [DB_HOST, DB_USER, DB_PASS, DB_APP_NAME].forEach(
    (confidential) =>
      (output_uri = output_uri.replaceAll(
        confidential,
        "[CONFIDENTIAL]",
      )),
  );
  return output_uri;
}
