const { isAuth } = require('../../middlewares/auth')
const { calendaryRouter } = require('./calendary')
const chatRouter = require('./chat')
const { menstrualCycleRouter } = require('./menstrualCycle')
const { postRouter } = require('./posts')
const { userRouter } = require('./users')

const mainRouter = require('express').Router()


mainRouter.use('/auth', userRouter)
mainRouter.use('/post', isAuth, postRouter)
mainRouter.use('/cycle', isAuth ,menstrualCycleRouter)
mainRouter.use('/calendary', isAuth , calendaryRouter)
mainRouter.use('/chat', isAuth , chatRouter)

module.exports = { mainRouter }