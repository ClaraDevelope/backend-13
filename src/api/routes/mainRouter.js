const { isAuth } = require('../../middlewares/auth')
const { menstrualCycleRouter } = require('./menstrualCycle')
const { postRouter } = require('./posts')
const { userRouter } = require('./users')

const mainRouter = require('express').Router()


mainRouter.use('/auth', userRouter)
mainRouter.use('/post', postRouter)
mainRouter.use('/cycle', isAuth ,menstrualCycleRouter)

module.exports = { mainRouter }