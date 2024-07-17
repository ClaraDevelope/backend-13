const { uploadImagePost } = require('../../middlewares/fileCloudinary')
const { getPosts, createPost, updatePost, deletePost, getPostById } = require('../controllers/posts')

const postRouter = require('express').Router()
postRouter.get('/', getPosts)
postRouter.get('/:id', getPostById)
postRouter.post('/create/auth/:id',uploadImagePost, createPost)
postRouter.patch('/:id/modify',uploadImagePost, updatePost)
postRouter.delete('/:id/delete', deletePost)


module.exports = { postRouter }