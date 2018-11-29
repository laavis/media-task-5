"use strict";
const mysql = require("mysql2");

const connect = () => {
  // create the connection to database
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS
  });
  return connection;
};

const select = (connection, callback, res) => {
  // simple query
  connection.query("SELECT * FROM cattos", (err, results, fields) => {
    callback(results, res);
  });
};

const insert = (data, connection, callback) => {
  // simple query
  connection.execute(
    "INSERT INTO cattos (category, title, details, thumbnail, image, original) VALUES (?,?,?,?,?,?);",
    data,
    (err, results, fields) => {
      callback();
    }
  );
};

module.exports = {
  connect: connect,
  select: select,
  insert: insert
};
