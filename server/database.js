import sql from "mssql";

const COLLECTIONS = ["users", "inquiries", "bookings", "reviews", "vouchers", "payments", "sessions"];

function getConfig(database = process.env.SQLSERVER_DATABASE || "TravellerTeam") {
	const server = process.env.SQLSERVER_SERVER || "localhost";
	const port = process.env.SQLSERVER_PORT ? Number(process.env.SQLSERVER_PORT) : undefined;
	const instanceName = process.env.SQLSERVER_INSTANCE;
	const user = process.env.SQLSERVER_USER;
	const password = process.env.SQLSERVER_PASSWORD;
	if (!user || !password) {
		throw new Error("Thiếu SQLSERVER_USER hoặc SQLSERVER_PASSWORD. Hãy cấu hình biến môi trường SQL Server.");
	}
	if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
		throw new Error("SQLSERVER_PORT phải là số nguyên từ 1 đến 65535.");
	}
	return {
		server,
		...(port ? { port } : {}),
		database,
		user,
		password,
		options: {
			encrypt: process.env.SQLSERVER_ENCRYPT === "true",
			trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== "false",
			...(instanceName && !port ? { instanceName } : {}),
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
				CONSTRAINT CK_AppRecords_Collection CHECK (Collection IN ('users', 'inquiries', 'bookings', 'reviews', 'vouchers', 'payments', 'sessions')),
				CONSTRAINT CK_AppRecords_Payload CHECK (ISJSON(Payload) = 1)
			);
		END

		IF EXISTS (
			SELECT 1 FROM sys.check_constraints
			WHERE name = N'CK_AppRecords_Collection' AND parent_object_id = OBJECT_ID(N'dbo.AppRecords')
		)
		BEGIN
			ALTER TABLE dbo.AppRecords DROP CONSTRAINT CK_AppRecords_Collection;
		END
		ALTER TABLE dbo.AppRecords
		ADD CONSTRAINT CK_AppRecords_Collection
			CHECK (Collection IN ('users', 'inquiries', 'bookings', 'reviews', 'vouchers', 'payments', 'sessions'));
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
			DECLARE @incoming TABLE (
				Collection NVARCHAR(32) NOT NULL,
				RecordId NVARCHAR(100) NOT NULL,
				Payload NVARCHAR(MAX) NOT NULL,
				PRIMARY KEY (Collection, RecordId)
			);

			INSERT INTO @incoming (Collection, RecordId, Payload)
			SELECT Collection, RecordId, Payload
			FROM OPENJSON(@records) WITH (
				Collection NVARCHAR(32) '$.collection',
				RecordId NVARCHAR(100) '$.id',
				Payload NVARCHAR(MAX) '$.payload'
			);

			DELETE target
			FROM dbo.AppRecords AS target
			WHERE target.Collection IN ('users', 'inquiries', 'bookings', 'reviews', 'vouchers', 'payments', 'sessions')
				AND NOT EXISTS (
					SELECT 1 FROM @incoming AS source
					WHERE source.Collection = target.Collection AND source.RecordId = target.RecordId
				);

			UPDATE target
			SET Payload = source.Payload, UpdatedAt = SYSUTCDATETIME()
			FROM dbo.AppRecords AS target
			INNER JOIN @incoming AS source
				ON source.Collection = target.Collection AND source.RecordId = target.RecordId
			WHERE target.Payload <> source.Payload;

			INSERT INTO dbo.AppRecords (Collection, RecordId, Payload)
			SELECT source.Collection, source.RecordId, source.Payload
			FROM @incoming AS source
			WHERE NOT EXISTS (
				SELECT 1 FROM dbo.AppRecords AS target
				WHERE target.Collection = source.Collection AND target.RecordId = source.RecordId
			);
		`);
		await transaction.commit();
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}
