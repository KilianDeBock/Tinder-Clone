const request = require("supertest");
const { app } = require("../src/app");

afterEach(async (done) => {
  done();
});

const getTestIndexesArray = (arrayLength) => {
  const lastIndex = arrayLength > 0 ? arrayLength - 1 : 0,
    centerIndex = Math.round(arrayLength > 1 ? arrayLength / 2 : 0);
  return { lastIndex, centerIndex };
};

// WARNING, USE 2 USER IDS WHO BOTH USERS HAVE SENT EACH OTHER MESSAGE(S).
// This is needed for checking a conversation!
const userId = "9bfb0019-2b25-4abc-95e9-d68048041771";
const friendId = "b785f86f-69b4-4954-9edd-93328a57312e";

describe("User Endpoints", () => {
  it("should fetch all users (more than 1)", async () => {
    const { body } = await request(app)
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body.length > 1).toBeTruthy();
  });

  it("should get the correct user", async () => {
    const { body } = await request(app)
      .get(`/api/users/${userId}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body.id).toBe(userId);
  });

  it("should get the messages from the user", async () => {
    const { body } = await request(app)
      .get(`/api/users/${userId}/messages`)
      .expect(200)
      .expect("Content-Type", /json/);

    // Calculate the last and middle messages
    const { lastIndex, centerIndex } = getTestIndexesArray(body.length);

    // Check if the first item is a message for the user.
    expect(
      body[0].receiverId === userId || body[0].senderId === userId
    ).toBeTruthy();

    // Check if the last item is a message for the user.
    expect(
      body[lastIndex].receiverId === userId ||
        body[lastIndex].senderId === userId
    ).toBeTruthy();

    // Check if the middel item is a message for the user.
    expect(
      body[centerIndex].receiverId === userId ||
        body[centerIndex].senderId === userId
    ).toBeTruthy();
  });

  it("should only get the received messages from the user", async () => {
    const { body } = await request(app)
      .get(`/api/users/${userId}/messages?type=received`)
      .expect(200)
      .expect("Content-Type", /json/);

    // Calculate the last and middle messages
    const { lastIndex, centerIndex } = getTestIndexesArray(body.length);

    // Check if the first item is a message for the user.
    expect(body[0].receiverId).toBe(userId);

    // Check if the last item is a message for the user.
    expect(body[lastIndex].receiverId).toBe(userId);

    // Check if the middel item is a message for the user.
    expect(body[centerIndex].receiverId).toBe(userId);
  });

  it("should only get the sent messages from the user", async () => {
    const { body } = await request(app)
      .get(`/api/users/${userId}/messages?type=sent`)
      .expect(200)
      .expect("Content-Type", /json/);

    // Calculate the last and middle messages
    const { lastIndex, centerIndex } = getTestIndexesArray(body.length);

    // Check if the first item is a message for the user.
    expect(body[0].senderId).toBe(userId);

    // Check if the last item is a message for the user.
    expect(body[lastIndex].senderId).toBe(userId);

    // Check if the middel item is a message for the user.
    expect(body[centerIndex].senderId).toBe(userId);
  });

  it("should only get the messages between 2 users (conversation) !!! WARNING, USE 2 USER IDS WHO BOTH USERS HAVE SENT EACH OTHER MESSAGE(S) !!!", async () => {
    const { body } = await request(app)
      .get(
        `/api/users/${userId}/messages?type=conversation&friendId=b785f86f-69b4-4954-9edd-93328a57312e`
      )
      .expect(200)
      .expect("Content-Type", /json/);

    // Calculate the last and middle messages
    const { lastIndex, centerIndex } = getTestIndexesArray(body.length);

    // Check if the first item is a message for the users.
    expect(
      (body[0].senderId === userId || body[0].receiverId === userId) &&
        (body[0].senderId === friendId || body[0].receiverId === friendId)
    ).toBeTruthy();

    // Check if the last item is a message for the users.
    expect(
      (body[lastIndex].senderId === userId ||
        body[lastIndex].receiverId === userId) &&
        (body[lastIndex].senderId === friendId ||
          body[lastIndex].receiverId === friendId)
    ).toBeTruthy();

    // Check if the middel item is a message for the users.
    expect(
      (body[centerIndex].senderId === userId ||
        body[centerIndex].receiverId === userId) &&
        (body[centerIndex].senderId === friendId ||
          body[centerIndex].receiverId === friendId)
    ).toBeTruthy();
  });
});
