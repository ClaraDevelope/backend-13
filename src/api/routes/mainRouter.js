const { postRouter } = require('./posts')
const { userRouter } = require('./users')

const mainRouter = require('express').Router()


mainRouter.use('/auth', userRouter)
mainRouter.use('/post', postRouter)

module.exports = { mainRouter }