const assert = require("assert");
const supertest = require("supertest");
const app = require("../src/app");

const request = supertest(app);

describe("Admin APIs", () => {
  let adminToken;

  before(async () => {
    const loginResponse = await request.post("/auth/login").send({
      username: "admin",
      password: "admin_password",
    });
    adminToken = loginResponse.body.token;
  });

  describe("Create User (POST /admin/createUser)", () => {
    it("should create a new user as admin", async () => {
      const response = await request
        .post("/admin/createUser")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "testuser",
          password: "testuser_password",
          isAdmin: false,
        });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.message, "User created successfully");
    });

    it("should not create a user if the request is not from an admin", async () => {
      const response = await request.post("/admin/createUser").send({
        username: "testuser",
        password: "testuser_password",
        isAdmin: false,
      });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Permission denied. Only admins can create users."
      );
    });
  });

  describe("Edit User (PUT /admin/editUser/:userId)", () => {
    let userId;

    before(async () => {
      const createUserResponse = await request
        .post("/admin/createUser")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "testuser_edit",
          password: "testuser_edit_password",
          isAdmin: false,
        });

      userId = createUserResponse.body.userId;
    });

    it("should edit user details as admin", async () => {
      const response = await request
        .put(`/admin/editUser/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "new_testuser_username",
          password: "new_testuser_password",
          isAdmin: true,
        });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(
        response.body.message,
        "User details updated successfully"
      );
    });

    it("should not edit user details if the request is not from an admin", async () => {
      const response = await request.put(`/admin/editUser/${userId}`).send({
        username: "new_testuser_username",
        password: "new_testuser_password",
        isAdmin: true,
      });

      assert.strictEqual(response.status, 403);
      assert.strictEqual(
        response.body.error,
        "Permission denied. Only admins can edit user details."
      );
    });

    it("should not edit user details if the user does not exist", async () => {
      const response = await request
        .put("/admin/editUser/nonexistent_user_id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "new_testuser_username",
          password: "new_testuser_password",
          isAdmin: true,
        });

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.error, "User not found.");
    });
  });
});
