import { randomBytes, randomInt } from 'node:crypto'
import { mkdirSync, existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import express from 'express'
import { jobs } from '../src/jobsData.js'

const directory = dirname(fileURLToPath(import.meta.url))
const databasePath = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : resolve(directory, 'data', 'stuwork.sqlite')
mkdirSync(dirname(databasePath), { recursive: true })

const database = new Database(databasePath)
database.pragma('journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'seeker',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)
if (!database.pragma('table_info(users)').some((column) => column.name === 'role')) {
  database.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'seeker'")
}
database.exec(`
  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    assigned_role TEXT NOT NULL DEFAULT 'support',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)

for (const [column, definition] of [
  ['university', 'TEXT'],
  ['major', 'TEXT'],
  ['graduation_year', 'INTEGER'],
  ['bio', 'TEXT'],
  ['skills', 'TEXT'],
  ['cv_path', 'TEXT'],
  ['cv_original_name', 'TEXT'],
  ['cv_uploaded_at', 'TEXT'],
]) {
  if (!database.pragma('table_info(users)').some((item) => item.name === column)) {
    database.exec(`ALTER TABLE users ADD COLUMN ${column} ${definition}`)
  }
}
database.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    job_id INTEGER NOT NULL,
    cover_letter TEXT,
    cv_path TEXT NOT NULL,
    cv_original_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'withdrawn')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, job_id)
  )
`)

const app = express()
const otpByIdentifier = new Map()
const resetTokens = new Map()
const requestTimes = new Map()
const sessions = new Map()
const port = Number(process.env.PORT) || 3001
const bcryptRounds = 12
const otpLifetimeMs = 5 * 60 * 1000
const resetTokenLifetimeMs = 10 * 60 * 1000
const otpResendDelayMs = 60 * 1000
const sessionLifetimeMs = 12 * 60 * 60 * 1000
const cvDirectory = resolve(dirname(databasePath), 'cvs')
mkdirSync(cvDirectory, { recursive: true })
const maxCvBytes = 5 * 1024 * 1024
const cvTypes = {
  '.pdf': { signature: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf' },
  '.docx': { signature: [0x50, 0x4b, 0x03, 0x04], mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  '.doc': { signature: [0xd0, 0xcf, 0x11, 0xe0], mime: 'application/msword' },
}

app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))
const cvUpload = express.raw({ type: 'application/octet-stream', limit: maxCvBytes })

function normalizePhone(value) {
  const phone = value.trim().replace(/[^\d+]/g, '')
  if (phone.startsWith('+84')) return `0${phone.slice(3)}`
  if (phone.startsWith('84') && phone.length >= 11) return `0${phone.slice(2)}`
  return phone
}

function normalizeIdentifier(value) {
  const trimmed = value.trim()
  return trimmed.includes('@') ? trimmed.toLowerCase() : normalizePhone(trimmed)
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isPhone(value) {
  return /^\+?\d{8,15}$/.test(value)
}

function isPhoneInput(value) {
  return /^[\d\s+().-]+$/.test(value) && isPhone(normalizePhone(value))
}

function authenticateRequest(request, response, next) {
  const authorization = request.get('authorization') ?? ''
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]+)$/)
  const token = match?.[1]
  const session = token ? sessions.get(token) : null
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token)
    return response.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
  }
  request.auth = { token, user: session.user }
  return next()
}

function requireSupportRole(request, response, next) {
  if (request.auth.user.role !== 'support') {
    return response.status(403).json({ error: 'Bạn không có quyền truy cập khu vực hỗ trợ.' })
  }
  return next()
}

function getUserByIdentifier(identifier) {
  const normalized = normalizeIdentifier(identifier)
  return normalized.includes('@')
    ? database.prepare('SELECT id, email, phone FROM users WHERE email = ?').get(normalized)
    : database.prepare('SELECT id, email, phone FROM users WHERE phone = ?').get(normalized)
}

app.post('/api/auth/register', async (request, response) => {
  const { name, email, phone, password } = request.body ?? {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return response.status(400).json({ error: 'Họ tên cần có từ 2 đến 80 ký tự.' })
  }
  if (typeof email !== 'string' || !isEmail(email.trim())) {
    return response.status(400).json({ error: 'Email chưa đúng định dạng.' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPhone = typeof phone === 'string' ? normalizePhone(phone) : ''
  if (typeof phone !== 'string' || !isPhoneInput(phone)) {
    return response.status(400).json({ error: 'Số điện thoại chưa đúng định dạng.' })
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return response.status(400).json({ error: 'Mật khẩu cần có ít nhất 8 ký tự và không vượt quá 72 byte.' })
  }

  const existingUser = database.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(normalizedEmail, normalizedPhone)
  if (existingUser) {
    return response.status(409).json({ error: 'Email hoặc số điện thoại này đã được đăng ký.' })
  }

  const passwordHash = await bcrypt.hash(password, bcryptRounds)
  database.prepare('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)')
    .run(name.trim(), normalizedEmail, normalizedPhone, passwordHash)
  return response.status(201).json({ message: 'Tạo tài khoản thành công.' })
})

app.post('/api/auth/login', async (request, response) => {
  const { identifier, password } = request.body ?? {}
  if (typeof identifier !== 'string' || !identifier.trim() || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return response.status(400).json({ error: 'Vui lòng nhập email/số điện thoại và mật khẩu.' })
  }
  const normalized = normalizeIdentifier(identifier)
  const user = normalized.includes('@')
    ? database.prepare('SELECT id, name, email, phone, password_hash, role FROM users WHERE email = ?').get(normalized)
    : database.prepare('SELECT id, name, email, phone, password_hash, role FROM users WHERE phone = ?').get(normalized)
  const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false
  if (!passwordMatches) {
    return response.status(401).json({ error: 'Email/số điện thoại hoặc mật khẩu chưa chính xác.' })
  }
  const { id, name, email, phone, role } = user
  const accessToken = randomBytes(32).toString('base64url')
  sessions.set(accessToken, {
    user: { id, name, email, phone, role },
    expiresAt: Date.now() + sessionLifetimeMs,
  })
  return response.json({
    message: 'Đăng nhập thành công.',
    accessToken,
    user: { id, name, email, phone, role },
  })
})

app.delete('/api/auth/session', authenticateRequest, (request, response) => {
  sessions.delete(request.auth.token)
  return response.json({ message: 'Đăng xuất thành công.' })
})

app.post('/api/contact', (request, response) => {
  const { name, email, subject, message } = request.body ?? {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return response.status(400).json({ error: 'Họ tên cần có từ 2 đến 80 ký tự.' })
  }
  if (typeof email !== 'string' || !isEmail(email.trim()) || email.trim().length > 254) {
    return response.status(400).json({ error: 'Email chưa đúng định dạng.' })
  }
  if (typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 120) {
    return response.status(400).json({ error: 'Chủ đề cần có từ 3 đến 120 ký tự.' })
  }
  if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
    return response.status(400).json({ error: 'Nội dung cần có từ 10 đến 5000 ký tự.' })
  }

  database.prepare(`
    INSERT INTO contact_requests (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim())
  return response.status(201).json({ message: 'Biểu mẫu của bạn đã được gửi.' })
})

app.get('/api/support/requests', authenticateRequest, requireSupportRole, (_request, response) => {
  const requests = database.prepare(`
    SELECT id, name, email, subject, message, status, created_at, updated_at
    FROM contact_requests
    WHERE assigned_role = 'support'
    ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, created_at DESC
  `).all()
  return response.json({ requests })
})

app.patch('/api/support/requests/:id', authenticateRequest, requireSupportRole, (request, response) => {
  const id = Number(request.params.id)
  const { status } = request.body ?? {}
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Mã yêu cầu không hợp lệ.' })
  }
  if (!['new', 'in_progress', 'resolved'].includes(status)) {
    return response.status(400).json({ error: 'Trạng thái yêu cầu không hợp lệ.' })
  }
  const result = database.prepare(`
    UPDATE contact_requests SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND assigned_role = 'support'
  `).run(status, id)
  if (result.changes === 0) {
    return response.status(404).json({ error: 'Không tìm thấy yêu cầu hỗ trợ.' })
  }
  return response.json({ message: 'Đã cập nhật trạng thái yêu cầu.' })
})

app.post('/api/auth/forgot-password', (request, response) => {
  if (process.env.NODE_ENV === 'production') {
    return response.status(503).json({ error: 'Dịch vụ gửi OTP chưa được cấu hình. Vui lòng liên hệ hỗ trợ.' })
  }
  const { identifier } = request.body ?? {}
  if (typeof identifier !== 'string' || !identifier.trim()) {
    return response.status(400).json({ error: 'Vui lòng nhập email hoặc số điện thoại.' })
  }
  const normalized = normalizeIdentifier(identifier)
  if (normalized.includes('@') ? !isEmail(normalized) : !isPhoneInput(identifier)) {
    return response.status(400).json({ error: 'Email hoặc số điện thoại chưa đúng định dạng.' })
  }
  const user = getUserByIdentifier(normalized)
  if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản với thông tin này.' })

  const now = Date.now()
  const lastRequest = requestTimes.get(normalized) ?? 0
  if (now - lastRequest < otpResendDelayMs) {
    return response.status(429).json({ error: 'Vui lòng đợi một chút trước khi gửi lại mã OTP.' })
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  otpByIdentifier.set(normalized, { code, expiresAt: now + otpLifetimeMs, attempts: 0 })
  requestTimes.set(normalized, now)
  return response.json({ message: 'Mã xác nhận đã được tạo.', developmentCode: code })
})

app.post('/api/auth/verify-otp', (request, response) => {
  const { identifier, code } = request.body ?? {}
  if (typeof identifier !== 'string' || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return response.status(400).json({ error: 'Vui lòng nhập mã OTP gồm 6 chữ số.' })
  }
  const normalized = normalizeIdentifier(identifier)
  const challenge = otpByIdentifier.get(normalized)
  if (!challenge || challenge.expiresAt <= Date.now()) {
    otpByIdentifier.delete(normalized)
    return response.status(400).json({ error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' })
  }
  challenge.attempts += 1
  if (challenge.attempts > 5) {
    otpByIdentifier.delete(normalized)
    return response.status(429).json({ error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.' })
  }
  if (challenge.code !== code) {
    return response.status(400).json({ error: 'Mã OTP chưa chính xác. Vui lòng kiểm tra lại.' })
  }

  otpByIdentifier.delete(normalized)
  const user = getUserByIdentifier(normalized)
  if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
  const resetToken = randomBytes(32).toString('base64url')
  resetTokens.set(resetToken, { userId: user.id, expiresAt: Date.now() + resetTokenLifetimeMs })
  return response.json({ resetToken })
})

app.post('/api/auth/reset-password', async (request, response) => {
  const { resetToken, password } = request.body ?? {}
  if (typeof resetToken !== 'string' || !resetToken || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return response.status(400).json({ error: 'Mật khẩu mới cần có ít nhất 8 ký tự và không vượt quá 72 byte.' })
  }
  const tokenData = resetTokens.get(resetToken)
  if (!tokenData || tokenData.expiresAt <= Date.now()) {
    resetTokens.delete(resetToken)
    return response.status(401).json({ error: 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng xác nhận OTP lại.' })
  }

  const passwordHash = await bcrypt.hash(password, bcryptRounds)
  database.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, tokenData.userId)
  resetTokens.delete(resetToken)
  return response.json({ message: 'Mật khẩu đã được cập nhật.' })
})


function parseDeadline(value) {
  const [day, month, year] = value.split('/').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59)
}

function getJobAvailability(jobId, userId) {
  const job = jobs.find((item) => item.id === jobId)
  if (!job) return null
  const { applied } = database.prepare(
    "SELECT COUNT(*) AS applied FROM applications WHERE job_id = ? AND status = 'submitted'",
  ).get(jobId)
  const expired = parseDeadline(job.deadline).getTime() < Date.now()
  const mine = userId
    ? database.prepare('SELECT id, status, created_at FROM applications WHERE job_id = ? AND user_id = ?').get(jobId, userId)
    : null
  return {
    jobId,
    slots: job.slots,
    applied,
    remaining: Math.max(job.slots - applied, 0),
    expired,
    hasCv: userId ? Boolean(database.prepare('SELECT cv_path FROM users WHERE id = ?').get(userId)?.cv_path) : false,
    application: mine?.status === 'submitted' ? { id: mine.id, createdAt: mine.created_at } : null,
  }
}

function readProfile(userId) {
  const row = database.prepare(`
    SELECT id, name, email, phone, role, university, major, graduation_year, bio, skills,
           cv_original_name, cv_uploaded_at
    FROM users WHERE id = ?
  `).get(userId)
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    university: row.university ?? '',
    major: row.major ?? '',
    graduationYear: row.graduation_year ?? '',
    bio: row.bio ?? '',
    skills: row.skills ?? '',
    cv: row.cv_original_name ? { name: row.cv_original_name, uploadedAt: row.cv_uploaded_at } : null,
  }
}

function optionalText(value, max) {
  if (value === undefined || value === null || value === '') return { value: null }
  if (typeof value !== 'string' || value.trim().length > max) return { error: true }
  return { value: value.trim() }
}

function requireSeeker(request, response, next) {
  if (request.auth.user.role !== 'seeker') {
    return response.status(403).json({ error: 'Chỉ tài khoản ứng viên mới dùng được chức năng này.' })
  }
  return next()
}

app.get('/api/profile', authenticateRequest, requireSeeker, (request, response) => {
  return response.json({ profile: readProfile(request.auth.user.id) })
})

app.put('/api/profile', authenticateRequest, requireSeeker, (request, response) => {
  const { name, phone, university, major, graduationYear, bio, skills } = request.body ?? {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return response.status(400).json({ error: 'Họ tên cần có từ 2 đến 80 ký tự.' })
  }
  if (typeof phone !== 'string' || !isPhoneInput(phone)) {
    return response.status(400).json({ error: 'Số điện thoại chưa đúng định dạng.' })
  }
  const normalizedPhone = normalizePhone(phone)
  const duplicate = database.prepare('SELECT id FROM users WHERE phone = ? AND id != ?').get(normalizedPhone, request.auth.user.id)
  if (duplicate) return response.status(409).json({ error: 'Số điện thoại này đã được tài khoản khác sử dụng.' })

  const uni = optionalText(university, 120)
  const maj = optionalText(major, 120)
  const bioText = optionalText(bio, 1000)
  const skillText = optionalText(skills, 300)
  if (uni.error || maj.error) return response.status(400).json({ error: 'Trường/ngành học tối đa 120 ký tự.' })
  if (bioText.error) return response.status(400).json({ error: 'Giới thiệu bản thân tối đa 1000 ký tự.' })
  if (skillText.error) return response.status(400).json({ error: 'Kỹ năng tối đa 300 ký tự.' })
  let year = null
  if (graduationYear !== undefined && graduationYear !== null && graduationYear !== '') {
    year = Number(graduationYear)
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return response.status(400).json({ error: 'Năm tốt nghiệp chưa hợp lệ.' })
    }
  }

  database.prepare(`
    UPDATE users SET name = ?, phone = ?, university = ?, major = ?, graduation_year = ?, bio = ?, skills = ?
    WHERE id = ?
  `).run(name.trim(), normalizedPhone, uni.value, maj.value, year, bioText.value, skillText.value, request.auth.user.id)

  for (const session of sessions.values()) {
    if (session.user.id === request.auth.user.id) {
      session.user.name = name.trim()
      session.user.phone = normalizedPhone
    }
  }
  return response.json({ message: 'Đã cập nhật hồ sơ.', profile: readProfile(request.auth.user.id) })
})

app.post('/api/profile/cv', authenticateRequest, requireSeeker, cvUpload, async (request, response) => {
  const rawName = request.get('x-file-name')
  let originalName = ''
  try {
    originalName = rawName ? decodeURIComponent(rawName) : ''
  } catch {
    originalName = ''
  }
  originalName = Array.from(originalName)
    .filter((char) => char !== '/' && char !== '\\' && char.charCodeAt(0) > 31)
    .join('')
    .slice(-120)
  const extension = originalName.includes('.') ? `.${originalName.split('.').pop().toLowerCase()}` : ''
  const type = cvTypes[extension]
  if (!type) return response.status(400).json({ error: 'CV chỉ hỗ trợ định dạng PDF, DOC hoặc DOCX.' })
  const body = request.body
  if (!Buffer.isBuffer(body) || body.length === 0) {
    return response.status(400).json({ error: 'Vui lòng chọn một file CV.' })
  }
  if (!type.signature.every((byte, index) => body[index] === byte)) {
    return response.status(400).json({ error: 'Nội dung file không khớp với định dạng CV đã chọn.' })
  }

  const fileName = `${request.auth.user.id}-${randomBytes(12).toString('hex')}${extension}`
  await writeFile(resolve(cvDirectory, fileName), body)
  const previous = database.prepare('SELECT cv_path FROM users WHERE id = ?').get(request.auth.user.id)
  database.prepare(`
    UPDATE users SET cv_path = ?, cv_original_name = ?, cv_uploaded_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(fileName, originalName, request.auth.user.id)
  // Xóa CV cũ nếu không còn đơn ứng tuyển nào đang dùng file đó.
  if (previous?.cv_path && !database.prepare('SELECT 1 FROM applications WHERE cv_path = ?').get(previous.cv_path)) {
    await unlink(resolve(cvDirectory, previous.cv_path)).catch(() => {})
  }
  return response.status(201).json({ message: 'Đã tải CV lên.', profile: readProfile(request.auth.user.id) })
})

app.get('/api/profile/cv', authenticateRequest, requireSeeker, (request, response) => {
  const row = database.prepare('SELECT cv_path, cv_original_name FROM users WHERE id = ?').get(request.auth.user.id)
  if (!row?.cv_path || !existsSync(resolve(cvDirectory, row.cv_path))) {
    return response.status(404).json({ error: 'Bạn chưa tải CV lên.' })
  }
  const extension = `.${row.cv_path.split('.').pop()}`
  response.type(cvTypes[extension]?.mime ?? 'application/octet-stream')
  return response.download(resolve(cvDirectory, row.cv_path), row.cv_original_name)
})

app.delete('/api/profile/cv', authenticateRequest, requireSeeker, async (request, response) => {
  const row = database.prepare('SELECT cv_path FROM users WHERE id = ?').get(request.auth.user.id)
  if (!row?.cv_path) return response.status(404).json({ error: 'Bạn chưa tải CV lên.' })
  database.prepare('UPDATE users SET cv_path = NULL, cv_original_name = NULL, cv_uploaded_at = NULL WHERE id = ?')
    .run(request.auth.user.id)
  if (!database.prepare('SELECT 1 FROM applications WHERE cv_path = ?').get(row.cv_path)) {
    await unlink(resolve(cvDirectory, row.cv_path)).catch(() => {})
  }
  return response.json({ message: 'Đã xóa CV.', profile: readProfile(request.auth.user.id) })
})

function optionalAuthentication(request, _response, next) {
  const match = (request.get('authorization') ?? '').match(/^Bearer ([A-Za-z0-9_-]+)$/)
  const session = match ? sessions.get(match[1]) : null
  request.auth = session && session.expiresAt > Date.now() ? { token: match[1], user: session.user } : null
  return next()
}

app.get('/api/jobs/availability', optionalAuthentication, (request, response) => {
  const items = jobs.map((job) => getJobAvailability(job.id, request.auth?.user.id))
  return response.json({ jobs: items })
})

app.get('/api/jobs/:id/availability', optionalAuthentication, (request, response) => {
  const availability = getJobAvailability(Number(request.params.id), request.auth?.user.id)
  if (!availability) return response.status(404).json({ error: 'Không tìm thấy công việc này.' })
  return response.json(availability)
})

app.post('/api/jobs/:id/apply', authenticateRequest, requireSeeker, (request, response) => {
  const jobId = Number(request.params.id)
  const job = jobs.find((item) => item.id === jobId)
  if (!job) return response.status(404).json({ error: 'Không tìm thấy công việc này.' })
  const coverLetter = optionalText(request.body?.coverLetter, 2000)
  if (coverLetter.error) return response.status(400).json({ error: 'Thư giới thiệu tối đa 2000 ký tự.' })

  // Kiểm tra slot và ghi đơn trong cùng một transaction để hai người không giành nhau slot cuối.
  const apply = database.transaction(() => {
    const user = database.prepare('SELECT cv_path, cv_original_name FROM users WHERE id = ?').get(request.auth.user.id)
    if (!user?.cv_path) return { status: 400, error: 'Bạn cần tải CV lên hồ sơ trước khi ứng tuyển.' }
    if (parseDeadline(job.deadline).getTime() < Date.now()) {
      return { status: 410, error: 'Tin tuyển dụng này đã hết hạn nộp hồ sơ.' }
    }
    const existing = database.prepare('SELECT id, status FROM applications WHERE user_id = ? AND job_id = ?')
      .get(request.auth.user.id, jobId)
    if (existing?.status === 'submitted') return { status: 409, error: 'Bạn đã ứng tuyển công việc này rồi.' }
    const { applied } = database.prepare(
      "SELECT COUNT(*) AS applied FROM applications WHERE job_id = ? AND status = 'submitted'",
    ).get(jobId)
    if (applied >= job.slots) return { status: 409, error: 'Công việc này đã đủ số lượng tuyển (hết slot).' }

    if (existing) {
      database.prepare(`
        UPDATE applications SET status = 'submitted', cover_letter = ?, cv_path = ?, cv_original_name = ?, created_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(coverLetter.value, user.cv_path, user.cv_original_name, existing.id)
    } else {
      database.prepare(`
        INSERT INTO applications (user_id, job_id, cover_letter, cv_path, cv_original_name)
        VALUES (?, ?, ?, ?, ?)
      `).run(request.auth.user.id, jobId, coverLetter.value, user.cv_path, user.cv_original_name)
    }
    return { status: 201 }
  })
  const result = apply.immediate()
  if (result.error) return response.status(result.status).json({ error: result.error })
  return response.status(201).json({
    message: 'Ứng tuyển thành công.',
    availability: getJobAvailability(jobId, request.auth.user.id),
  })
})

app.get('/api/applications', authenticateRequest, requireSeeker, (request, response) => {
  const rows = database.prepare(`
    SELECT id, job_id, status, created_at, cv_original_name
    FROM applications WHERE user_id = ? AND status = 'submitted' ORDER BY created_at DESC
  `).all(request.auth.user.id)
  const applications = rows.flatMap((row) => {
    const job = jobs.find((item) => item.id === row.job_id)
    return job
      ? [{ id: row.id, jobId: job.id, title: job.title, company: job.company, cv: row.cv_original_name, createdAt: row.created_at }]
      : []
  })
  return response.json({ applications })
})

app.delete('/api/applications/:id', authenticateRequest, requireSeeker, (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isSafeInteger(id) || id < 1) return response.status(400).json({ error: 'Mã đơn ứng tuyển không hợp lệ.' })
  const result = database.prepare(`
    UPDATE applications SET status = 'withdrawn' WHERE id = ? AND user_id = ? AND status = 'submitted'
  `).run(id, request.auth.user.id)
  if (result.changes === 0) return response.status(404).json({ error: 'Không tìm thấy đơn ứng tuyển.' })
  return response.json({ message: 'Đã rút đơn ứng tuyển. Slot đã được trả lại.' })
})

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.too.large') {
    return response.status(413).json({ error: 'File quá lớn. CV tối đa 5 MB.' })
  }
  console.error('API request failed:', error)
  response.status(500).json({ error: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.' })
})

async function initializeSupportAccount() {
  const settings = {
    name: process.env.SUPPORT_NAME,
    email: process.env.SUPPORT_EMAIL,
    phone: process.env.SUPPORT_PHONE,
    password: process.env.SUPPORT_PASSWORD,
  }
  const configuredValues = Object.values(settings).filter(Boolean).length
  if (configuredValues === 0) return
  if (configuredValues !== Object.keys(settings).length) {
    throw new Error('Cần cấu hình đầy đủ SUPPORT_NAME, SUPPORT_EMAIL, SUPPORT_PHONE và SUPPORT_PASSWORD để tạo tài khoản hỗ trợ.')
  }
  if (typeof settings.name !== 'string' || settings.name.trim().length < 2 || settings.name.trim().length > 80
    || !isEmail(settings.email.trim()) || !isPhoneInput(settings.phone)
    || settings.password.length < 8 || Buffer.byteLength(settings.password, 'utf8') > 72) {
    throw new Error('Thông tin SUPPORT_* không hợp lệ; hãy kiểm tra tên, email, điện thoại và mật khẩu (8–72 byte).')
  }

  const email = settings.email.trim().toLowerCase()
  const existingUser = database.prepare('SELECT role FROM users WHERE email = ?').get(email)
  if (existingUser) {
    if (existingUser.role !== 'support') {
      throw new Error('Email SUPPORT_EMAIL đã được dùng bởi tài khoản không có role support.')
    }
    return
  }

  const passwordHash = await bcrypt.hash(settings.password, bcryptRounds)
  database.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, 'support')
  `).run(settings.name.trim(), email, normalizePhone(settings.phone), passwordHash)
  console.log(`Tài khoản hỗ trợ đã được tạo: ${email}`)
}

await initializeSupportAccount()

app.listen(port, () => {
  console.log(`StuWork API listening on http://localhost:${port}`)
})
