const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
jest.mock("../utils/verification", () => ({ ...jest.requireActual("../utils/verification"), emailCode: jest.fn().mockResolvedValue() }));
process.env.JWT_SECRET = "test-only-long-secret-not-for-production-123456";
process.env.MAIL_API_KEY = "test";
process.env.MAIL_FROM = "test@example.com";
jest.setTimeout(120000);
const User = require("../models/User");
const Profile = require("../models/Profile");
const Swipe = require("../models/Swipe");
const Match = require("../models/Match");
const Counter = require("../models/RateCounter");
const MongoRateStore = require("../utils/mongoRateStore");
const { emailCode } = require("../utils/verification");
let mongo, app;
const cookie = (user) => `postdate=${jwt.sign({ userId: String(user._id), version: 0 }, process.env.JWT_SECRET, { issuer: "postdate", audience: "postdate-web", expiresIn: "1h" })}`;
const call = (method, path, user) => {
  const req = request(app)[method](`/api${path}`).set("X-Postdate-Request", "1");
  return user ? req.set("Cookie", cookie(user)) : req;
};
async function member(name, extra = {}) {
  const user = await User.create({ firstName: name, lastName: "Private", email: `${name.toLowerCase()}@example.com`, passwordHash: await bcrypt.hash("OriginalSecret123", 4), isVerified: true, emailVerifiedAt: new Date(), ...extra });
  await Profile.create({ userId: user._id, profileName: name, gender: "female", dateOfBirth: new Date("1998-05-14"), bio: "Hello" });
  return user;
}
async function recovery(user) {
  await call("post", "/auth/recovery/request").send({ email: user.email }).expect(200);
  const delivery = emailCode.mock.calls.findLast((args) => args[0] === user.email);
  const result = await call("post", "/auth/recovery/verify").send({ email: user.email, code: delivery[1] }).expect(200);
  return result.body.resetToken;
}
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), Profile.init(), Swipe.init(), Match.init(), Counter.init()]);
  app = require("../server").createApp();
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
afterEach(async () => { await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({}))); jest.clearAllMocks(); });

test("recovery changes password once, stores only a digest, and revokes previous sessions", async () => {
  const user = await member("Alice");
  const token = await recovery(user);
  const stored = await User.findById(user._id).select("+resetTokenHash");
  expect(stored.resetTokenHash).not.toBe(token);
  const results = await Promise.all([1, 2].map(() => call("post", "/auth/recovery/reset").send({ resetToken: token, newPassword: "ReplacementSecret123" })));
  expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
  const updated = await User.findById(user._id).select("+passwordHash +sessionVersion +resetTokenHash");
  expect(await bcrypt.compare("ReplacementSecret123", updated.passwordHash)).toBe(true);
  expect(updated.sessionVersion).toBe(1);
  expect(updated.resetTokenHash).toBeUndefined();
  await call("get", "/discover", user).expect(401);
});
test("unknown account requests have the same acknowledgement", async () => {
  const user = await member("Alice");
  const known = await call("post", "/auth/recovery/request").send({ email: user.email });
  const unknown = await call("post", "/auth/recovery/request").send({ email: "unknown@example.com" });
  expect(unknown.status).toBe(known.status);
  expect(unknown.body).toEqual(known.body);
  expect(emailCode).toHaveBeenCalledTimes(1);
});
test("recovery codes expire, allow only five guesses, and cannot be reused", async () => {
  const user = await member("Alice");
  await call("post", "/auth/recovery/request").send({ email: user.email }).expect(200);
  const code = emailCode.mock.calls[0][1];
  const wrong = code === "999999" ? "888888" : "999999";
  await Promise.all(Array.from({ length: 8 }, () => call("post", "/auth/recovery/verify").send({ email: user.email, code: wrong }).expect(400)));
  expect((await User.findById(user._id).select("+recoveryAttempts")).recoveryAttempts).toBe(5);
  await call("post", "/auth/recovery/verify").send({ email: user.email, code }).expect(400);
  await User.updateOne({ _id: user._id }, { $set: { recoveryAttempts: 0, recoveryExpiresAt: new Date(0) } });
  await call("post", "/auth/recovery/verify").send({ email: user.email, code }).expect(400);
});
test("password reset cannot reactivate a suspended account", async () => {
  const user = await member("Alice", { isActive: false });
  const token = await recovery(user);
  await call("post", "/auth/recovery/reset").send({ resetToken: token, newPassword: "ReplacementSecret123" }).expect(200);
  expect((await User.findById(user._id)).isActive).toBe(false);
});
test.each([["get", "/discover"], ["put", "/profile/details"], ["post", "/discover/like"], ["get", "/matches/history"]])("member endpoint %s %s requires authentication", async (method, path) => { await call(method, path).expect(401); });
test("profile edits affect only the authenticated owner and reject permission fields", async () => {
  const alice = await member("Alice");
  const bob = await member("Bob");
  const details = { displayName: "New Alice", bio: "<script>alert(1)</script>", gender: "female", birthdate: "1998-05-14", city: "Manila", country: "Philippines" };
  await call("put", "/profile/details", alice).send({ ...details, userId: String(bob._id) }).expect(400);
  await call("put", "/profile/details", alice).send({ ...details, role: "admin" }).expect(400);
  await call("put", "/profile/details", alice).send({ ...details, birthdate: "2020-01-01" }).expect(400);
  await call("put", "/profile/details", alice).send(details).expect(200);
  expect((await Profile.findOne({ userId: alice._id })).profileName).toBe("New Alice");
  expect((await Profile.findOne({ userId: bob._id })).profileName).toBe("Bob");
});
test("discovery hides private data, self, staff, inactive and unverified accounts", async () => {
  const alice = await member("Alice");
  const bob = await member("Bob");
  await member("Inactive", { isActive: false });
  await member("Legacy", { emailVerifiedAt: null });
  await member("Staff", { role: "admin" });
  const result = await call("get", "/discover", alice).expect(200);
  expect(result.body.profiles.map((p) => p.id)).toEqual([String(bob._id)]);
  expect(Object.keys(result.body.profiles[0]).sort()).toEqual(["age", "bio", "gender", "id", "name", "photoPath"]);
  const literal = await call("get", "/discover?query=.*", alice).expect(200);
  expect(literal.body.profiles).toHaveLength(0);
  await call("get", "/discover?minAge=0", alice).expect(400);
});
test("likes are idempotent, mutual likes create one match, unrelated matches stay private", async () => {
  const alice = await member("Alice"), bob = await member("Bob"), other = await member("Other");
  await call("post", "/discover/like", alice).send({ profileId: String(bob._id) }).expect(200);
  await Promise.all(Array.from({ length: 5 }, () => call("post", "/discover/like", bob).send({ profileId: String(alice._id) }).expect(200)));
  expect(await Match.countDocuments()).toBe(1);
  expect(await Swipe.countDocuments()).toBe(2);
  const history = await call("get", "/matches/history", alice).expect(200);
  expect(history.body.matches[0].partner.id).toBe(String(bob._id));
  expect((await call("get", "/matches/history", other)).body.matches).toHaveLength(0);
  expect((await call("get", "/discover", alice)).body.profiles.some((p) => p.id === String(bob._id))).toBe(false);
  await Match.updateMany({}, { $set: { status: "blocked" } });
  expect((await call("post", "/discover/like", alice).send({ profileId: String(bob._id) })).body.matched).toBe(false);
});
test("shared rate counters survive store replacement, count atomically and hide IP addresses", async () => {
  const first = new MongoRateStore("test"), second = new MongoRateStore("test");
  first.init({ windowMs: 3600000 }); second.init({ windowMs: 3600000 });
  const counts = await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? first : second).increment("192.0.2.1")));
  expect(counts.map((c) => c.totalHits).sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  const replacement = new MongoRateStore("test"); replacement.init({ windowMs: 3600000 });
  expect((await replacement.increment("192.0.2.1")).totalHits).toBe(21);
  expect(JSON.stringify(await Counter.find({}).lean())).not.toContain("192.0.2.1");
  await replacement.resetKey("192.0.2.1");
  expect((await replacement.increment("192.0.2.1")).totalHits).toBe(1);
});
