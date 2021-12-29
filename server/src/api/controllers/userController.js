/*
Import custom packages
*/
const dataService = require("../../services/dataService");
const { HTTPError, handleHTTPError } = require("../../utils");

/*
Get all users
*/
const getUsers = (req, res, next) => {
  try {
    // Get messages from data service
    const users = dataService.getUsers();
    // Send response back to the client.
    res.status(200).json(users);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific user
*/
const getUserById = (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = dataService.getUserFromId(userId);
    // Send response back to the client.
    res.status(200).json(user);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new user
*/
const createUser = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Update a specific user
*/
const updateUser = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Delete a specific user
*/
const deleteUser = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

// Export the action methods = callbacks
module.exports = {
  createUser,
  deleteUser,
  getUsers,
  getUserById,
  updateUser,
};
