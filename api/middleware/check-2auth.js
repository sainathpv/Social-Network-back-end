const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const jwtToken = req.headers.authorization.split(' ')[1];
    //console.log(jwtToken);
    //console.log(process.env.JWT_KEY);
    const decoded = jwt.verify(jwtToken, process.env.JWT_KEY);
    //console.log(decoded);

    if (decoded.twoFactor) {
      req.userData = decoded;
      next();
    } else {
      res.status(401).json({
        message: 'Unauthorized'
      });
    }
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized'
    });
  }
};
