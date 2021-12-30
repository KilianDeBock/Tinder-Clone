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
    // Get messages from data service
    const matches = dataService.getMatches();
    // Send response back to the client.
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific match
*/
const getMatchByIds = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Get matches from a specific user
*/
const getMatchesFromUserById = (req, res, next) => {
  try {
    // Get userid params out of url.
    const { userId } = req.params;
    // Get messages from specific user
    const matches = dataService.getMatchesFromUser(userId);
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new match
*/
const createMatch = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Update a specific match
*/
const updateMatch = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Delete a specific match
*/
const deleteMatch = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

// Export the action methods = callbacks
module.exports = {
  createMatch,
  deleteMatch,
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  updateMatch,
};
