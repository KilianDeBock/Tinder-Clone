(() => {
  const app = {
    initialize() {
      // Create new instance of TinderAPI
      this.TinderApi = new TinderApi();

      // Set defaults
      this.users = null;
      this.currentUserId = null;
      this.currentFriendId = null;
      this.messages = null;
      this.currentMessageId = null;
      this.conversationMessages = null;

      // Run functions
      this.cacheElements();
      this.registerListeners();
      this.fetchUsers();
    },
    cacheElements() {
      this.$usersList = document.querySelector("#users__list");
      this.$receivedMessages = document.querySelector("#inbox__list");
      this.$sentMessages = document.querySelector("#outbox__list");
      this.$searchBox = document.querySelector("#conversation__form-message");
      this.$conversationList = document.querySelector("#conversation__list");
      this.$conversationForm = document.querySelector("#conversation__form");
      this.$match = document.querySelector("#matches");
      this.$noMatchList = document.querySelector("#no-match__list");
      this.$matchList = document.querySelector("#match__list");
    },
    registerListeners() {
      // Add event listener to user list
      this.$usersList.addEventListener("click", (ev) => {
        const userId =
          ev.target.dataset.id ??
          ev.target.parentNode.dataset.id ??
          ev.target.parentNode.parentNode.dataset.id;
        this.setActiveUser(userId);
      });

      // Add event listener to receivedMessages
      this.$receivedMessages.addEventListener("click", (ev) => {
        const messageId =
          ev.target.dataset.id ??
          ev.target.parentNode.dataset.id ??
          ev.target.parentNode.parentNode.dataset.id;
        this.setActiveMessage(messageId);
      });

      // Add event listener to sentMessages
      this.$sentMessages.addEventListener("click", (ev) => {
        const messageId =
          ev.target.dataset.id ??
          ev.target.parentNode.dataset.id ??
          ev.target.parentNode.parentNode.dataset.id;
        this.setActiveMessage(messageId);
      });

      // Add event listener to send button
      this.$conversationForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        this.postMessages(ev.target["conversation__form-message"]);
      });
      // Add event listener to box (the enter button)
      this.$searchBox.addEventListener("keydown", (ev) => {
        if (ev.keyCode === 13) this.postMessages(ev.target);
      });

      // Add event listner to the matches
      this.$match.addEventListener("click", async (ev) => {
        // Set allowed ratings and values.
        const allowedRatings = ["dislike", "like", "superlike"],
          target = ev.target,
          rating = target.dataset.rating,
          parent = target.parentNode,
          friendId = parent.parentNode.dataset.user;

        // Check if the rating is pending, and if the rating is allowed.
        if (
          parent.classList.contains("js__rating-pending") &&
          allowedRatings.some((c) => rating === c)
        ) {
          // Create match
          await this.TinderApi.addMatch(this.currentUserId, friendId, rating);

          // Reload messages and matches.
          await this.fetchMessagesFromUser(
            this.currentUserId,
            this.currentMessageId
          );
          // If not pending, still check if the reaction is allowed
        } else if (allowedRatings.some((c) => rating === c)) {
          // Update the match.
          await this.TinderApi.updateMatch(
            this.currentUserId,
            friendId,
            rating
          );

          // Reload messages and matches.
          await this.fetchMessagesFromUser(
            this.currentUserId,
            this.currentMessageId
          );
        }
      });
    },
    async postMessages(messageBox) {
      // If empty stop and warn user.
      if (messageBox.value === "")
        return window.alert("Please enter a message!");

      // Add message
      await this.TinderApi.addMessageBetweenUsers(
        this.currentUserId,
        this.currentFriendId,
        messageBox.value
      );

      // Reload messages.
      await this.fetchMessagesFromUser(
        this.currentUserId,
        this.currentMessageId
      );

      // Reset value (empty message box)
      messageBox.value = "";
    },
    async fetchUsers() {
      // Get users
      this.users = await this.TinderApi.getUsers();
      // Set users
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
      // Set current user
      this.currentUserId = userId;
      // Cache last selected user
      const $selectedUser = this.$usersList.querySelector(
        `.users__list-item.selected`
      );
      // Remove his selected class
      if ($selectedUser !== null) $selectedUser.classList.remove("selected");
      // get new user, and add selected class
      this.$usersList
        .querySelector(`.users__list-item[data-id="${userId}"]`)
        .classList.add("selected");
      // Get messages.
      this.fetchMessagesFromUser(userId);
    },
    getUserIdByMessageId(messageId) {
      // Find userId in sentMessages if not return empty object
      const { receiverId } =
        this.receivedMessages.find((message) => message.id === messageId) ?? {};

      // Find userId in receivedMessages if not return empty object.
      const { senderId } =
        this.sentMessages.find((message) => message.id === messageId) ?? {};

      /*
        Return senderId if not return receiverId,
        one should be true. if not return null.
      */
      return senderId ?? receiverId ?? null;
    },
    getFriendIdByMessageId(messageId) {
      // Find userId in sentMessages if not return empty object
      const { receiverId } =
        this.sentMessages.find((message) => message.id === messageId) ?? {};

      // Find userId in receivedMessages if not return empty object.
      const { senderId } =
        this.receivedMessages.find((message) => message.id === messageId) ?? {};

      /*
        Return senderId if not return receiverId,
        one should be true. if not return null.
      */
      return senderId ?? receiverId ?? null;
    },
    async fetchMessagesFromUser(userId, returnMessage = null) {
      // Get received messages
      this.receivedMessages = await this.TinderApi.getReceivedMessagesFromUser(
        userId
      );

      // Sort the receiverMessages
      this.receivedMessages.sort((a, b) => b.createdAt - a.createdAt);

      // Set returnMessage, if unavailable set first received message, it not keep.
      returnMessage =
        returnMessage === null ? this.receivedMessages[0].id : returnMessage;

      // Set html
      this.$receivedMessages.innerHTML = this.receivedMessages
        .map((message) => {
          const user = this.users.find((u) => u.id === message.senderId);
          return `
            <li class="messages__list-item inbox__list-item" data-id="${message.id}">
                <span class="name">${user.firstName} ${user.lastName}</span>
                <p class="">${message.message}</p>
            </li>`;
        })
        .join("");

      // Set received messages on the fly. (cache and set together)
      document.querySelector(
        "#inbox > .counting-box > .counting-box__counter"
      ).innerHTML = this.receivedMessages.length;

      // Get Sent messages
      this.sentMessages = await this.TinderApi.getSentMessagesFromUser(userId);
      // Set sent messages.
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

      // Set received messages on the fly. (cache and set together)
      document.querySelector(
        "#outbox > .counting-box > .counting-box__counter"
      ).innerText = this.sentMessages.length;

      // Set active message
      this.setActiveMessage(returnMessage);
    },
    setActiveMessage(messageId) {
      // cache current message
      this.currentMessageId = messageId;
      // get old selected message
      const $selectedMessage = document.querySelector(
        `.messages__list-item.selected`
      );

      // remove old selected
      if ($selectedMessage !== null) {
        $selectedMessage.classList.remove("selected");
      }

      // Set new selected message.
      document
        .querySelector(`.messages__list-item[data-id="${messageId}"]`)
        .classList.add("selected");

      // Set currentFriendId (in cache)
      this.currentFriendId = this.getFriendIdByMessageId(messageId);

      // run conversation and matches.
      this.fetchConversationMessages();
      this.fetchMatches();
    },
    async fetchConversationMessages() {
      // Get conversation
      this.conversationMessages =
        await this.TinderApi.getConversationBetweenUsers(
          this.currentUserId,
          this.currentFriendId
        );

      // Set conversation
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
      // Get all matches and sort them
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

      // Add it to the html.
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

      // Set nomatches html
      this.$noMatchList.innerHTML = noMatches
        .map((user) => {
          // Get age in milliseconds
          const ageInMilliseconds = new Date().getTime() - user.dayOfBirth;
          // Convert to years
          const getBirthDate = Math.round(
            ageInMilliseconds / (1000 * 60 * 60 * 24 * 365)
          );

          return `
            <li class="match__list-item" data-user="${user.id}">
                <div class="match__list-item__user-info">
                  <img src="${user.picture.medium}" alt="${user.username}'s profile picture.">
                  <div>
                    <span>${user.firstName} ${user.lastName} (${user.nationality})</span>
                    <span>${getBirthDate} years old ${user.gender}</span>
                    <span>${user.location.city}, ${user.location.country}</span>
                    <span>${user.cell}</span>
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
      // Check for complete match & active user if so stop!
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

      // Return html
      return `
          <li class="match__list-item" data-user="${friend.id}">
              <div class="match__list-item__incoming-rating${incomingRating}">
                  <span></span>
              </div>
              <div class="match__list-item__user-info">
                <img src="${friend.picture.medium}" alt="${friend.username}'s profile picture.">
                <div>
                  <span>${friend.firstName} ${friend.lastName} (${friend.nationality})</span>
                  <span>${getBirthDate} years old ${friend.gender}</span>
                  <span>${friend.location.city}, ${friend.location.country}</span>
                  <span>${friend.cell}</span>
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
