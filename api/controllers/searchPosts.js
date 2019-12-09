const Post = require('../models/post');

const searchPosts = async (req, res, next) => {
  const { text } = req.query;
  console.log(text);
  const result = await Post.find({
    content: { $regex: text, $options: 'i' }
  }).exec();
  console.log(result);
  return res.status(200).json({ message: 'success', result });
};

module.exports = searchPosts;
