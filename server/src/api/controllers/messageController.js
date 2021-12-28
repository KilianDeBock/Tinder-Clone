/*
Import custom packages
*/
const dataService = require("../../services/dataService");
const { HTTPError, handleHTTPError } = require("../../utils");

/*
Get all messages
*/
const getMessages = (req, res, next) => {
  try {
    // Get messages from data service
    const messages = dataService.getMessages();
    // Send response back to the client.
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific message
*/
const getMessageById = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Get messages from a specific user
*/
const getMessagesFromUserById = (req, res, next) => {
  try {
    // Get userid params out of url.
    const { userId } = req.params;
    // Get messages from specific user
    const messages = dataService.getMessagesFromUser(userId);
    res.status(200).json(messages);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new message
*/
const createMessage = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Update a specific message
*/
const updateMessage = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

/*
Delete a specific message
*/
const deleteMessage = (req, res, next) => {
  handleHTTPError(
    new HTTPError("The action method is not yet implemented!", 501),
    next
  );
};

// Export the action methods = callbacks
module.exports = {
  createMessage,
  deleteMessage,
  getMessages,
  getMessageById,
  getMessagesFromUserById,
  updateMessage,
};
