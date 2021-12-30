/*
Import packages
*/
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

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

// Read matches.json
const readDataFromMatchesFile = () => {
  const data = fs.readFileSync(filePathMatches, {
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
const getMessagesFromUser = (userId, type, friendId) => {
  try {
    const data = readDataFromMessagesFile();

    // Filter array were the user id is the same.
    let messages = data.filter(
      (c) => c.receiverId === userId || c.senderId === userId
    );

    if (type === "received") {
      messages = data.filter((c) => c.receiverId === userId);
    } else if (type === "sent") {
      messages = data.filter((c) => c.senderId === userId);
    } else if (type === "conversation") {
      messages = data.filter(
        (m) =>
          (m.senderId === friendId && m.receiverId === userId) ||
          (m.receiverId === friendId && m.senderId === userId)
      );
    }

    if (!messages.length) {
      throw new HTTPError(
        `We can't find messages from the user with id ${userId}`,
        404
      );
    }
    messages.sort((a, b) => b.createdAt - a.createdAt);
    return messages;
  } catch (error) {
    throw error;
  }
};

// Get all users
const getUsers = () => {
  try {
    const users = readDataFromUsersFile();
    // // Disabled due to same view of the assignment.
    // users.sort((a, b) => {
    //   if (a.createdAt > b.lastName) return 1;
    //   else if (a.lastName < b.lastName) return -1;
    //   return 0;
    // });
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

// Get user by id.
const createMessage = (message) => {
  try {
    // Get all messages
    const messages = readDataFromMessagesFile();
    // Create a message
    const messageToCreate = {
      ...message,
      id: uuid(),
      createdAt: Date.now(),
    };
    messages.push(messageToCreate);
    // Write messages to messages.json
    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
    // Return created message
    return messageToCreate;
  } catch (error) {
    throw new HTTPError(`Can't create new message!`, 501);
  }
};

// Get all matches
const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();
    matches.sort((a, b) => a.createdAt - b.createdAt);
    return matches;
  } catch (error) {
    throw new HTTPError("Can't get messages!", 500);
  }
};

// Get all messages from user.
const getMatchesFromUser = (userId) => {
  try {
    const data = readDataFromMatchesFile();
    // Filter array were the user id is the same.
    const matches = data.filter(
      (m) => m.friendId === userId || m.userId === userId
    );

    if (!matches.length) {
      throw new HTTPError(
        `We can't find matches from the user with id ${userId}`,
        404
      );
    }
    matches.sort((a, b) => b.createdAt - a.createdAt);
    return matches;
  } catch (error) {
    throw error;
  }
};

// Export all the methods of the data service
module.exports = {
  getMessages,
  createMessage,
  getMessagesFromUser,
  getUsers,
  getUserFromId,
  getMatches,
  getMatchesFromUser,
};
