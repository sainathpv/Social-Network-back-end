const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        console.log(process.env.JWT_KEY);
        const decoded = jwt.verify(token, process.env.JWT_KEY);
             
        if(decoded.twofactor){
            req.userData = decoded;
            next();
        }else{
            res.status(401).json({
                message: "Unauthorized"
            });
        }
    }catch(error){
        res.status(401).json({
            message: "Unauthorized"
        });
    }
};