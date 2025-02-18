const jwt = require('jsonwebtoken');

// Middleware to validate JWT
const validateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Assuming the token is passed as "Bearer <token>"

    console.log("token ", token)

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        // Attach the decoded user info to the request object
        req.user = decoded;

        next();  // Continue to the next middleware/handler
    });
};
module.exports = validateToken;

