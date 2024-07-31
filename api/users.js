const express = require("express");
const usersRoutes = express.Router();

const { createToken, requireUser } = require("../middleware/auth");
const dbUsers = require("../database/users");
const { deleteHandById } = require("../database/hands");

usersRoutes.post("/register", async (req, res, next) => {
  const { firstname, lastname, username, email, password, confirmedPassword } = req.body;

  let _firstname = firstname
  let _lastname = lastname
  if (!firstname && !lastname) {
    _firstname = "Guest"
    _lastname = "User"
  };

  try {
    if (!username || !email || !password || !confirmedPassword) {
      return res.status(400).send({
        error: true,
        name: "NoFieldsError",
        message: "Missing required fields."
      });
    };
    
    if (username.length >= 18) {
      return res.status(400).send({
        error: true,
        name: "NoFieldsError",
        message: "Username must be shorter than 18 chars."
      });
    }

    if (password !== confirmedPassword) {
      return res.status(400).send({
        error: true,
        name: "PasswordMatchError",
        message: "Passwords do not match."
      });
    };

    const existingUsername = await dbUsers.getUserByUsername(username);
    if (existingUsername) {
      return res.status(500).send({
        error: true,
        name: "UsernameError",
        message: "Username taken."
      });
    };

    const existingEmail = await dbUsers.getUserByEmail(email);
    if (existingEmail) {
      return res.status(500).send({
        error: true,
        name: "EmailError",
        message: "Email already in use."
      });
    };

    const user = await dbUsers.addUser({ firstname: _firstname, lastname: _lastname, username, email, password });
    const token = await createToken(await user);
    return res.status(200).send({
      error: false,
      message: "Registration successful!",
      user,
      token
    });
  } catch (error) {
    console.error(error);
  };

});
usersRoutes.post("/login", async (req, res, next) => {

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({
      error: true,
      name: "NoFieldsError",
      message: "Supply username and password."
    });
    return;
  };

  try {
    const user = await dbUsers.getUser({ username, password });
    if (!user) {
      res.status(400).send({
        error: true,
        name: "CredentialError",
        message: "Incorrect username/password."
      })
      return;
    }
    const token = await createToken(await user);
    res.status(200).send({
      error: false,
      message: "Logged in.",
      user,
      token
    });
  } catch (error) {
    next(error);
  };

});

usersRoutes.get("/account", requireUser, async (req, res, next) => {
  const user = req.user;
  res.status(200).send({ error: false, user })
});

usersRoutes.put("/account", requireUser, async (req, res, next) => {
  const { firstname, lastname, username, email } = req.body
  if (firstname && firstname === req.user.firstname) {
    res.status(500).send({
      error: true,
      name: "FirstnameError",
      message: `${firstname} is already set as your first name.`
    })
    return;
  }
  if (lastname && lastname === req.user.firstname) {
    res.status(500).send({
      error: true,
      name: "LastnameError",
      message: `${lastname} is already set as your last name.`
    })
    return;
  }
  if (username && username === req.user.username) {
    res.status(500).send({
      error: true,
      name: "UsernameError",
      message: `${username} is already set as your username.`
    })
    return;
  }
  if (email && email === req.user.email) {
    res.status(500).send({
      error: true,
      name: "EmailError",
      messsage: `${email} is already set as your email.`
    });
    return;
  }
  try {
    if (username) {
      const user = await dbUsers.getUserByUsername(username);
      if (user) {
        res.status(500).send({
          error: true,
          name: "UsernameError",
          message: "Username taken."
        })
        return;
      }
    }
    if (email) {
      const user = await dbUsers.getUserByEmail(email);
      if (user) {
        res.status(500).send({
          error: true,
          name: "EmailError",
          message: "Email already in use."
        })
        return;
      }
    }
    const updatedUser = await dbUsers.updateUserInfo(req.user.id, req.body);
    if (updatedUser.error) {
      res.status(400).send(updatedUser);
      return;
    }
    res.send(updatedUser);
  } catch (error) {
    next(error);
  };

});

usersRoutes.delete("/account", requireUser, async (req, res, next) => {
  const { id, handId } = req.user

  try {
    const userDeleted = await dbUsers.deleteUserById(id);
    const handDeleted = await deleteHandById(handId);
    if (!handDeleted) {
      res.status(500);
      next({
        error: true,
        name: "HandDeleteError",
        message: `Hand with userId ${id} failed to delete. Ditching request.`
      });
      return;
    };
    res.send({
      error: false,
      message: "Successfully deleted. Goodbye!"
    });
  } catch (error) {
    next(error);
  };

});

module.exports = usersRoutes;