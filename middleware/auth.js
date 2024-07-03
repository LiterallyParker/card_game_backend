const jwt = require("jsonwebtoken");
const { getUserById } = require("../database/users");
const { error } = require("console");

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

const requireUser = async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    next({
      error: true,
      message:"User must be logged in to perform this action."
    });
  }
  next();
}

const checkUserAgainstHand = async (req, res, next) => {
  const { id } = req.params;
  const { handId } = req.user;
  if (Number(id) !== handId) {
    res.status(400);
    next({
      error: true,
      name: "UnauthorizedRequst",
      message: "Not your cards, cheater!"
    });
  };
  next();
}

const rejectUser = async (req, res, next) => {
  if (!req.user) {
    res.status(400);
    next({
      error: true,
      name: "UnauthorizedRequest",
      message: "User Unauthorized."
    })
  }
}
 
module.exports = { createToken, addUserToReq, requireUser, checkUserAgainstHand, rejectUser }