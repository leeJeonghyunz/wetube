import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middleware";

const userRouter = express.Router(); // express를 통해 userRouter 생성 기존 라우터 페이지 (/user)생성

userRouter.get("/logout", protectorMiddleware, logout); // 로그인 하지 않은 사람이 /logout을 방문할 시 protectorMiddleware 호출
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
//userRouter에 /edit이란 페이지를 get하며 handleEditUser 함수 호출
// all을 사용하면 get이든 post든 다 middleware 호출
// multer을 사용하여 만든 avatarUpload middleware를 호출. single은 하나의 파일만 업로드한다는 뜻.
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin); // url방문 시 깃헙으로 이동
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/:id", see);

export default userRouter;
