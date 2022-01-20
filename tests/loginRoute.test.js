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
    test("assume one user: 401 since invalid username (or if username isn't given)" , async() => {
        const userLogin = {
            password: "livelikeawarrior"
        }
        const res = await api.post("/api/login")
            .send(userLogin)
            .expect(401)
            .expect("Content-Type", /application\/json/)
        expect(res.body.error).toBe("invalid login")
    })

    //test("401 since invalid password (or if password isn't given)", async() => {


    //})
})

afterAll(() => {
    mongoose.connection.close()
})
