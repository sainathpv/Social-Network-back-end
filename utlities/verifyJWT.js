const jwt = require('jsonwebtoken');

const verifyJWT = (token) => {
    try{
        const jwtToken = token.split(' ')[1];
        const decoded = jwt.verify(jwtToken, process.env.JWT_KEY);
        return decoded;
    }catch(error){
        return null;
    }
}

module.exports = {verifyJWT};