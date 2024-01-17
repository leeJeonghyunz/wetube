import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  // 스키마 작성
  title: String,
  description: String,
  createdAt: { type: Date, required: true, default: Date.now },
  // create값을 contoller에 생성하지 않고 default 값으로 생성
  hashtags: [{ type: String }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

const movieModel = mongoose.model("Video", videoSchema);
// videoSchema를 이용하여 movieModel ('Video') 작성 완료
export default movieModel;
// movieModel을 모두가 볼 수 있게 server에 export
