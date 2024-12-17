  const mongoose = require('mongoose');

  const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencing the User model
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' }, // Predefined statuses
    created_at: { type: Date, default: Date.now },
    like_count: { type: Number, default: 0 }, // Default is 0 likes
    comment: [{ type: String }] // Array of comments, stored as strings
  });

  module.exports = mongoose.model('Post', PostSchema);