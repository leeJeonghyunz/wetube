import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false }, // 만일 githubID가 있다면.
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ], // user는 다수의 comment를 array 형식으로 보관
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], // Array로 구성되어 많은 video를 담을 수 있음.
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    // 비밀번호가 수정되어 저장되었을 때 만!
    this.password = await bcrypt.hash(this.password, 5);
    // bcrypt를 사용하여 비밀번호 해시 5회
  }
});

const User = mongoose.model("User", userSchema);
export default User;
