const jwt = require("jsonwebtoken");
const { getUserById } = require("../database/users")

async function createToken(user) {
  try {

    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn:"1w" });
    return token;

  } catch (error) {
    console.error(error);
  };
};

const addUserToReq = async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
  // if no auth Header is present
  if (!auth) {
    next();

  } else if (auth.startsWith(prefix)) {
    // slice off "Bearer "
    const token = auth.slice(prefix.length);

    if (!token) {
      next();
    };
    
    try {

      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
      const id = verifiedToken && verifiedToken.id;

      if (id) {
        req.user = await getUserById(id);
        next();
      };

    } catch (error) {
      next(error);
    };

  } else {
    next({
      error: true,
      message: `Authorization token must start with ${ prefix }`
    });
  };
};

module.exports = { createToken, addUserToReq };