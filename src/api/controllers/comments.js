const COMMENT = require('../models/comments');
const POST = require('../models/posts');
const USER = require('../models/users');

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id; 

    const post = await POST.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

  
    const user = await USER.findById(userId);

    const newComment = new COMMENT({
      author: {
        _id: user._id,
        profile: {
          name: user.profile.name,
          img: user.profile.img
        }
      },
      text
    });

    const savedComment = await newComment.save();
console.log(savedComment);

    post.comments.push(savedComment._id);
    await post.save();

    return res.status(201).json(savedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const deleteComment = async (req, res) => {
  try {
    const { commentId, postId } = req.params;

    const comment = await COMMENT.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const updatedPost = await POST.findByIdAndUpdate(
      postId,
      { $pull: { comments: commentId } },
      { new: true } 
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Updated post comments:', updatedPost.comments);

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;


    const post = await POST.findById(postId)
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          model: 'User'
        }
      });

    console.log('Post:', post);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }


    console.log('Comments:', post.comments);

    post.comments.forEach(comment => {
      console.log('Comment ID:', comment._id);
      console.log('Comment Text:', comment.text);
      console.log('Author ID:', comment.author ? comment.author._id : 'No Author');
      console.log('Author Name:', comment.author ? comment.author.profile.name : 'No Author Name');
    });

    return res.status(200).json(post.comments);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  addComment,
  deleteComment,
  getCommentsByPost
};
