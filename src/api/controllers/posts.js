const POST = require("../models/posts");
const COMMENT = require("../models/comments");
const USER = require("../models/users");
const { deleteImgCloudinary } = require("../../utils/deleteFile");

const getPosts = async (req, res, next) => {
  try {
    const populateFields = [
      { path: 'author', model: 'User' }, 
      { path: 'comments', model: 'Comment' }, 
    ];

    const posts = await POST.find().sort({_id : -1 }).populate(populateFields); 

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al obtener los posts' });
  }
};
const getPostById = async (req, res, next) =>{
  try {
    const {id} = req.params
    const post = await POST.findById(id)
    return res.status(200).json(post)
  } catch (error) {
    console.log(error);
    return res.status(400).json('no se ha encontrado el post')
  }
}
const createPost = async(req, res, next) =>{
  try {
    const { id } = req.params;
    const newPost = new POST({
        author: id,
        content: req.body.content
      })
      if (req.file) {
        newPost.img = req.file.path
      }

    const post = await newPost.save()

    await USER.findByIdAndUpdate(id, { $push: { posts: post._id } });
      return res.status(200).json(post)
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al crear el nuevo post' });
    
  }
}
const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    let newImage = null;
    if (req.file && req.file.path) {
      newImage = req.file.path;
    }

    const post = await POST.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    if (content) {
      post.content = content;
    }
    if (newImage) {
      if (post.img) {
        deleteImgCloudinary(post.img); 
      }
      post.img = newImage;
    }

    const updatedPost = await post.save();

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'No se ha podido modificar el post' });
  }
};

const deletePost = async(req, res, next )=>{
  try {
    const {id} = req.params
    const post = await POST.findByIdAndDelete(id)
    if(post.img){
      deleteImgCloudinary(post.img)
    }
    return res.status(200).json({message:'se ha eliminado correctamente:',post}) 
  } catch (error) {
    console.log(error);
    return res.status(400).json('no se ha podido eliminar el post')
  }
}

const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;   

    const post = await POST.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIndex = post.likedBy.indexOf(userId);

    if (userIndex === -1) {
      post.likes += 1;
      post.likedBy.push(userId);
    } else {
      post.likes -= 1;
      post.likedBy.splice(userIndex, 1);
    }

    const updatedPost = await post.save();

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getPosts, getPostById ,createPost, updatePost, deletePost, toggleLike
};
