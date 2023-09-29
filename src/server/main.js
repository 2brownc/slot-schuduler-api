const express = require("express")
const jwt = require("jsonwebtoken")
const ViteExpress = require("vite-express");

// load env variables
require('dotenv').config()

// express
const app = express()

// token for JWT
const secretKey = process.env.VITE_SECRET;

/*
  test path that says "Hello!"
*/
app.get("/hello", (req, res) => {
  res.send("Hello!")
});

ViteExpress.listen(app, 80, () =>
  console.log("Server is listening on port 80...")
);
