const { isAuth } = require('../../middlewares/auth')
const { calendaryRouter } = require('./calendary')
const { menstrualCycleRouter } = require('./menstrualCycle')
const { notificationRouter } = require('./notifications')
const { postRouter } = require('./posts')
const { userRouter } = require('./users')

const mainRouter = require('express').Router()


mainRouter.use('/auth', userRouter)
mainRouter.use('/post', isAuth, postRouter)
mainRouter.use('/cycle', isAuth ,menstrualCycleRouter)
mainRouter.use('/calendary', isAuth , calendaryRouter)
mainRouter.use('/notifications', isAuth, notificationRouter)

module.exports = { mainRouter }