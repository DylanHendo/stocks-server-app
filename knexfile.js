module.exports = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    database: 'webcomputing',
    user: 'root',
    password: process.env.DB_PASS
  }
}

// current IP : 172.22.26.223