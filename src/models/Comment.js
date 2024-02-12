import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  // type은 owner의 아이디
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  // type은 video의 아이디
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
