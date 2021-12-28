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
      this.$sendMessages = document.querySelector("#outbox__list");
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

      this.$sendMessages.addEventListener("click", (ev) => {
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
        <li class="users__list-item">
            <a href="#" data-id="${user.id}">
                <span class="">${user.username}</span>            
            </a>
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
        .querySelector(`.users__list-item > a[data-id="${userId}"]`)
        .parentNode.classList.add("selected");
      this.fetchMessagesFromUser(userId);
    },
    async fetchMessagesFromUser(userId) {
      this.messages = await this.TinderApi.getMessagesFromUser(userId);
      this.$recievedMessages.innerHTML = this.messages.receivedMessages
        .map(
          (message) => `
        <li class="conversation__list-item inbox__list-item" data-id="${message.id}">
            <span class="name">${message.senderId}</span>
            <p class="">${message.message}</p>
        </li>`
        )
        .join("");
      this.$sendMessages.innerHTML = this.messages.sendMessages
        .map(
          (message) => `
        <li class="conversation__list-item inbox__list-item" data-id="${message.id}">
            <span class="name">${message.senderId}</span>
            <p class="">${message.message}</p>
        </li>`
        )
        .join("");
      this.setActiveMessage(this.messages.receivedMessages[0].id);
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
