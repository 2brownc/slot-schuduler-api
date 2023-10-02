import express from "express"
import jwt from "jsonwebtoken"
import bodyParser from "body-parser"
import ViteExpress from "vite-express"

import {
  isExistingUser,
  getBookedSlots,
  getFreeSlots,
  bookSlot,
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

  const uid = jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403)

    try {
      res.uid = decoded.uid
      next()
    } catch (err) {
      return res.sendStatus(501)
    }
  })
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
  Warden A can book time slot of warden B.
  When warden B logs in and checks, B can see
  all the appointments: warden name and time slot

  every slot is 1 hour long  
*/

app.post('/bookedslots', verifyToken, async (req, res) => {
  const uid = res.uid
  const bookedSlots = await getBookedSlots(uid)
  return res.json({ bookedSlots })
})

/*
  get free slots
  Warden A can login and see
  free slots available to book
  for other wardens.
*/

app.post('/freeslots', verifyToken, async (req, res) => {
  const uid = res.uid
  const freeSlots = await getFreeSlots(uid)
  return res.json({ freeSlots })
})

/*
  book a slot with warden
  given the sid (slot id from slots table)
*/
app.post('/bookslot', verifyToken, async (req, res) => {
  const { sid } = req.body
  const uid = res.uid
  const booked = await bookSlot(sid, uid)
  return res.json({ sid, booked })
})




ViteExpress.listen(app, 80, () =>
  console.log("Server is listening on port 80...")
);