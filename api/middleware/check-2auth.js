const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const jwtToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(jwtToken, process.env.JWT_KEY);

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
