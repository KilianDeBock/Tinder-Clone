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

// Get all users
const getUsers = () => {
  try {
    const users = readDataFromUsersFile();
    // Disabled due to same view of the assignment.
    /*
    users.sort((a, b) => {
      if (a.createdAt > b.lastName) return 1;
      else if (a.lastName < b.lastName) return -1;
      return 0;
    });
    */
    return users;
  } catch (error) {
    throw new HTTPError("Can't get users!", 500);
  }
};

const getUserFromId = (userId) => {
  try {
    const users = readDataFromUsersFile();
    const user = users.filter((a) => a.id === userId);
    if (!user.length) {
      throw new HTTPError(`We can't find the user with id ${userId}`, 404);
    }
    return user[0];
  } catch (error) {
    throw new HTTPError("Can't get user!", 500);
  }
};

// Get all messages
const getMessages = () => {
  try {
    // Get messages
    const messages = readDataFromMessagesFile();
    // Sort
    messages.sort((a, b) => a.createdAt - b.createdAt);
    // Return
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

const createMessage = (message) => {
  try {
    if (!message.senderId || !message.receiverId || !message.message) {
      throw new HTTPError(
        `Cannot create message without senderId, receiverId orr message!`,
        405
      );
    }
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

const updateMessage = ({ message }, messageId) => {
  try {
    if (!messageId || !message) {
      throw new HTTPError(
        `Cannot update message without id or new message!`,
        405
      );
    }
    // Get all messages
    const messages = readDataFromMessagesFile();
    // Create a message
    const oldMessage = messages.find((e) => e.id === messageId);

    const updatedMessage = {
      ...oldMessage,
      message,
      createdAt: Date.now(),
    };

    const messageIndex = messages.findIndex((e) => e.id === messageId);
    if (messageIndex > -1) {
      messages.splice(messageIndex, 1);
      messages.push(updatedMessage);
    }

    fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));

    // Return updated message
    return updatedMessage;
  } catch (error) {
    throw error;
  }
};

// Get user by id.
const deleteMessage = (messageId) => {
  try {
    if (!messageId) {
      throw new HTTPError(`Cannot delete message without id!`, 405);
    }
    // Get all messages
    const messages = readDataFromMessagesFile();

    const messageIndex = messages.findIndex((e) => e.id === messageId);
    if (messageIndex > -1) {
      const deletedMessage = messages.splice(messageIndex, 1);
      fs.writeFileSync(filePathMessages, JSON.stringify(messages, null, 2));
      return { status: "success", deleted: { ...deletedMessage[0] } };
    }
    throw new HTTPError(`Cannot find message with id ${messageId}!`, 404);

    // Return updated message
  } catch (error) {
    throw error;
  }
};

// Get all matches
const getMatches = () => {
  try {
    const matches = readDataFromMatchesFile();
    matches.sort((a, b) => a.createdAt - b.createdAt);
    return matches;
  } catch (error) {
    throw new HTTPError("Can't get match!", 500);
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

// Get user by id.
const createMatch = (match) => {
  try {
    if (!["like", "superlike", "dislike"].includes(match.rating)) {
      throw new HTTPError(
        `You are not allowed to use any other type than: like, superlike or dislike.`,
        405
      );
    }
    if (!match.userId || !match.friendId) {
      throw new HTTPError(
        `Cannot create match without userId or friendId id!`,
        405
      );
    }
    // Get all messages
    const matches = readDataFromMatchesFile();
    // Create a message
    const matchToCreate = {
      ...match,
      createdAt: Date.now(),
    };
    matches.push(matchToCreate);
    // Write messages to messages.json
    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
    // Return created message
    return matchToCreate;
  } catch (error) {
    throw error;
  }
};

// Get user by id.
const updateMatch = ({ rating }, userId, friendId) => {
  try {
    if (!["like", "superlike", "dislike"].includes(rating)) {
      throw new HTTPError(
        `You are not allowed to use any other type than: like, superlike or dislike.`,
        405
      );
    }
    if (!userId || !friendId) {
      throw new HTTPError(
        `Cannot create match without userId or friendId id!`,
        405
      );
    }
    // Get all messages
    const matches = readDataFromMatchesFile();
    // Create a message
    const match = matches.find(
      (e) => e.userId === userId && e.friendId === friendId
    );

    const updatedMatch = {
      ...match,
      rating,
      createdAt: Date.now(),
    };

    const matchIndex = matches.findIndex(
      (e) => e.userId === userId && e.friendId === friendId
    );
    if (matchIndex > -1) {
      matches.splice(matchIndex, 1);
      matches.push(updatedMatch);
    }

    fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));

    // Return updated message
    return updatedMatch;
  } catch (error) {
    throw error;
  }
};

// Get user by id.
const deleteMatch = (userId, friendId) => {
  try {
    if (!userId || !friendId) {
      throw new HTTPError(
        `Cannot delete match without user id or friend id!`,
        405
      );
    }
    // Get all messages
    const matches = readDataFromMatchesFile();

    const matchesIndex = matches.findIndex(
      (e) => e.userId === userId && e.friendId === friendId
    );
    if (matchesIndex > -1) {
      const deletedMatch = matches.splice(matchesIndex, 1);
      fs.writeFileSync(filePathMatches, JSON.stringify(matches, null, 2));
      return { status: "success", deleted: { ...deletedMatch[0] } };
    }
    throw new HTTPError(
      `Cannot find match with userId ${userId} and friendId ${friendId}!`,
      404
    );

    // Return updated message
  } catch (error) {
    throw error;
  }
};

// Export all the methods of the data service
module.exports = {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessagesFromUser,
  getUsers,
  getUserFromId,
  getMatches,
  createMatch,
  getMatchesFromUser,
  updateMatch,
  deleteMatch,
};
