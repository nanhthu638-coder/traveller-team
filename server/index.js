import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const scrypt = promisify(scryptCallback);
const serverDirectory = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(serverDirectory, "data");
const dataPath = join(dataDirectory, "app-data.json");
const sessions = new Map();
const sessionCookie = "traveller_team_session";
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;

mkdirSync(dataDirectory, { recursive: true });

function readDatabase() {
  try {
    return JSON.parse(readFileSync(dataPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { accounts: [], inquiries: [] };
  }
}

function writeDatabase(database) {
  const temporaryPath = `${dataPath}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(database, null, 2), { mode: 0o600 });
  renameSync(temporaryPath, dataPath);
}

function cleanUser(account) {
  return { id: account.id, name: account.name, email: account.email };
}

function getSessionUser(request) {
  const cookieHeader = request.headers.cookie || "";
  const token = cookieHeader.match(/(?:^|;\s*)traveller_team_session=([^;]+)/)?.[1];
  const accountId = token && sessions.get(token);
  if (!accountId) return null;
  return readDatabase().accounts.find((account) => account.id === accountId) || null;
}

function createSession(response, account) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, account.id);
  response.cookie(sessionCookie, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionLifetime,
    path: "/",
  });
}

function validEmail(email) {
  return typeof email === "string" && email.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.get("/api/auth/session", (request, response) => {
  const account = getSessionUser(request);
  response.json({ user: account ? cleanUser(account) : null });
});

app.post("/api/auth/register", async (request, response, next) => {
  const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
  const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = request.body.password;
  if (!name || name.length > 80) return response.status(400).json({ error: "Vui lòng nhập họ tên hợp lệ." });
  if (!validEmail(email)) return response.status(400).json({ error: "Vui lòng nhập email hợp lệ." });
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: "Mật khẩu cần có từ 8 đến 128 ký tự." });
  }

  try {
    const salt = randomBytes(16);
    const passwordHash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const database = readDatabase();
    if (database.accounts.some((account) => account.email === email)) {
      return response.status(409).json({ error: "Email này đã được đăng ký. Hãy đăng nhập." });
    }
    const account = {
      id: randomUUID(),
      name,
      email,
      salt: salt.toString("hex"),
      passwordHash: passwordHash.toString("hex"),
      createdAt: new Date().toISOString(),
    };
    database.accounts.push(account);
    writeDatabase(database);
    createSession(response, account);
    return response.status(201).json({ user: cleanUser(account) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = request.body.password;
  if (!validEmail(email) || typeof password !== "string" || password.length > 128) {
    return response.status(400).json({ error: "Email hoặc mật khẩu chưa chính xác." });
  }

  try {
    const account = readDatabase().accounts.find((entry) => entry.email === email);
    if (!account) return response.status(401).json({ error: "Email hoặc mật khẩu chưa chính xác." });
    const attemptedHash = await scrypt(password, Buffer.from(account.salt, "hex"), 64, { N: 16384, r: 8, p: 1 });
    const savedHash = Buffer.from(account.passwordHash, "hex");
    if (savedHash.length !== attemptedHash.length || !timingSafeEqual(savedHash, attemptedHash)) {
      return response.status(401).json({ error: "Email hoặc mật khẩu chưa chính xác." });
    }
    createSession(response, account);
    return response.json({ user: cleanUser(account) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", (request, response) => {
  const token = request.headers.cookie?.match(/(?:^|;\s*)traveller_team_session=([^;]+)/)?.[1];
  if (token) sessions.delete(token);
  response.clearCookie(sessionCookie, { httpOnly: true, sameSite: "strict", path: "/" });
  response.status(204).end();
});

app.post("/api/inquiries", (request, response) => {
  const { name, email, topic, message } = request.body;
  const allowedTopics = ["Tư vấn chuyến đi", "Câu hỏi chung", "Góp ý dịch vụ", "Khác"];
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
    return response.status(400).json({ error: "Vui lòng nhập họ tên hợp lệ." });
  }
  if (!validEmail(email)) return response.status(400).json({ error: "Vui lòng nhập email hợp lệ." });
  if (!allowedTopics.includes(topic)) return response.status(400).json({ error: "Vui lòng chọn chủ đề hợp lệ." });
  if (typeof message !== "string" || message.trim().length < 10 || message.trim().length > 2000) {
    return response.status(400).json({ error: "Lời nhắn cần có từ 10 đến 2000 ký tự." });
  }

  const inquiry = {
    id: `TT-${Date.now().toString(36).toUpperCase()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    topic,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  const database = readDatabase();
  database.inquiries.push(inquiry);
  writeDatabase(database);
  return response.status(201).json({ inquiry: { id: inquiry.id, name: inquiry.name } });
});

const buildDirectory = join(serverDirectory, "..", "dist");
app.use(express.static(buildDirectory));
app.get(/.*/, (_request, response) => response.sendFile(join(buildDirectory, "index.html")));

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Máy chủ gặp sự cố. Vui lòng thử lại sau." });
});

const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Traveller Team API đang chạy tại http://localhost:${port}`));