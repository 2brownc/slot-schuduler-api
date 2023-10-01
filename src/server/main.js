/*
const express = require("express")
const jwt = require("jsonwebtoken")
const bodyParser = require('body-parser')
const ViteExpress = require("vite-express");
*/

import express from "express"
import jwt from "jsonwebtoken"
import bodyParser from "body-parser"
import ViteExpress from "vite-express"

import { isExistingUser } from "./db/helper.js"

// load env variables
import dotenv from 'dotenv'

dotenv.config()

// express
const app = express()
app.use(bodyParser.json())

// token for JWT
const secretKey = process.env.VITE_SECRET;

/*
  test path that says "Hello!"
*/
app.get("/hello", (req, res) => {
  res.send("Hello!")
});

// user authentication
app.post('/login', async (req, res) => {
  const { uid, password } = req.body
  const userExists = await isExistingUser(uid, password)
  console.log("user exists", userExists)
  if (userExists) {
    res.status(200).json({ message: 'Valid credentials' })
  } else {
    res.status(401).json({ message: 'Invalid credentials' })
  }
});

ViteExpress.listen(app, 80, () =>
  console.log("Server is listening on port 80...")
);
