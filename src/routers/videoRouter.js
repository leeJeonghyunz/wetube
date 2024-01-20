import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.route("/upload").get(getUpload).post(postUpload);
videoRouter.get("/:id([0-9a-f]{24})", watch); // mongoDB의 정규표현식
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit); // 하나의 URL에 get/post 가 다 들어있을 때 사용 유리.
videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);

export default videoRouter;
