const bcrypt = require("bcrypt");
const User = require("../models/user");

async function createUser(req, res) {
  try {
    const { username, password, isAdmin } = req.body;

    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Permission denied. Only admins can create users." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({
          error: "Username already exists. Choose a different username.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editUser(req, res) {
  try {
    const { userId } = req.params;
    const { username, password, isAdmin } = req.body;

    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({
          error: "Permission denied. Only admins can edit user details.",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.username = username || user.username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;

    await user.save();

    res.status(200).json({ message: "User details updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createUser, editUser };
