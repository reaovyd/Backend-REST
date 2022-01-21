const Blog = require("../models/blogSchema")
const blogRouter = require("express").Router()
const loginMiddleware = require("../utils/middleware/loginMiddleware")
const User = require("../models/userSchema")

blogRouter.post("/", loginMiddleware.tokenExtractor, loginMiddleware.userExtractor, async(req, res) => {
    const newBlog = Blog(req.body)
    const savedNewBlog = await newBlog.save()

    req.user.blogs = req.user.blogs.concat(newBlog.id)
    await User.findByIdAndUpdate(req.user.id, req.user, { new: true })

    res.status(201).json(savedNewBlog)
})

blogRouter.get("/", async(req, res) => {
    const blogs = await Blog.find({}).populate("user", {name: 1, username: 1, id: 1})
    res.json(blogs)
})

blogRouter.get("/:id", async(req, res) => {
    const blogs = await Blog.findById(req.params.id).populate("user", {name: 1, username: 1, id: 1})
    res.json(blogs)
})

blogRouter.delete("/:id", loginMiddleware.tokenExtractor, loginMiddleware.userExtractor, async(req, res) => {
    const blog = await Blog.findById(req.params.id)
    const user = req.user

    if(blog.user.toString() !== user.id.toString()) {
        return res.status(400).json({
            error: "blog does not belong to current user"
        })
    }

    const ret = await Blog.findByIdAndDelete(req.params.id)
    user.blogs = user.blogs.filter(elem => elem !== req.params.id) 
    await User.findByIdAndUpdate(user.id, user, {new: true})

    res.status(201).json(ret)
})

module.exports = blogRouter
