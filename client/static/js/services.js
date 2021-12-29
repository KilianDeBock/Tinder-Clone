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

  this.getConversationBetweenUsers = async (userId, friendId) => {};

  this.addMessageBetweenUsers = async (userId, friendId, message) => {};

  this.getMatchesForUser = async (userId) => {};

  this.addMatch = async (userId, friendId, rating) => {};
}
