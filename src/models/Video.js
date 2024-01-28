import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  // 스키마 작성
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  // create값을 controller에 생성하지 않고 default 값으로 생성
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
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
