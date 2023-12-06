const mysql = require('mysql');
const bcrypt = require('bcryptjs')
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'gashubdb',
    port: '3308'
  });

  //this code using for encrypt the admin passwords
