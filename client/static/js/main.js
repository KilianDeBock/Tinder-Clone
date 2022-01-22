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
      this.$searchBox = document.querySelector("#conversation__form-message");
      this.$conversationList = document.querySelector("#conversation__list");
      this.$conversationForm = document.querySelector("#conversation__form");
      this.$match = document.querySelector("#matches");
      this.$noMatchList = document.querySelector("#no-match__list");
      this.$matchList = document.querySelector("#match__list");
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

      this.$conversationForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        this.postMessages(ev.target["conversation__form-message"]);
      });
      this.$searchBox.addEventListener("keydown", (ev) => {
        if (ev.keyCode === 13) this.postMessages(ev.target);
      });

      this.$match.addEventListener("click", async (ev) => {
        const allowedRatings = ["dislike", "like", "superlike"],
          target = ev.target,
          rating = target.dataset.rating,
          parent = target.parentNode,
          friendId = parent.parentNode.dataset.user;
        if (
          parent.classList.contains("js__rating-pending") &&
          allowedRatings.some((c) => rating === c)
        ) {
          await this.TinderApi.addMatch(this.currentUserId, friendId, rating);

          await this.fetchMessagesFromUser(
            this.currentUserId,
            this.currentMessageId
          );
        } else if (allowedRatings.some((c) => rating === c)) {
          await this.TinderApi.updateMatch(
            this.currentUserId,
            friendId,
            rating
          );

          await this.fetchMessagesFromUser(
            this.currentUserId,
            this.currentMessageId
          );
        }
      });
    },
    async postMessages(messageBox) {
      if (messageBox.value === "")
        return window.alert("Please enter a message!");

      await this.TinderApi.addMessageBetweenUsers(
        this.currentUserId,
        this.currentFriendId,
        messageBox.value
      );

      await this.fetchMessagesFromUser(
        this.currentUserId,
        this.currentMessageId
      );
      messageBox.value = "";
    },
    async fetchUsers() {
      this.users = await this.TinderApi.getUsers();
      this.$usersList.innerHTML = this.users
        .map(
          (user) => `
            <li class="users__list-item" data-id="${user.id}">
                <img src="${user.picture.thumbnail}" alt="Profile picture ${user.username}">
                <span>${user.firstName} ${user.lastName}</span>       
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
      this.receivedMessages.sort((a, b) => b.createdAt - a.createdAt);

      this.$recievedMessages.innerHTML = this.receivedMessages
        .map((message) => {
          const user = this.users.find((u) => u.id === message.senderId);
          return `
            <li class="messages__list-item inbox__list-item" data-id="${message.id}">
                <span class="name">${user.firstName} ${user.lastName}</span>
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
                <span class="name">${user.firstName} ${user.lastName}</span>
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
      this.fetchMatches();
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
                <h1>${user.firstName} ${user.lastName}</h1>
                <span>${message.message}</span>
            </div>`;
        })
        .join("");
    },
    async fetchMatches() {
      // Get all matches
      this.matches = await this.TinderApi.getMatchesForUser(this.currentUserId);

      this.matches.sort((a, b) => a.createdAt - b.createdAt);

      // Check duplicates function.
      const checkDuplicates = (a) =>
        this.matches.filter(
          (b) => a.friendId === b.userId && a.userId === b.friendId
        );
      // Find complete matches.
      const completeMatches = this.matches.filter(
        (a) => checkDuplicates(a).length !== 0
      );
      // Find single matches.
      const singleMatches = this.matches.filter(
        (a) => checkDuplicates(a).length === 0
      );

      // add it to the html.
      this.$matchList.innerHTML =
        singleMatches.map((m) => this.buildMatches(m)).join("") +
        completeMatches
          .map((m) => this.buildMatches(m, completeMatches))
          .join("");

      // Find all no matches.
      const noMatches = this.users.filter(
        (user) =>
          this.matches.filter(
            (match) => user.id === match.userId || user.id === match.friendId
          ).length === 0
      );

      this.$noMatchList.innerHTML = noMatches
        .map((user) => {
          return `
            <li class="match__list-item" data-user="${user.id}">
                <div class="match__list-item__user-info">
                  <img src="${user.picture.medium}" alt="${user.username}'s profile picture.">
                  <div>
                    <span>${user.firstName} ${user.lastName}</span>
                  </div>
                </div>
                <div class="match__list-item__rating js__rating-pending">
                    <span class="match__list-item__rating-dislike" data-rating="dislike"></span>
                    <span class="match__list-item__rating-like" data-rating="like"></span>
                    <span class="match__list-item__rating-superlike" data-rating="superlike"></span>
                </div>
            </li>`;
        })
        .join("");
    },
    buildMatches(match, complete = null) {
      if (complete && match.userId === this.currentUserId) return;
      else if (complete) {
        const otherUser = complete.find((e) => e.friendId === match.userId);
        match = {
          ...match,
          otherRating: otherUser.rating,
        };
      }

      const friendId =
        match.userId === this.currentUserId ? match.friendId : match.userId;
      // Set friend and find its data
      const friend = this.users.find((u) => u.id === friendId);

      // Get age in milliseconds
      const ageInMilliseconds = new Date().getTime() - friend.dayOfBirth;
      // Convert to years
      const getBirthDate = Math.round(
        ageInMilliseconds / (1000 * 60 * 60 * 24 * 365)
      );

      // Check if the rating has an incoming rating or if it is your own.
      let incomingRating = "",
        activeRating = " js__rating-pending";
      if (complete) {
        incomingRating = ` ${match.rating}d`;
        activeRating = ` ${match.otherRating}d`;
      } else if (match.friendId === this.currentUserId) {
        incomingRating = ` ${match.rating}d`;
      } else {
        activeRating = ` ${match.rating}d`;
      }

      return `
          <li class="match__list-item" data-user="${friend.id}">
              <div class="match__list-item__incoming-rating${incomingRating}">
                  <span></span>
              </div>
              <div class="match__list-item__user-info">
                <img src="${friend.picture.medium}" alt="${friend.username}'s profile picture.">
                <div>
                  <span>${friend.firstName} ${friend.lastName}</span>
                  <span>${getBirthDate}</span>
                </div>
              </div>
              <div class="match__list-item__rating${activeRating}">
                  <span class="match__list-item__rating-dislike" data-rating="dislike"></span>
                  <span class="match__list-item__rating-like" data-rating="like"></span>
                  <span class="match__list-item__rating-superlike" data-rating="superlike"></span>
              </div>
          </li>`;
    },
  };
  app.initialize();
})();
