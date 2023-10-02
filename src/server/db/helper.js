/*
const sqlite3 = require('sqlite')
const { open } = require('sqlite')
*/

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

/*
	create a databse and
	fill it with default data
	
	every slot is 1 hour long
*/
const DBNAME = 'schedule.sqlite';
const database = {
	filename: DBNAME,
	driver: sqlite3.Database
}

open(database).then((db) => {
	fillDefaultData(db)
}).catch((err) => {
	throw new Error(`Database error: ${err}`)
})

async function fillDefaultData(db) {
	// check if data exists
	const users = await db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`)

	const slots = await db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='slots'`)

	// fill in default data

	//create users table if it doesn't exist
	if (users.length === 0) {
		const defaultUsers = [
			{
				uid: 1,
				password: "windypanda49"
			},
			{
				uid: 2,
				password: "goodpear88"
			},
			{
				uid: 3,
				password: "freeglass36"
			},
		]

		db.exec('CREATE TABLE users (uid INTEGER PRIMARY KEY, password TEXT)');

		// populate the default data
		for (const { uid, password } of defaultUsers) {
			const query = `INSERT INTO users (uid, password) VALUES ('${uid}', '${password}')`
			db.run(query)
		}
	}

	// create slots table if it doesn't exist
	if (slots.length === 0) {
		db.exec(`
			CREATE TABLE slots (
			sid INTEGER PRIMARY KEY,
			slot TEXT,
			withuid INTEGER NOT NULL,
			byuid INTEGER DEFAULT NULL,
			FOREIGN KEY (withuid) REFERENCES users (uid),
			FOREIGN KEY (byuid) REFERENCES users (uid))
		`);

		const defaultSlots = [
			{
				sid: 1,
				slot: "1696480200",
				withuid: 2,
				byuid: null,
			},
			{
				sid: 2,
				slot: "1696566600",
				withuid: 2,
				byuid: null,
			},
			{
				sid: 3,
				slot: "1697085000",
				withuid: 2,
				byuid: null,
			},
			{
				sid: 4,
				slot: "1697171400",
				withuid: 2,
				byuid: null,
			},
		]
	}

}

// check if user exists in the database
async function isExistingUser(uid, password) {
	const query = `
		SELECT * FROM users
		WHERE uid = '${uid}' AND password = '${password}'
	`
	return new Promise((resolve, reject) => {
		open(database).then((db) => {
			db.all(query).then((rows) => {
				// only one valid entry can be in users table
				const row = rows[0]
				resolve(
					row?.uid === parseInt(uid)
					&& row?.password === password
				)
			}).catch((err) => {
				throw new Error(`Database error: ${err}`)
			})
		})
	})
}

// get all the booked slots for a warden
async function getBookedSlots(uid) {
	const query = `
		SELECT * FROM slots
		WHERE withuid = '${uid}'
	`

	return new Promise((resolve, reject) => {
		open(database).then((db) => {
			db.all(query).then((rows) => {
				resolve(rows)
			}).catch((err) => {
				throw new Error(`Database error: ${err}`)
			})
		})
	})
}

export { isExistingUser, getSlots }

