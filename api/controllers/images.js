var fs = require('fs');

//Node.js Function to save image from External URL.
function saveImageToDisk(localPath, image) {
    var buf = new Buffer(image, 'base64');
    fs.writeFile( "./staticAssets/images/" + localPath, buf);
}
exports.images_upload = (req, res, next) => {
    var path;
    var data;
    var type = req.body.image.split(',')[0]
    data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
    if("data:image/png;base64" === type){
        path = "image_" + Date.now() + ".png";
    }else if("data:image/jpg;base64"){
        path = "image_" + Date.now() + ".jpg";
    }else if("data:image/jpeg;base64"){
        path = "image_" + Date.now() + ".jpeg";
    }else if("data:image/gif;base64"){
        path = "image_" + Date.now() + ".gif";
    }else{
        return res.status(400).json({
            message: "Malformed"
        });
    }
    
    saveImageToDisk(path, data);

    res.status(200).json({
        url: "/assets/images/" + path
    });
}