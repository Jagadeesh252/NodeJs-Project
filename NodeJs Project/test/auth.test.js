const assert = require("assert");
const supertest = require("supertest");
const app = require("../src/app");

const request = supertest(app);

describe("Authentication APIs", () => {
  describe("User Registration (POST /auth/register)", () => {
    it("should register a new user", async () => {
      const response = await request.post("/auth/register").send({
        username: "testuser_registration",
        password: "testuser_password",
      });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.message, "Registration successful.");
    });

    it("should not register a user with an existing username", async () => {
      const response = await request.post("/auth/register").send({
        username: "testuser_registration",
        password: "another_password",
      });

      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.body.error,
        "Username already exists. Choose a different username."
      );
    });
  });

  describe("User Login (POST /auth/login)", () => {
    it("should log in a registered user", async () => {
      const response = await request.post("/auth/login").send({
        username: "testuser_registration",
        password: "testuser_password",
      });

      assert.strictEqual(response.status, 200);
      assert.ok(response.body.token);
    });

    it("should not log in with incorrect credentials", async () => {
      const response = await request.post("/auth/login").send({
        username: "testuser_registration",
        password: "incorrect_password",
      });

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Invalid username or password.");
    });
  });

  describe("User Logout (POST /auth/logout)", () => {
    it("should log out a logged-in user", async () => {
      const loginResponse = await request.post("/auth/login").send({
        username: "testuser_registration",
        password: "testuser_password",
      });

      const logoutResponse = await request
        .post("/auth/logout")
        .set("Authorization", `Bearer ${loginResponse.body.token}`);

      assert.strictEqual(logoutResponse.status, 200);
      assert.strictEqual(logoutResponse.body.message, "Logout successful.");
    });

    it("should not perform logout without a valid token", async () => {
      const response = await request.post("/auth/logout");

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.error, "Unauthorized.");
    });
  });
});
