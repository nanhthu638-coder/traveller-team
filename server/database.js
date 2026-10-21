import sql from "mssql";

const COLLECTIONS = ["users", "inquiries", "bookings", "reviews", "vouchers", "payments"];

function getConfig(database = process.env.SQLSERVER_DATABASE || "TravellerTeam") {
	const server = process.env.SQLSERVER_SERVER || "localhost";
	const instanceName = process.env.SQLSERVER_INSTANCE;
	const user = process.env.SQLSERVER_USER;
	const password = process.env.SQLSERVER_PASSWORD;
	if (!user || !password) {
		throw new Error("Thiếu SQLSERVER_USER hoặc SQLSERVER_PASSWORD. Hãy cấu hình biến môi trường SQL Server.");
	}
	return {
		server,
		database,
		user,
		password,
		options: {
			encrypt: process.env.SQLSERVER_ENCRYPT === "true",
			trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== "false",
			...(instanceName ? { instanceName } : {}),
		},
		pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
	};
}

export async function connectDatabase() {
	const databaseName = process.env.SQLSERVER_DATABASE || "TravellerTeam";
	if (!/^[A-Za-z0-9_]+$/.test(databaseName)) throw new Error("SQLSERVER_DATABASE chỉ được chứa chữ, số và dấu gạch dưới.");
	const pool = await new sql.ConnectionPool(getConfig(databaseName)).connect();
	await pool.request().query(`
		IF OBJECT_ID(N'dbo.AppRecords', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.AppRecords (
				Collection NVARCHAR(32) NOT NULL,
				RecordId NVARCHAR(100) NOT NULL,
				Payload NVARCHAR(MAX) NOT NULL,
				UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_AppRecords_UpdatedAt DEFAULT SYSUTCDATETIME(),
				CONSTRAINT PK_AppRecords PRIMARY KEY (Collection, RecordId),
				CONSTRAINT CK_AppRecords_Collection CHECK (Collection IN ('users', 'inquiries', 'bookings', 'reviews', 'vouchers', 'payments')),
				CONSTRAINT CK_AppRecords_Payload CHECK (ISJSON(Payload) = 1)
			);
		END
	`);
	return pool;
}

export async function loadDatabaseState(pool) {
	const result = await pool.request().query("SELECT Collection, RecordId, Payload FROM dbo.AppRecords");
	const state = Object.fromEntries(COLLECTIONS.map((collection) => [collection, []]));
	for (const row of result.recordset) {
		if (!state[row.Collection]) throw new Error(`Loại dữ liệu SQL không hợp lệ: ${row.Collection}`);
		state[row.Collection].push(JSON.parse(row.Payload));
	}
	return state;
}

export async function saveDatabaseState(pool, state) {
	const records = COLLECTIONS.flatMap((collection) => (state[collection] || []).map((item) => {
		if (!item || typeof item.id !== "string") throw new Error(`Bản ghi ${collection} thiếu id hợp lệ.`);
		return { collection, id: item.id, payload: JSON.stringify(item) };
	}));
	const transaction = new sql.Transaction(pool);
	await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
	try {
		const request = new sql.Request(transaction);
		request.input("records", sql.NVarChar(sql.MAX), JSON.stringify(records));
		await request.query(`
			DELETE FROM dbo.AppRecords;
			INSERT INTO dbo.AppRecords (Collection, RecordId, Payload)
			SELECT Collection, RecordId, Payload
			FROM OPENJSON(@records)
			WITH (
				Collection NVARCHAR(32) '$.collection',
				RecordId NVARCHAR(100) '$.id',
				Payload NVARCHAR(MAX) '$.payload'
			);
		`);
		await transaction.commit();
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}
