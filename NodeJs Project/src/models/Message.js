
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
