const assert = require("assert");
const supertest = require("supertest");
const app = require("../src/app");

const request = supertest(app);

describe("Group APIs", () => {
  let authToken;
  let groupId;

  before(async () => {
    const loginResponse = await request.post("/auth/login").send({
      username: "testuser_registration",
      password: "testuser_password",
    });
    authToken = loginResponse.body.token;
  });

  describe("Create Group (POST /group/createGroup)", () => {
    it("should create a new group", async () => {
      const response = await request
        .post("/group/createGroup")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Group",
        });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.message, "Group created successfully.");
      assert.ok(response.body.groupId);
      groupId = response.body.groupId;
    });

    it("should not create a group without a valid token", async () => {
      const response = await request.post("/group/createGroup").send({
        name: "Invalid Group",
      });

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });
  });

  describe("Delete Group (DELETE /group/deleteGroup/:groupId)", () => {
    it("should delete a group", async () => {
      const response = await request
        .delete(`/group/deleteGroup/${groupId}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.message, "Group deleted successfully.");
    });

    it("should not delete a group without a valid token", async () => {
      const response = await request.delete(
        `/group/deleteGroup/nonexistent_group_id`
      );

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });

    it("should not delete a group if the user is not a member", async () => {
      const response = await request
        .delete(`/group/deleteGroup/nonexistent_group_id`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Permission denied. You are not a member of this group."
      );
    });
  });

  describe("Search Groups (GET /group/searchGroups)", () => {
    it("should search for groups", async () => {
      const response = await request
        .get("/group/searchGroups")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ keyword: "Test" });

      assert.strictEqual(response.status, 200);
      assert.ok(Array.isArray(response.body));
    });

    it("should not search for groups without a valid token", async () => {
      const response = await request
        .get("/group/searchGroups")
        .query({ keyword: "Test" });

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });
  });

  describe("Add Member to Group (POST /group/addMemberToGroup/:groupId)", () => {
    it("should add a member to a group", async () => {
      const createUserResponse = await request
        .post("/admin/createUser")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: "new_testuser",
          password: "new_testuser_password",
          isAdmin: false,
        });

      const response = await request
        .post(`/group/addMemberToGroup/${groupId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userId: createUserResponse.body.userId,
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.body.message,
        "Member added to the group successfully."
      );
    });

    it("should not add a member to a group without a valid token", async () => {
      const response = await request
        .post(`/group/addMemberToGroup/${groupId}`)
        .send({
          userId: "nonexistent_user_id",
        });

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });

    it("should not add a member to a group if the user is not a member", async () => {
      const response = await request
        .post(`/group/addMemberToGroup/nonexistent_group_id`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userId: "nonexistent_user_id",
        });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Permission denied. You are not a member of this group."
      );
    });
  });
});
