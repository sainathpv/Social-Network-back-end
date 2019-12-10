const Post = require('../models/post');

function rmDuplicate(posts){
  var seen = {};
  return posts.filter(function(post){
    return seen.hasOwnProperty(post._id) ? false : (seen[post._id] = true);
  });
}

exports.searchPosts = async (req, res, next) => {
  console.log("it works here in the search")
  console.log(req.body.text);
  Post.find({
    content: { $regex: req.body.text, $options: 'i' }
  }).exec().then(resultByContent =>{
    Post.find({title: {$regex: req.body.text, $options: 'i' }})
    .exec().then(resultByTitle =>{
      var result = resultByTitle.concat(resultByContent);
      Post.find({name: {$regex: req.body.text, $options: 'i' }})
      .exec().then(resultByName =>{
        result = resultByName.concat(result)
        if(result.length !== 0){
          var setResult = rmDuplicate(result);
          return res.status(200).json({ message: 'success', result: setResult});
        }else {
          return res.status(409).json({message: "No post are find for your string"});
        }
      })
    })
    
  });
}