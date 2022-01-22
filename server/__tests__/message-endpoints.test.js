const request = require("supertest");
const { app } = require("../src/app");

afterEach(async (done) => {
  done();
});

const userId = "9bfb0019-2b25-4abc-95e9-d68048041771",
  friendId = "b785f86f-69b4-4954-9edd-93328a57312e";
let createdId = null;

describe("Message Endpoints", () => {
  it("should fetch all messages (more than 1)", async () => {
    const { body } = await request(app)
      .get("/api/messages")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body.length > 1).toBeTruthy();
  });

  it("should create a message", async () => {
    const message = {
        senderId: userId,
        receiverId: friendId,
        message: "Original",
      },
      { body } = await request(app)
        .post(`/api/messages`)
        .send(message)
        .expect(201)
        .expect("Content-Type", /json/);

    expect(body.senderId).toBe(message.senderId);
    expect(body.receiverId).toBe(message.receiverId);
    expect(body.message).toBe(message.message);
    createdId = body.id;
  });

  it("should update a message (cannot pass if 'post message' does not work!)", async () => {
    const message = {
        message: "updated",
      },
      { body } = await request(app)
        .put(`/api/messages/${createdId}`)
        .send(message)
        .expect(201)
        .expect("Content-Type", /json/);

    expect(body.id).toBe(createdId);
    expect(body.message).toBe(message.message);
  });

  it("should delete a message (cannot pass if 'post message' does not work!)", async () => {
    const { body } = await request(app)
      .delete(`/api/messages/${createdId}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body.status).toBe("success");
    expect(body.deleted.id).toBe(createdId);
    expect(body.deleted.senderId).toBe(userId);
    expect(body.deleted.receiverId).toBe(friendId);
  });
});
