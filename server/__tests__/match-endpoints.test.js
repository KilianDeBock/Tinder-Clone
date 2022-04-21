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

const userId = "9bfb0019-2b25-4abc-95e9-d68048041771",
  friendId = "b785f86f-69b4-4954-9edd-93328a57312e";
let rating = null;

describe("Match Endpoints", () => {
  it("should fetch all matches (more than 1)", async () => {
    const { body } = await request(app)
      .get("/api/matches")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body.length > 1).toBeTruthy();
  });

  it("should get the matches from the user", async () => {
    const { body } = await request(app)
      .get(`/api/users/${userId}/matches`)
      .expect(200)
      .expect("Content-Type", /json/);

    // Calculate the last and middle messages
    const { lastIndex, centerIndex } = getTestIndexesArray(body.length);

    // Check if the first item is a message for the user.
    expect(
      body[0].userId === userId || body[0].friendId === userId
    ).toBeTruthy();

    // Check if the last item is a message for the user.
    expect(
      body[lastIndex].userId === userId || body[lastIndex].friendId === userId
    ).toBeTruthy();

    // Check if the middel item is a message for the user.
    expect(
      body[centerIndex].userId === userId ||
        body[centerIndex].friendId === userId
    ).toBeTruthy();
  });

  it("should create a match", async () => {
    const match = {
        userId,
        friendId,
        rating: "dislike",
      },
      { body } = await request(app)
        .post(`/api/matches`)
        .send(match)
        .expect(201)
        .expect("Content-Type", /json/);

    expect(body.userId).toBe(userId);
    expect(body.friendId).toBe(friendId);
    expect(body.rating).toBe(match.rating);
    // If successful set rating for the delete check.
    rating = match.rating;
  });

  it("should update a match (cannot pass if 'post match' does not work!)", async () => {
    const match = {
        rating: "like",
      },
      { body } = await request(app)
        .put(`/api/matches/${userId}/${friendId}`)
        .send(match)
        .expect(201)
        .expect("Content-Type", /json/);

    expect(body.userId).toBe(userId);
    expect(body.friendId).toBe(friendId);
    expect(body.rating).toBe(match.rating);
    // If successful set/update rating for the delete check.
    rating = match.rating;
  });

  it("should delete a match (cannot pass if 'post match' does not work!)", async () => {
    const { body } = await request(app)
      .delete(`/api/matches/${userId}/${friendId}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body.status).toBe("success");
    expect(body.deleted.userId).toBe(userId);
    expect(body.deleted.friendId).toBe(friendId);
    expect(body.deleted.rating).toBe(rating);
  });
});
