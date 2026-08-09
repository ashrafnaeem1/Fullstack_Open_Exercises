class ApplicationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class MissingFieldError extends ApplicationError {
  constructor(field) {
    super(`missing ${field}, the ${field} is required.`, 400);
  }
}

class DuplicateNameError extends ApplicationError {
  constructor() {
    super(
      "The requested name is already taken. Name must be unique.",
      409,
    );
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = "The requested id does not exist.") {
    super(message, 404);
  }
}

module.exports = {
  ApplicationError,
  MissingFieldError,
  DuplicateNameError,
  NotFoundError,
};
