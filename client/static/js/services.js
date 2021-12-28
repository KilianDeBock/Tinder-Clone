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

  this.getMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(
        `${TINDER_BASE_PATH}/users/${userId}/messages`
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
