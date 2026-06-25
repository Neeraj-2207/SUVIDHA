// generateToken.js
// One job: create a JWT token for a given user
// We keep this in utils/ because it's a reusable helper

const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  // jwt.sign() creates a new token
  // Argument 1: PAYLOAD - data to encode inside the token
  // Argument 2: SECRET  - used to sign/verify the token
  // Argument 3: OPTIONS - configuration like expiry time
  
  const token = jwt.sign(
    {
      id: userId,      // We store userId so we can find the user later
      role: role       // We store role for quick authorization checks
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '3d'  // Token expires in 7 days
                       // After this, user must log in again
                       // Other options: '1h', '30d', '1y'
    }
  );

  return token;
};

module.exports = generateToken;