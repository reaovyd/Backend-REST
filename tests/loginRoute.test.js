const supertest = require("supertest")
const app = require("../app")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("../models/userSchema")

const api = supertest(app)

describe("Logging in tests", () => {
	beforeEach(async() => {
		await User.deleteMany({})
		const newUser = {
			username: "hiiiiii",
			password: "livelikeawarrior"
		}
		// posts work for creating new users, so we'll create it like this
		await api.post("/api/users").send(newUser)
	})
	test("assume one user: 401 since username isn't given)" , async() => {
		const userLogin = {
			password: "livelikeawarrior"
		}
		const res = await api.post("/api/login")
			.send(userLogin)
			.expect(401)
			.expect("Content-Type", /application\/json/)
		expect(res.body.error).toBe("invalid login")
	})

	test("assume one user: 401 since invalid username" , async() => {
		const userLogin = {
			username: "kewkewkew",
			password: "livelikeawarrior"
		}
		const res = await api.post("/api/login")
			.send(userLogin)
			.expect(401)
			.expect("Content-Type", /application\/json/)
		expect(res.body.error).toBe("invalid login")
	})

	test("401 since password isn't given", async() => {
		const userLogin = {
			username: "abbbbbbbbbbBB",
		}

		const res = await api.post("/api/login")
			.send(userLogin)
			.expect(401)
			.expect("Content-Type", /application\/json/)
		expect(res.body.error).toBe("invalid login")
	})

	test("401 since password is given, but doesn't match valid username", async() => {
		const userLogin = {
			username: "hiiiiii",
			password: "dontlivelikeawarrior"
		}

		const res = await api.post("/api/login")
			.send(userLogin)
			.expect(401)
			.expect("Content-Type", /application\/json/)
		expect(res.body.error).toBe("invalid login")
	})

	test("201 since username/password is valid and returns a token", async() => {
		const userLogin = {
			username: "hiiiiii",
			password: "livelikeawarrior"
		}

		const res = await api.post("/api/login")
			.send(userLogin)
			.expect(201)
			.expect("Content-Type", /application\/json/)

		expect(res.body.token).not.toBe(undefined)
	})
})

afterAll(() => {
	mongoose.connection.close()
})
