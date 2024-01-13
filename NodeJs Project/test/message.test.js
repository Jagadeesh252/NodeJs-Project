const assert = require("assert");
const supertest = require("supertest");
const app = require("../src/app");

const request = supertest(app);

describe("Message APIs", () => {
  let authToken;
  let groupId;
  let messageId;

  before(async () => {
    const loginResponse = await request.post("/auth/login").send({
      username: "testuser_registration",
      password: "testuser_password",
    });
    authToken = loginResponse.body.token;

    const createGroupResponse = await request
      .post("/group/createGroup")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Test Group for Messages",
      });
    groupId = createGroupResponse.body.groupId;
  });

  describe("Send Message (POST /message/sendMessage)", () => {
    it("should send a message to a group", async () => {
      const response = await request
        .post("/message/sendMessage")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          groupId,
          content: "Hello, this is a test message!",
        });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.message, "Message sent successfully.");
      assert.ok(response.body.messageId);
      messageId = response.body.messageId;
    });

    it("should not send a message without a valid token", async () => {
      const response = await request.post("/message/sendMessage").send({
        groupId,
        content: "Invalid message without authentication",
      });

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });

    it("should not send a message to a group if the user is not a member", async () => {
      const createUserResponse = await request
        .post("/admin/createUser")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: "non_member_user",
          password: "non_member_user_password",
          isAdmin: false,
        });

      const nonMemberAuthToken = createUserResponse.body.token;

      const response = await request
        .post("/message/sendMessage")
        .set("Authorization", `Bearer ${nonMemberAuthToken}`)
        .send({
          groupId,
          content: "Invalid message from non-member user",
        });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Permission denied. You are not a member of this group."
      );
    });
  });

  describe("Like Message (PUT /message/likeMessage/:messageId)", () => {
    it("should like a message", async () => {
      const response = await request
        .put(`/message/likeMessage/${messageId}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.message, "Message liked successfully.");
    });

    it("should not like a message without a valid token", async () => {
      const response = await request.put(`/message/likeMessage/${messageId}`);

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });

    it("should not like a message if the user is the author of the message", async () => {
      const response = await request
        .put(`/message/likeMessage/${messageId}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Permission denied. You cannot like your own message."
      );
    });

    it("should not like a message if the message does not exist", async () => {
      const response = await request
        .put("/message/likeMessage/nonexistent_message_id")
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.error, "Message not found.");
    });
  });
});
