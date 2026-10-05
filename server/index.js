import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import express from "express";
import { searchTours } from "./tours.js";

const scrypt = promisify(scryptCallback);
const app = express();
const port = Number(process.env.PORT) || 3000;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = resolve(projectRoot, "server/data");
const dataPath = resolve(dataDirectory, "app-data.json");
const buildDirectory = resolve(projectRoot, "dist");
const sessions = new Map();
let store = { users: [], inquiries: [] };
let writeQueue = Promise.resolve();

app.use(express.json({ limit: "20kb" }));

function publicUser(user) {
	return { id: user.id, name: user.name, email: user.email };
}

function cookieValue(request, name) {
	const prefix = `${name}=`;
	return (request.headers.cookie || "")
		.split(";")
		.map((cookie) => cookie.trim())
		.find((cookie) => cookie.startsWith(prefix))
		?.slice(prefix.length);
}

function setSessionCookie(response, token) {
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	response.setHeader("Set-Cookie", `traveller_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
}

function clearSessionCookie(response) {
	response.setHeader("Set-Cookie", "traveller_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function currentUser(request) {
	const userId = sessions.get(cookieValue(request, "traveller_session"));
	return store.users.find((user) => user.id === userId) || null;
}

function persistStore() {
	const contents = JSON.stringify(store, null, 2);
	writeQueue = writeQueue.catch(() => {}).then(async () => {
		const temporaryPath = `${dataPath}.tmp`;
		await writeFile(temporaryPath, contents, "utf8");
		await rename(temporaryPath, dataPath);
	});
	return writeQueue;
}

function cleanText(value, maxLength) {
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

app.get("/api/tours", (request, response) => {
	const result = searchTours(request.query);
	if (result.error) return response.status(400).json({ error: result.error });
	return response.json({ total: result.tours.length, tours: result.tours });
});

app.get("/api/tours/:id", (request, response) => {
	if (!currentUser(request)) return response.status(401).json({ error: "Vui lòng đăng nhập để xem chi tiết tour." });

	const result = searchTours();
	const tour = result.tours.find((item) => item.id === request.params.id);
	if (!tour) return response.status(404).json({ error: "Tour này không tồn tại." });
	return response.json({ tour });
});

app.get("/api/auth/session", (request, response) => {
	const user = currentUser(request);
	response.json({ user: user ? publicUser(user) : null });
});

app.post("/api/auth/register", async (request, response, next) => {
	try {
		const name = cleanText(request.body?.name, 80);
		const email = cleanText(request.body?.email, 120).toLowerCase();
		const password = typeof request.body?.password === "string" ? request.body.password : "";
		if (!name || !validEmail(email) || password.length < 8 || password.length > 256) {
			return response.status(400).json({ error: "Vui lòng nhập tên, email hợp lệ và mật khẩu từ 8 ký tự." });
		}
		if (store.users.some((user) => user.email === email)) {
			return response.status(409).json({ error: "Email này đã được đăng ký." });
		}

		const salt = randomBytes(16).toString("hex");
		const hash = (await scrypt(password, salt, 64)).toString("hex");
		const user = { id: randomUUID(), name, email, salt, hash, createdAt: new Date().toISOString() };
		store.users.push(user);
		await persistStore();
		return response.status(201).json({ user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.post("/api/auth/login", async (request, response, next) => {
	try {
		const email = cleanText(request.body?.email, 120).toLowerCase();
		const password = typeof request.body?.password === "string" ? request.body.password : "";
		const user = store.users.find((entry) => entry.email === email);
		if (!user || !user.salt || !user.hash) {
			return response.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
		}
		const actualHash = Buffer.from(user.hash, "hex");
		const submittedHash = await scrypt(password, user.salt, actualHash.length);
		if (actualHash.length !== submittedHash.length || !timingSafeEqual(actualHash, submittedHash)) {
			return response.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
		}

		const token = randomBytes(32).toString("hex");
		sessions.set(token, user.id);
		setSessionCookie(response, token);
		return response.json({ user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.post("/api/auth/logout", (request, response) => {
	const token = cookieValue(request, "traveller_session");
	if (token) sessions.delete(token);
	clearSessionCookie(response);
	response.json({ ok: true });
});

app.post("/api/inquiries", async (request, response, next) => {
	try {
		const name = cleanText(request.body?.name, 80);
		const email = cleanText(request.body?.email, 120).toLowerCase();
		const topic = cleanText(request.body?.topic, 80);
		const message = cleanText(request.body?.message, 2000);
		if (!name || !validEmail(email) || !topic || message.length < 10) {
			return response.status(400).json({ error: "Vui lòng kiểm tra lại thông tin và nội dung lời nhắn (tối thiểu 10 ký tự)." });
		}

		const inquiry = {
			id: randomUUID(),
			name,
			email,
			topic,
			message,
			createdAt: new Date().toISOString(),
		};
		store.inquiries.push(inquiry);
		await persistStore();
		return response.status(201).json({ inquiry: { id: inquiry.id, name: inquiry.name } });
	} catch (error) {
		return next(error);
	}
});

app.use("/api", (request, response) => {
	response.status(404).json({ error: "Không tìm thấy API." });
});

app.use(express.static(buildDirectory));

app.use((error, request, response, next) => {
	if (response.headersSent) return next(error);
	const status = Number.isInteger(error.status) ? error.status : 500;
	if (status >= 500) console.error(error);
	return response.status(status).json({
		error: status === 400 ? "Dữ liệu JSON gửi lên không hợp lệ." : "Máy chủ không thể xử lý yêu cầu lúc này.",
	});
});

async function start() {
	await mkdir(dataDirectory, { recursive: true });
	try {
		const savedData = JSON.parse(await readFile(dataPath, "utf8"));
		if (!Array.isArray(savedData.users) || !Array.isArray(savedData.inquiries)) {
			throw new Error(`${dataPath} không có cấu trúc users/inquiries hợp lệ.`);
		}
		store = savedData;
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}

	app.listen(port, () => {
		console.log(`Traveller Team API listening on http://localhost:${port}`);
	});
}

start().catch((error) => {
	console.error("Could not start Traveller Team server:", error);
	process.exitCode = 1;
});
