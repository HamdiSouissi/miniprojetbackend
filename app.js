require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./model/user");
const auth = require("./middleware/auth");

const cors = require('cors');
const user = require("./model/user");

const app = express();
app.use(cors());
//Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});






app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { firstName, lastName, email, role, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName && role)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      role,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});


app.get('/dashboard', function(req, res, next) {
  res.json({name: 'Aayansh'});
});
app.get('/infirmier/:role', async function (req, res){
  try {
    // Get user input
    const role  = req.params.role;
console.log(req.params)
    if (!role ) {
      res.status(400).send("All input is required");
    }
    const users = await User.find({ role });
    res.status(201).json(users);

  }
  catch (err) {
    console.log(err);
  }



});




app.delete('/infirmier/:email', (req, res, next) => {
  user.deleteOne({email: req.params.email}).then(
    () => {
      res.status(200).json({
        message: 'Deleted!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});

app.put('/infirmier/:email', (req, res, next) => {
  // const x = new User({
  //   email: req.body.email,
  //   firstName: req.body.firstName,
  //   lastName: req.body.lastName,
  //   role:req.body.role
  // });
  const { firstName, lastName, email, role, password , etat} = req.body;

  
  User.updateOne({email: req.params.email}, {"firstName":firstName, "lastName":lastName,"email":email,"etat":etat, "role":role}).then(
    () => {
      res.status(201).json({
        message: 'nurse infos updated successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});










// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});







module.exports = app;
