const { isAuth } = require('../../middlewares/auth')
const { calendaryRouter } = require('./calendary')
const { menstrualCycleRouter } = require('./menstrualCycle')
const { postRouter } = require('./posts')
const { userRouter } = require('./users')

const mainRouter = require('express').Router()


mainRouter.use('/auth', userRouter)
mainRouter.use('/post', isAuth, postRouter)
mainRouter.use('/cycle', isAuth ,menstrualCycleRouter)
mainRouter.use('/calendary', isAuth , calendaryRouter)

module.exports = { mainRouter }