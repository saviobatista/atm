const database = {
  //TODO: Fix this using process.env or something else
  server: "localhost",
  user: "sa",
  password: "NavTakp190!",
  timeout: 120000000,
  connectionTimeout: 120000000,
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  requestTimeout: 120000000,
  pool: {
    max: 1000,
    min: 1,
    idleTimeoutMillis: 120000000,
    acquireTimeoutMillis: 120000000,
    createTimeoutMillis: 120000000,
    destroyTimeoutMillis: 120000000,
    reapIntervalMillis: 120000000,
    createRetryIntervalMillis: 120000000,
  },
};

export default database;
