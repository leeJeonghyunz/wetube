import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  // 스키마 작성
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  // create값을 controller에 생성하지 않고 default 값으로 생성
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  // owner의 타입을 ObjectID로 설정하며, User 모델의 ID를 저장할 것이라 선언.
});

videoSchema.static("formatHashtags", (hashtags) => {
  // static 함수를 이용하여 자체 함수 생성
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
// videoSchema를 이용하여 Video ('Video') 작성 완료
export default Video;
// Video을 모두가 볼 수 있게 server에 export
