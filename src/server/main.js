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

import {
  isExistingUser,
  getSlots,
} from "./db/helper.js"

// load env variables
import dotenv from 'dotenv'

dotenv.config()

// express
const app = express()
app.use(bodyParser.json())

// token for JWT
const JWT_SECRET = process.env.VITE_SECRET

function generateToken(data) {
  return jwt.sign(data, JWT_SECRET)
}


function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  const id = jwt.verify(token, JWT_SECRET, (err) => {
    if (err) return res.sendStatus(403)
  })

  res.user = { id }
  next()
}


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
  if (userExists) {
    const token = generateToken({ uid })
    res.status(200).json({ token })
  } else {
    res.status(401).json({ message: 'Invalid credentials' })
  }
});

/*
  get booked slots / appointments
  Warden B can book time slot of warden A.
  When warden A logs in and checks, A can see
  all the appointments: warden name and time slot

  every slot is 1 hour long  
*/

app.post('/bookedslots', verifyToken, async (req, res) => {
  const uid = res.uid
  const slots = getBookedSlots(uid)
  return res.json({ slots })
})


ViteExpress.listen(app, 80, () =>
  console.log("Server is listening on port 80...")
);