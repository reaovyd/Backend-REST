const supertest = require("supertest")
const app = require("../app")
const mongoose = require("mongoose")
const User = require("../models/userSchema")
const initialUserDB = require("../utils/testhelpers/createUserRouteTestHelper").initialDB
const initialBlogDB = require("../utils/testhelpers/blogRouteTestHelper").initialDB
const Blog = require("../models/blogSchema")

const api = supertest(app)

describe("Testing POST for blogs (assume one user)", () => {
	// just initializing some users here
	beforeEach(async() => {
		await User.deleteMany({})
		await api.post("/api/users").send(initialUserDB[0])
	})

	test("add all blogs by this user (user needs to login)", async() => {
		await Blog.deleteMany({})
		const user = initialUserDB[0]
		const res = await api.post("/api/login").send(user).expect(201).expect("Content-Type", /application\/json/)
		const token = res.body.token

        for(let elem of initialBlogDB) {
            await api.post("/api/blogs").set("authorization", `Bearer ${token}`).send(elem) 
        }

		const sameUser = await User.findOne({username: user["username"]})
		expect(sameUser.blogs).toHaveLength(initialBlogDB.length)
	})

    test("add all blogs, but is invalid token", async() => {
        await Blog.deleteMany({})
        const user = {
            username: "bba",
            password: "ggjoee"
        }
        const res = await api.post("/api/login").send(user).expect(401).expect("Content-Type", /application\/json/)
        const token = res.body.token
        expect(res.body.error).toEqual("invalid login")

        for(let elem of initialBlogDB) {
            const failedToken = await api.post("/api/blogs").set("authorization", `Bearer ${token}`).send(elem).expect(400)
            expect(failedToken.body.error).toEqual("invalid token")
        }
    })

    test("add blog, but no title, expect 400", async() => {
        await Blog.deleteMany({})
        const user = initialUserDB[0]
        const res = await api.post("/api/login").send(user).expect(201).expect("Content-Type", /application\/json/)
        const token = res.body.token

        const badBlog = {
            author: "a",
            url: "g",
            likes: 232132
        }

        const err = await api.post("/api/blogs").set("authorization", `Bearer ${token}`).send(badBlog).expect(400)
        expect(err.body.error).toEqual("validation error")
    })
})

describe("Testing GET for blogs (we can assume POST works)", () => {
    beforeEach(async() => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        await api.post("/api/users").send(initialUserDB[0])

        const login = await api.post("/api/login").send(initialUserDB[0])
        const token = login.body.token

        for(let elem of initialBlogDB) {
            await api.post("/api/blogs").set("authorization", `Bearer ${token}`).send(elem)
        }
    })

    test("GET Method returns JSON and gets all elements", async() => {
        const res = await api.get("/api/blogs").expect(200).expect("Content-Type", /application\/json/)
        expect(res.body).toHaveLength(initialBlogDB.length)
    })

    test("GET method for each blog has a user entry", async() => {
        const res = await api.get("/api/blogs").expect(200).expect("Content-Type", /application\/json/)
        let entries = res.body.map(elem => elem['user']).filter(user => user !== undefined) 
        expect(entries).toHaveLength(initialBlogDB.length)

        entries = entries.map(elem => elem['username']).filter(user => user !== undefined)   
        expect(entries).toHaveLength(initialBlogDB.length)
    })

    test("GET method for one blog", async() => {
        const id = (await api.get("/api/blogs")).body[0].id
        const res = await api.get(`/api/blogs/${id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/)
        const blogById = await Blog.findById(id)
        expect(res.body.id).toEqual(blogById.id)
    })
})

describe("Testing DELETE method", () => {
    beforeEach(async() => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        const user1 = initialUserDB[0]
        const user2 = initialUserDB[1]

        await api.post("/api/users").send(user1) // create test users
        await api.post("/api/users").send(user2)

        const token1 = (await api.post("/api/login").send(user1)).body.token
        const token2 = (await api.post("/api/login").send(user2)).body.token
        let n = initialBlogDB.length

        for(let i = 0; i < n / 2; ++i) {
            await api.post("/api/blogs").set("authorization", `Bearer ${token1}`).send(initialBlogDB[i]) 
        }

        for(let i = n / 2; i < n; ++i) {
            await api.post("/api/blogs").set("authorization", `Bearer ${token2}`).send(initialBlogDB[i]) 
        }
    })
    test("that delete actually works", async() => {
        const blogs = (await api.get("/api/blogs")).body
        const initialLen = blogs.length
        const userToken = (await api.post("/api/login").send(initialUserDB[0])).body.token
        const res = await api.delete(`/api/blogs/${blogs[0]['id']}`).set("authorization", `Bearer ${userToken}`).expect(201).expect("Content-Type", /application\/json/)

        expect(res.body.id).toBe(blogs[0].id)

        const newBlogs = (await api.get("/api/blogs")).body
        expect(newBlogs).toHaveLength(initialLen - 1)
    })

    test("that delete only works based on that user's id", async() => {
        const badUserToken = (await api.post("/api/login").send(initialUserDB[1])).body.token
        const initialLen = (await api.get("/api/blogs")).body.length

        const blogToRemove = (await api.get("/api/blogs")).body[0]
        await api.delete(`/api/blogs/${blogToRemove.id}`).set("authorization", `Bearer ${badUserToken}`).expect(400).expect("Content-Type", /application\/json/)
        const newBody = (await api.get("/api/blogs")).body
        expect(newBody).toHaveLength(initialLen)
    })
})


afterAll(() => {
	mongoose.connection.close()
})
