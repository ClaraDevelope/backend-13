const { uploadImagePost } = require('../../middlewares/fileCloudinary')
const { addComment, deleteComment, getCommentsByPost } = require('../controllers/comments')
const { getPosts, createPost, updatePost, deletePost, getPostById, toggleLike } = require('../controllers/posts')

const postRouter = require('express').Router()
postRouter.get('/', getPosts)
postRouter.get('/:id', getPostById)
postRouter.post('/create/auth/:id',uploadImagePost, createPost)
postRouter.patch('/:id/modify',uploadImagePost, updatePost)
postRouter.delete('/:id/delete', deletePost)
postRouter.post('/:id/like', toggleLike)
postRouter.delete('/:postId/comment/:commentId', deleteComment)
postRouter.post('/:postId/comment', addComment)
postRouter.get('/:postId/comments/', getCommentsByPost)


module.exports = { postRouter }