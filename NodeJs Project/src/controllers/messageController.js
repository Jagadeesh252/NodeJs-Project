const Message = require("../models/Message");
const Group = require("../models/Group");

async function sendMessage(req, res) {
  try {
    const { groupId, content } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (!group.members.includes(req.user._id)) {
      return res
        .status(403)
        .json({
          error: "Permission denied. You are not a member of this group.",
        });
    }

    const newMessage = new Message({
      user: req.user._id,
      group: groupId,
      content,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function likeMessage(req, res) {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (message.user.toString() === req.user._id.toString()) {
      return res
        .status(403)
        .json({
          error: "Permission denied. You cannot like your own message.",
        });
    }

    message.likes += 1;

    await message.save();

    res.status(200).json({ message: "Message liked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { sendMessage, likeMessage };
