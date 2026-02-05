import mysql from 'mysql2';
import dbConfig from "../config/db-config";

export default mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  timezone: dbConfig.TIMEZONE
});

// import mysql from 'mysql2';
// import dbConfig from "../config/db-config";

// export default mysql.createConnection({
//   host: dbConfig.HOST,
//   user: dbConfig.USER,
//   password: dbConfig.PASSWORD,
//   database: dbConfig.DB,
//   port: dbConfig.PORT,
//   ssl: {
//     rejectUnauthorized: dbConfig.SSL.rejectUnauthorized,
//     ca: dbConfig.SSL.ca
//   }
// });
