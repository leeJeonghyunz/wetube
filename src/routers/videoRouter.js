import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middleware";

const videoRouter = express.Router();

videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 }, // maxcount는 파일의 최대 수
      { name: "thumb", maxCount: 1 },
    ]), // multer를 fields를 이용하여 사용.
    postUpload
  ); // videoUpload middleware를 호출후 postUpload실행
videoRouter.get("/:id([0-9a-f]{24})", watch); // mongoDB의 정규표현식
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit); // 하나의 URL에 get/post 가 다 들어있을 때 사용 유리.
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);

export default videoRouter;
