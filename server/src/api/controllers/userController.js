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
    // Get users from data service
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
    // Get searchParams out of url
    const { userId } = req.params;
    // Get user
    const user = dataService.getUserFromId(userId);
    // Send response back to the client.
    res.status(200).json(user);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  getUsers,
  getUserById,
};
