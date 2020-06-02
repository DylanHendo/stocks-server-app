module.exports = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    database: 'webcomputing',
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  }
}