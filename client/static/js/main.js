(() => {
  const app = {
    initialize() {
      this.TinderApi = new TinderApi();
      this.cacheElements();
      this.registerListeners();
      this.fetchUsers();
      this.users = null;
      this.currentUserId = null;
      this.currentFriendId = null;
      this.messages = null;
      this.currentMessageId = null;
      this.conversationMessages = null;
    },
    cacheElements() {
      this.$usersList = document.querySelector("#users__list");
      this.$recievedMessages = document.querySelector("#inbox__list");
      this.$sentMessages = document.querySelector("#outbox__list");
      this.$conversationList = document.querySelector("#conversation__list");
      this.$conversationForm = document.querySelector("#conversation__form");
    },
    registerListeners() {
      this.$usersList.addEventListener("click", (ev) => {
        const userId =
          ev.target.dataset.id ??
          ev.target.parentNode.dataset.id ??
          ev.target.parentNode.parentNode.dataset.id;
        this.setActiveUser(userId);
      });

      this.$recievedMessages.addEventListener("click", (ev) => {
        const messageId =
          ev.target.dataset.id ??
          ev.target.parentNode.dataset.id ??
          ev.target.parentNode.parentNode.dataset.id;
        this.setActiveMessage(messageId);
      });

      this.$sentMessages.addEventListener("click", (ev) => {
        const messageId =
          ev.target.dataset.id ??
          ev.target.parentNode.dataset.id ??
          ev.target.parentNode.parentNode.dataset.id;
        this.setActiveMessage(messageId);
      });

      this.$conversationForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        if (ev.target["conversation__form-message"].value === "")
          return window.alert("Please enter a message!");

        await this.TinderApi.addMessageBetweenUsers(
          this.currentUserId,
          this.currentFriendId,
          ev.target["conversation__form-message"].value
        );

        await this.fetchMessagesFromUser(
          this.currentUserId,
          this.currentMessageId
        );
        ev.target["conversation__form-message"].value = "";
      });
    },
    async fetchUsers() {
      this.users = await this.TinderApi.getUsers();
      this.$usersList.innerHTML = this.users
        .map(
          (user) => `
            <li class="users__list-item" data-id="${user.id}">
                <img src="${user.picture.thumbnail}" alt="Profile picture ${user.username}">
                <span class="">${user.username}</span>       
            </li>`
        )
        .join("");
      this.setActiveUser(this.users[0].id);
    },
    setActiveUser(userId) {
      this.currentUserId = userId;
      const $selectedUser = this.$usersList.querySelector(
        `.users__list-item.selected`
      );
      if ($selectedUser !== null) $selectedUser.classList.remove("selected");
      this.$usersList
        .querySelector(`.users__list-item[data-id="${userId}"]`)
        .classList.add("selected");
      this.fetchMessagesFromUser(userId);
    },
    getUserIdByMessageId(messageId) {
      // Find userId in sentMessages
      const { receiverId } =
        this.receivedMessages.find((message) => message.id === messageId) ?? {};

      // Find userId in receivedMessages
      const { senderId } =
        this.sentMessages.find((message) => message.id === messageId) ?? {};

      return senderId ?? receiverId;
    },
    getFriendIdByMessageId(messageId) {
      // Find userId in sentMessages
      const { receiverId } = this.sentMessages.find(
        (message) => message.id === messageId
      ) || { receiverId: undefined };

      // Find userId in receivedMessages
      const { senderId } = this.receivedMessages.find(
        (message) => message.id === messageId
      ) || { senderId: undefined };

      return senderId || receiverId;
    },
    async fetchMessagesFromUser(userId, returnMessage = null) {
      // Received messages
      this.receivedMessages = await this.TinderApi.getReceivedMessagesFromUser(
        userId
      );
      returnMessage =
        returnMessage === null ? this.receivedMessages[0].id : returnMessage;

      this.$recievedMessages.innerHTML = this.receivedMessages
        .map((message) => {
          const user = this.users.find((u) => u.id === message.senderId);
          return `
            <li class="messages__list-item inbox__list-item" data-id="${message.id}">
                <span class="name">${user.username}</span>
                <p class="">${message.message}</p>
            </li>`;
        })
        .join("");
      document.querySelector(
        "#inbox > .counting-box > .counting-box__counter"
      ).innerHTML = this.receivedMessages.length;

      // Sent messages
      this.sentMessages = await this.TinderApi.getSentMessagesFromUser(userId);
      this.$sentMessages.innerHTML = this.sentMessages
        .map((message) => {
          const user = this.users.find((u) => u.id === message.receiverId);
          return `
            <li class="messages__list-item outbox__list-item" data-id="${message.id}">
                <span class="name">${user.username}</span>
                <p class="">${message.message}</p>
            </li>`;
        })
        .join("");
      document.querySelector(
        "#outbox > .counting-box > .counting-box__counter"
      ).innerText = this.sentMessages.length;

      this.setActiveMessage(returnMessage);
    },
    setActiveMessage(messageId) {
      this.currentMessageId = messageId;
      const $selectedMessage = document.querySelector(
        `.messages__list-item.selected`
      );
      if ($selectedMessage !== null) {
        $selectedMessage.classList.remove("selected");
      }

      document
        .querySelector(`.messages__list-item[data-id="${messageId}"]`)
        .classList.add("selected");

      this.currentFriendId = this.getFriendIdByMessageId(messageId);

      this.fetchConversationMessages();
    },
    async fetchConversationMessages() {
      this.conversationMessages =
        await this.TinderApi.getConversationBetweenUsers(
          this.currentUserId,
          this.currentFriendId
        );

      this.$conversationList.innerHTML = this.conversationMessages
        .map((message) => {
          const userId =
            message.senderId === this.currentUserId
              ? this.getUserIdByMessageId(message.id)
              : this.getFriendIdByMessageId(message.id);
          const isUser =
            message.senderId === this.currentUserId
              ? ` conversation__list-item__self`
              : "";
          const user = this.users.find((u) => u.id === userId);
          return `
            <div class="conversation__list-item${isUser}">
                <span class="time">${moment(message.createdAt).format(
                  "MMM Do YY HH:mm"
                )}</span>
                <h1>${user.username}</h1>
                <span>${message.message}</span>
            </div>`;
        })
        .join("");
    },
  };
  app.initialize();
})();
