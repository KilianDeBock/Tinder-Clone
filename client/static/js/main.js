(() => {
  const app = {
    initialize() {
      this.TinderApi = new TinderApi();
      this.cacheElements();
      this.registerListeners();
      this.fetchUsers();
      this.users = null;
      this.currentUserId = null;
      this.messages = null;
      this.currentMessageId = null;
    },
    cacheElements() {
      this.$usersList = document.querySelector("#users__list");
      this.$recievedMessages = document.querySelector("#inbox__list");
      this.$sentMessages = document.querySelector("#outbox__list");
      this.$messagesList = document.querySelector("#conversation__list");
    },
    registerListeners() {
      this.$usersList.addEventListener("click", (ev) => {
        const userId =
          ev.target.dataset.id ||
          ev.target.parentNode.dataset.id ||
          ev.target.parentNode.parentNode.dataset.id;
        console.log(userId);
        this.setActiveUser(userId);
      });

      this.$recievedMessages.addEventListener("click", (ev) => {
        console.log(ev.target);
        const messageId =
          ev.target.dataset.id ||
          ev.target.parentNode.dataset.id ||
          ev.target.parentNode.parentNode.dataset.id;
        console.log(messageId);
        this.setActiveMessage(messageId);
      });

      this.$sentMessages.addEventListener("click", (ev) => {
        console.log(ev.target);
        const messageId =
          ev.target.dataset.id ||
          ev.target.parentNode.dataset.id ||
          ev.target.parentNode.parentNode.dataset.id;
        console.log(messageId);
        this.setActiveMessage(messageId);
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
      if ($selectedUser !== null) {
        $selectedUser.classList.remove("selected");
      }
      this.$usersList
        .querySelector(`.users__list-item[data-id="${userId}"]`)
        .classList.add("selected");
      this.fetchMessagesFromUser(userId);
    },
    async fetchMessagesFromUser(userId) {
      // Received messages
      this.receivedMessages = await this.TinderApi.getReceivedMessagesFromUser(
        userId
      );
      this.$recievedMessages.innerHTML = this.receivedMessages
        .map((message) => {
          const user = this.users.find((u) => u.id === message.receiverId);
          return `
            <li class="conversation__list-item inbox__list-item" data-id="${message.id}">
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
          const user = this.users.find((u) => u.id === message.senderId);
          return `
            <li class="conversation__list-item inbox__list-item" data-id="${message.id}">
                <span class="name">${user.username}</span>
                <p class="">${message.message}</p>
            </li>`;
        })
        .join("");
      document.querySelector(
        "#outbox > .counting-box > .counting-box__counter"
      ).innerHTML = this.sentMessages.length;

      this.setActiveMessage(this.receivedMessages[0].id);
    },
    setActiveMessage(messageId) {
      this.currentMessageId = messageId;
      const $selectedMessage = document.querySelector(
        `.conversation__list-item.selected`
      );
      if ($selectedMessage !== null) {
        $selectedMessage.classList.remove("selected");
      }

      document
        .querySelector(`.conversation__list-item[data-id="${messageId}"]`)
        .classList.add("selected");
    },
  };
  app.initialize();
})();
