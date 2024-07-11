const { userRouter } = require('./users')

const mainRouter = require('express').Router()


mainRouter.use('/auth', userRouter)

module.exports = { mainRouter }