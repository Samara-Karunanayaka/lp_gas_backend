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

connection.query('SELECT * FROM admin', (error, results) => {
    if (error) throw error;
  
    results.forEach((admin) => {
      // Encrypt each password and update the table
      bcrypt.hash(admin.password, 10, (err, hash) => {
        if (err) throw err;
  
        connection.query(
          'UPDATE admin SET password = ? WHERE a_id = ?',
          [hash, admin.a_id],
          (updateError, updateResults) => {
            if (updateError) throw updateError;
            console.log(`Password updated for admin with ID ${admin.a_id}`);
          }
        );
      });
    });
  });
