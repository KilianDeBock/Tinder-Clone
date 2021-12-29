const TINDER_BASE_PATH = "http://localhost:8888/api";

function TinderApi() {
  this.getUsers = async () => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users`);
      return await response.json();
    } catch (error) {
      console.log("An error occurred!", error);
    }
  };

  this.getReceivedMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(
        `${TINDER_BASE_PATH}/users/${userId}/messages?type=received`
      );
      return await response.json();
    } catch (error) {
      console.log("An error occurred!", error);
    }
  };

  this.getSentMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(
        `${TINDER_BASE_PATH}/users/${userId}/messages?type=sent`
      );
      return await response.json();
    } catch (error) {
      console.log("An error occurred!", error);
    }
  };

  this.getConversationBetweenUsers = async (userId, friendId) => {
    try {
      // Fetch all messages with the userId in it.
      const response = await fetch(
        `${TINDER_BASE_PATH}/users/${userId}/messages`
      );
      // Convert it to JSON.
      const allMessages = await response.json();

      // Filter the messages with only the friendId.
      const messages = allMessages.filter(
        (m) =>
          (m.senderId === friendId && m.receiverId === userId) ||
          (m.receiverId === friendId && m.senderId === userId)
      );
      // Sort the array by creation date, the oldest first.
      messages.sort((a, b) => a.createdAt - b.createdAt);

      return messages;
    } catch (error) {
      console.log("An error occurred!", error);
    }
  };

  this.addMessageBetweenUsers = async (userId, friendId, message) => {
    try {
      const messageToCreate = {
        message: message,
        senderId: userId,
        receiverId: friendId,
      };

      const response = await fetch(`${TINDER_BASE_PATH}/messages`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageToCreate),
      });

      return await response.json();
    } catch (error) {
      console.log("An error occurred!", error);
    }
  };

  this.getMatchesForUser = async (userId) => {};

  this.addMatch = async (userId, friendId, rating) => {};
}
