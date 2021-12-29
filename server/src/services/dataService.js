/*
Import packages
*/
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/*
Import custom packages
*/
const { HTTPError, convertArrayToPagedObject } = require("../utils");

/*
File paths
*/
const filePathMessages = path.join(__dirname, "..", "data", "messages.json");
const filePathMatches = path.join(__dirname, "..", "data", "matches.json");
const filePathUsers = path.join(__dirname, "..", "data", "users.json");

/*
Write your methods from here
*/
// Read messages.json
const readDataFromMessagesFile = () => {
  const data = fs.readFileSync(filePathMessages, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(data);
};

// Read users.json
const readDataFromUsersFile = () => {
  const data = fs.readFileSync(filePathUsers, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(data);
};

// Get all messages
const getMessages = () => {
  try {
    const messages = readDataFromMessagesFile();
    messages.sort((a, b) => a.createdAt - b.createdAt);
    return messages;
  } catch (error) {
    throw new HTTPError("Can't get messages!", 500);
  }
};

// Get all messages from user.
const getMessagesFromUser = (userId, type = null) => {
  try {
    console.log(type);
    const messages = readDataFromMessagesFile();
    // Filter array were the user id is the same.
    const userMessages =
      type === "received"
        ? messages.filter((c) => c.senderId === userId)
        : type === "sent"
        ? messages.filter((c) => c.receiverId === userId)
        : messages.filter(
            (c) => c.senderId === userId || c.receiverId === userId
          );

    if (!userMessages.length) {
      throw new HTTPError(
        `We can't find messages from the user with id ${userId}`,
        404
      );
    }
    userMessages.sort((a, b) => b.createdAt - a.createdAt);
    return userMessages;
  } catch (error) {
    throw error;
  }
};

// Get all users
const getUsers = () => {
  try {
    const users = readDataFromUsersFile();
    users.sort((a, b) => {
      if (a.username > b.username) return 1;
      else if (a.username < b.username) return -1;
      return 0;
    });
    return users;
  } catch (error) {
    throw new HTTPError("Can't get users!", 500);
  }
};

// Get user by id.
const getUserFromId = (userId) => {
  try {
    const users = readDataFromUsersFile();
    const user = users.filter((a) => a.id === userId);
    if (!user.length) {
      throw new HTTPError(`We can't find the user with id ${userId}`, 404);
    }
    return user;
  } catch (error) {
    throw new HTTPError("Can't get user!", 500);
  }
};

// Export all the methods of the data service
module.exports = {
  getMessages,
  getMessagesFromUser,
  getUsers,
  getUserFromId,
};
