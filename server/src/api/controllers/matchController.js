/*
Import custom packages
*/
const dataService = require("../../services/dataService");
const { HTTPError, handleHTTPError } = require("../../utils");

/*
Get all matches
*/
const getMatches = (req, res, next) => {
  try {
    // Get matches
    const matches = dataService.getMatches();
    // Send response back to the client.
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get matches from a specific user
*/
const getMatchesFromUserById = (req, res, next) => {
  try {
    // Get params out of url
    const { userId } = req.params;
    // Get matches
    const matches = dataService.getMatchesFromUser(userId);
    // Send response back to the client.
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new match
*/
const createMatch = (req, res, next) => {
  try {
    // Get http body
    const match = req.body;
    // Create match
    const createdMatch = dataService.createMatch(match);
    // Send response
    res.status(201).json(createdMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific match
*/
const updateMatch = (req, res, next) => {
  try {
    // Get body
    const match = req.body;
    // Get params
    const { senderId, receiverId } = req.params;
    // Update match
    const updatedMatch = dataService.updateMatch(match, senderId, receiverId);
    // Send response
    res.status(201).json(updatedMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Delete a specific match
*/
const deleteMatch = (req, res, next) => {
  try {
    // Get params
    const { senderId, receiverId } = req.params;
    // Delete matches
    const deletedMatch = dataService.deleteMatch(senderId, receiverId);
    // Send response
    res.status(200).json(deletedMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

// Export the action methods = callbacks
module.exports = {
  createMatch,
  deleteMatch,
  getMatches,
  getMatchesFromUserById,
  updateMatch,
};
