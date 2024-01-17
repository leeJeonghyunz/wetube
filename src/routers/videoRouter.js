import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id(\\d+)", watch); // 자바스크립트 정규표현식
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit); // 하나의 URL에 get/post 가 다 들어있을 때 사용 유리.
videoRouter.route("/upload").get(getUpload).post(postUpload);

export default videoRouter;
