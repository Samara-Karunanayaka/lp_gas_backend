const express = require("express");
const bodyParser = require('body-parser');
const mysql = require("mysql");
const dotenv = require("dotenv")
// const cors = require("cors")

const bcrypt = require('bcryptjs')
dotenv.config({ path: './.env' })

const app = express();
// app.use(cors())

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT
  });


app.set('view engine', 'hbs')

db.connect( (error) => {
    if(error) {
        console.log(error)
    }else {
        console.log("MYSQL connected")
    }
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type');
   res.header('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  } else {
      return next();
  }
});


///login apis

//admin login start
app.post('/api/auth/admin', (req, res) => {

    var dataset= req.body;
    var username=dataset.username; 
    var password=dataset.password; 

    
    console.log(dataset)
    var query="SELECT * FROM admin WHERE username = '"+username+"'";
    //   var query=" call login('"+username+"');";

   
    console.log(query)

    db.query(query, async (err, results) => {
 

      if (err) throw err;
  
      if (results.length > 0) { 
        const match = await bcrypt.compare(password, results[0].password); 
        if (match) {
          res.json({ success: true, message: 'Login successful' });
        } else {
          res.json({ success: false, message: 'Invalid credentials' });
        }
      } else {
        res.json({ success: false, message: 'User not found' });
      }
    });
  });
//admin login end

//user login start

app.post('/api/userlogin', (req, res) => {
  const dataset = req.body;
  const email = dataset.email;
  const password = dataset.password;

  // Check if the email exists in tblcustomer
  const checkCustomerEmailQuery = "SELECT * FROM tblcustomer WHERE email = ?";
  db.query(checkCustomerEmailQuery, [email], async (error, customerResults) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error checking customer email');
    }

    // Check if the email exists in tblseller
    const checkSellerEmailQuery = "SELECT * FROM tblseller WHERE email = ?";
    db.query(checkSellerEmailQuery, [email], async (error, sellerResults) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Error checking seller email');
      }

      if (customerResults.length > 0) {
        // Email exists in tblcustomer
        const match = await bcrypt.compare(password, customerResults[0].password);
        if (match) {
          res.json({ success: true, userType: 'customer', message: 'Customer Login successful' });
          console.log(res)
        } else {
          res.json({ success: false, message: 'Invalid credentials' });
        }
      } else if (sellerResults.length > 0) {
        // Email exists in tblseller
        const match = await bcrypt.compare(password, sellerResults[0].password);
        if (match) {
          res.json({ success: true, userType: 'seller', message: 'Seller Login successful' });
          
        } else {
          res.json({ success: false, message: 'Invalid credentials' });
        }
      } else {
        res.json({ success: false, message: 'User not found' });
      }
    });
  });
});


//user login end
//login api end


//Registration APIs for sellers and customers
 
app.post("/api/signup", (req, res) => {
  var dataset = req.body;
  var name = dataset.name;
  var email = dataset.email;
  var usertype = dataset.usertype;
  var address = dataset.address;
  var password = dataset.password;

  // Check if the email already exists in the database
  const checkEmailQuery =
    "SELECT COUNT(*) AS count FROM tblcustomer WHERE email = ?";
  db.query(checkEmailQuery, [email], (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error checking email");
    }

    const emailExists = results[0].count > 0;

    if (emailExists) {
      return res.status(400).send("Email already exists in the database");
    } else {
      // Hash the password and insert data into the tables
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error hashing password");
        }

        if (usertype === "customer") {
          var query =
            "INSERT INTO tblcustomer (name, email, address, password) VALUES (?, ?, ?, ?)";
          db.query(
            query,
            [name, email, address, hashedPassword],
            (error, results, fields) => {
              if (error) {
                console.error(error);

                return res.status(500).json({
                  success: false,
                  message: "Error registering customer",
                });
              } else {
                return res.status(200).json({
                  success: false,
                  message: "Customer registered successfully",
                });
              }
            }
          );
        } else {
          var query =
            "INSERT INTO tblseller (name, email, address, password) VALUES (?, ?, ?, ?)";
          db.query(
            query,
            [name, email, address, hashedPassword],
            (error, results, fields) => {
              if (error) {
                console.error(error);

                return res.status(500).json({
                  success: false,
                  message: "Error registering seller",
                });
              } else {
                return res.status(200).json({
                  success: false,
                  message: "Seller registered successfully",
                });
              }
            }
          );
        }
      });
    }
  });
});

//Seller Registration End

//retrive data from db

//retrieve data for admin

//for dashboard
app.post('/api/dashboard', (req, res) => {
  const sqlTotSellers = 'SELECT COUNT(*) AS total_sellers FROM tblseller;';
  const sqlTotCustomers = 'SELECT COUNT(*) AS total_customers FROM tblcustomer;';
  
  db.query(sqlTotSellers, (errSellers, resultSellers) => {
    if (errSellers) {
      console.error('Error fetching sellers:', errSellers);
      res.status(500).json({ error: 'Error fetching sellers' });
    } else {
      db.query(sqlTotCustomers, (errCustomers, resultCustomers) => {
        if (errCustomers) {
          console.error('Error fetching customers:', errCustomers);
          res.status(500).json({ error: 'Error fetching customers' });
        } else {
          const totalSellersCount = resultSellers[0].total_sellers;
          const totalCustomersCount = resultCustomers[0].total_customers;
          
          res.json({
            totalSellersCount: totalSellersCount,
            totalCustomersCount: totalCustomersCount
          });
        }
      });
    }
  });
});
//sellers
app.get('/api/sellers', (req, res) => {
  const sql = 'SELECT s_id AS id, name, email, address FROM tblseller';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching seller data:', err);
      res.status(500).json({ error: 'Error fetching seller data' });
      return;
    }
    res.json(result);
  });
});

// DELETE route to delete a seller by ID
app.delete('/api/sellers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tblseller WHERE s_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting seller:', err);
      res.status(500).json({ error: 'Error deleting seller' });
      return;
    }
    res.json({ message: `Seller with ID ${id} deleted successfully` });
  });
});

//customers
app.get('/api/customers', (req, res) => {
  const sql = 'SELECT c_id AS id, name, email, address FROM tblcustomer';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching customer data:', err);
      res.status(500).json({ error: 'Error fetching customer data' });
      return;
    }
    res.json(result);
  });
});
// DELETE route to delete a customer by ID
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tblcustomer WHERE c_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting customer:', err);
      res.status(500).json({ error: 'Error deleting customer' });
      return;
    }
    res.json({ message: `Customer with ID ${id} deleted successfully` });
  });
});

//manage stocks
//seller stocks details
app.get('/api/stocks', (req, res) => {
  const sql = 'SELECT stock_id AS stock_id, seller_id, regular, budget, buddy FROM tblsellerstock';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching seller data:', err);
      res.status(500).json({ error: 'Error fetching seller data' });
      return;
    }
    res.json(result);
  });
});


app.listen(5000, () => {
    console.log("Server started on port 5000")
})
