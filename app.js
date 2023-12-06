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
