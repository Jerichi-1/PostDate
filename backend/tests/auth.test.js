/**
 * Security-focused test suite for the auth flow, plus requireAuth /
 * requireRole middleware.
 *
 * Uses mongodb-memory-server so this runs against a real, throwaway Mongo
 * instance — no live database needed, and nothing here touches real data.
 *
 * Run with: npm test
 */
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-do-not-use-in-prod";
process.env.TEMP_VERIFY_CODE = process.env.TEMP_VERIFY_CODE || "0000";

let mongod;
let app;
let User;

const VALID_SIGNUP = {
  firstName: "Test",
  lastName: "User",
  email: "test.user@example.com",
  password: "SuperSecret123",
  birthdate: "1998-05-14", // ISO — matches the <input type="date"> fix
  gender: "female",
  bio: "Hi",
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);

  // server.js calls connectDB() + app.listen() as a side effect of being
  // required, which we don't want in tests — build an equivalent app here
  // instead, using the same route/middleware files.
  const express = require("express");
  const helmet = require("helmet");
  const cors = require("cors");
  const authRoutes = require("../routes/authRoutes");
  const apiRoutes = require("../routes/routes");
  const { notFound, errorHandler } = require("../middleware/errorHandler");

  User = require("../models/User");

  app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use("/api", authRoutes);
  app.use("/api", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/signup", () => {
  test("hashes the password — never stores it in plain text", async () => {
    await request(app).post("/api/signup").send(VALID_SIGNUP).expect(201);
    const stored = await User.findOne({ email: VALID_SIGNUP.email });
    expect(stored.passwordHash).toBeDefined();
    expect(stored.passwordHash).not.toBe(VALID_SIGNUP.password);
    expect(stored.passwordHash.startsWith("$2")).toBe(true); // bcrypt hash prefix
  });

  test("rejects a duplicate email with 409", async () => {
    await request(app).post("/api/signup").send(VALID_SIGNUP).expect(201);
    const res = await request(app).post("/api/signup").send(VALID_SIGNUP);
    expect(res.status).toBe(409);
  });

  test("rejects a password under 8 characters", async () => {
    const res = await request(app)
      .post("/api/signup")
      .send({ ...VALID_SIGNUP, email: "short@example.com", password: "short" });
    expect(res.status).toBe(400);
  });

  test("rejects signups under 18", async () => {
    const today = new Date();
    const under18 = `${today.getFullYear() - 10}-01-01`;
    const res = await request(app)
      .post("/api/signup")
      .send({ ...VALID_SIGNUP, email: "young@example.com", birthdate: under18 });
    expect(res.status).toBe(400);
  });

  test("rejects a malformed email", async () => {
    const res = await request(app)
      .post("/api/signup")
      .send({ ...VALID_SIGNUP, email: "not-an-email" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  async function signupAndVerify(email = VALID_SIGNUP.email) {
    await request(app).post("/api/signup").send({ ...VALID_SIGNUP, email });
    await request(app).post("/api/verify/confirm").send({ email, code: "0000" });
  }

  test("blocks login before email verification with 403", async () => {
    await request(app).post("/api/signup").send(VALID_SIGNUP);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: VALID_SIGNUP.email, password: VALID_SIGNUP.password });
    expect(res.status).toBe(403);
  });

  test("logs in and returns a JWT after verification", async () => {
    await signupAndVerify();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: VALID_SIGNUP.email, password: VALID_SIGNUP.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.role).toBe("user");
  });

  test("gives the same error for a wrong password as a nonexistent email", async () => {
    await signupAndVerify();
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: VALID_SIGNUP.email, password: "WrongPassword1" });
    const noSuchUser = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "WrongPassword1" });
    expect(wrongPassword.status).toBe(401);
    expect(noSuchUser.status).toBe(401);
    expect(wrongPassword.body.message).toBe(noSuchUser.body.message);
  });
});

describe("Protected routes (requireAuth / requireRole)", () => {
  async function getToken(role = "user") {
    const email = `${role}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
    await request(app).post("/api/signup").send({ ...VALID_SIGNUP, email });
    await request(app).post("/api/verify/confirm").send({ email, code: "0000" });
    if (role !== "user") {
      await User.updateOne({ email }, { role });
    }
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: VALID_SIGNUP.password });
    return login.body.token;
  }

  test("rejects /api/profile/me with no token", async () => {
    const res = await request(app).get("/api/profile/me");
    expect(res.status).toBe(401);
  });

  test("rejects a garbage token", async () => {
    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  test("allows /api/profile/me with a valid token", async () => {
    const token = await getToken("user");
    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test("blocks a regular user from an admin-only route with 403", async () => {
    const token = await getToken("user");
    const res = await request(app)
      .get("/api/admin/ping")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test("allows an admin through the same route", async () => {
    const token = await getToken("admin");
    const res = await request(app)
      .get("/api/admin/ping")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("Error handling", () => {
  test("unknown routes return 404, not a stack trace", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  test("server errors never leak internals to the client", async () => {
    // malformed JSON body -> body-parser throws -> our error handler
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{not valid json");
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.message).not.toMatch(/at Object|node_modules|\.js:\d+/);
  });
});
