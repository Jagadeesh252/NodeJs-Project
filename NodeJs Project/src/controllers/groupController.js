const Group = require("../models/Group");
const User = require("../models/user");

async function createGroup(req, res) {
  try {
    const { name, user } = req.body;
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res
        .status(400)
        .json({
          error:
            "Group with this name already exists. Choose a different name.",
        });
    }
    const newGroup = new Group({
      name,
      members: [user],
    });
    await newGroup.save();

    res.status(201).json({ message: "Group created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function deleteGroup(req, res) {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (!group.members.includes(req.user._id) && !req.user.isAdmin) {
      return res
        .status(403)
        .json({
          error: "Permission denied. You are not a member of this group.",
        });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchGroups(req, res) {
  try {
    const { keyword } = req.query;

    const groups = await Group.find({
      name: { $regex: keyword, $options: "i" },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addMemberToGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (!group.members.includes(req.user._id) && !req.user.isAdmin) {
      return res
        .status(403)
        .json({
          error: "Permission denied. You are not a member of this group.",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    group.members.push(userId);

    await group.save();

    res
      .status(200)
      .json({ message: "Member added to the group successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createGroup, deleteGroup, searchGroups, addMemberToGroup };
