const bcrypt = require("bcrypt")
const User = require("../models/userSchema")
const app = require("../app")
const supertest = require("supertest")
const mongoose = require("mongoose")
const initialDB = require("../utils/testhelpers/createUserRouteTestHelper").initialDB

const api = supertest(app)

describe("Checking GET request", () => {
    beforeEach(async() => {
        await User.deleteMany({})
        const vals = initialDB.map(elem => {
            return User({username: elem['username'], name: elem['name'], passwordHash: elem['password']})
        }) 
        const promises = vals.map(v => v.save())
        await Promise.all(promises)
    })

    test("check if everything is in there", async() => {
        const users = (await api.get("/api/users").expect(200).expect("Content-Type", /application\/json/))
        expect(users.body).toHaveLength(initialDB.length)
    })
})

describe("Making an account, with an initial user inside", () => {
    beforeEach(async() => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash("fkoidsjfoiesjfoije09832094", 10)
        const user = new User({
            name: "whatever",
            username: "joe mama",
            passwordHash
        })

        await user.save()
    })

    test("for one new user and ensure no dupes and gets 400 since dupe added", async() => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length 
        const user = {
            name: "whatever",
            username: "joe mama",
            password: "oijsfoiesj2109381"
        }

        const res = await api.post("/api/users")
            .send(user)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        expect(res.body.error).toEqual("validation error")

        const amountOfUsers = (await api.get("/api/users")).body
        expect(amountOfUsers).toHaveLength(initialAmountOfUsers)
    })

    test("for one new user", async() => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length
        const user = {
            name: "whatever",
            username: "joe amamaa",
            password: "12391823091jfd8g9j98"
        }

        await api.post("/api/users")
            .send(user)
            .expect(201)
            .expect("Content-Type", /application\/json/)

        const amountOfUsers = (await api.get("/api/users")).body
        expect(amountOfUsers).toHaveLength(initialAmountOfUsers + 1)

        const usernames = (await User.find({})).map(elem => elem['username'])
        expect(usernames).toContain(user['username'])
    })

    test("code 400 if there is no username", async () => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length

        const user = {
            name: "whatever",
            password: "awoidjwad92j19d821"
        }

        const res = await api.post("/api/users")
            .send(user)
            .expect(400)
            .expect("Content-Type", /application\/json/)
        const err = res.body.error
        expect(err).toEqual("validation error")

        const users = (await api.get("/api/users")).body
        expect(users).toHaveLength(initialAmountOfUsers)
    })

    test("code 400 if there is no password", async() => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length
        const user = {
            name: "bleh",
            username: "rob"
        }

        const res = await api.post("/api/users")
            .send(user)
            .expect(400)
            .expect("Content-Type", /application\/json/)
        const err = res.body.error
        expect(err).toEqual("undefined password")

        const usersNow = (await api.get("/api/users")).body
        expect(usersNow).toHaveLength(initialAmountOfUsers)
    })

    test("code 400 if username is not at least length 3", async() => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length

        const user = {
            name: "bleh",
            username: "wa",
            password: "1398213u9218u"
        }

        const res = await api.post("/api/users")
            .send(user)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const err = res.body.error
        expect(err).toEqual("validation error")

        const usersNow = (await api.get("/api/users")).body
        expect(usersNow).toHaveLength(initialAmountOfUsers)
    })

    test("code 401 if password is not at least length 3", async() => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length

        const user = {
            name: "bleh",
            username: "dwada",
            password: "aw"
        }

        const res = await api.post("/api/users")
            .send(user)
            .expect(401)
            .expect("Content-Type", /application\/json/)

        expect(res.body.error).toEqual("bad password")

        const usersNow = (await api.get("/api/users")).body 
        expect(usersNow).toHaveLength(initialAmountOfUsers)
    })

    test("code 201 if name is not given default to username", async() => {
        const initialAmountOfUsers = (await api.get("/api/users")).body.length

        const user = {
            username: "dwada",
            password: "awwww"
        }

        const res = await api.post("/api/users")
            .send(user)
            .expect(201)
            .expect("Content-Type", /application\/json/)

        expect(res.body.name).toEqual(user['username'])

        const amountOfUsers = (await api.get("/api/users")).body
        expect(amountOfUsers).toHaveLength(initialAmountOfUsers + 1)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
