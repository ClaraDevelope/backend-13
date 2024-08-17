const { isAuth } = require('../../middlewares/auth')
const { uploadPerfil } = require('../../middlewares/fileCloudinary')
const { getUsers, getUserByID, register, login, updateUser, deleteUser, searchUsers, addContact, getContacts } = require('../controllers/users')


const userRouter = require('express').Router()
userRouter.get('/', getUsers)
userRouter.get('/search', isAuth, searchUsers)
userRouter.get('/contacts', isAuth, getContacts)
userRouter.get('/:id', getUserByID)
userRouter.post('/add/:userId', isAuth, addContact)
userRouter.post('/register',uploadPerfil,  register)
userRouter.post('/login', login)
userRouter.patch('/:id/update', uploadPerfil,updateUser)
userRouter.delete('/:id/delete', deleteUser)


module.exports = { userRouter }