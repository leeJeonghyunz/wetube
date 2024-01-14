import express from "express";
import { edit, remove } from "../controllers/userController";

const userRouter = express.Router(); // express를 통해 userRouter 생성 기존 라우터 페이지 (/user)생성

userRouter.get("/edit", edit); //userRouter에 /edit이란 페이지를 get하며 handleEditUser 함수 호출
userRouter.get("/remove", remove);

export default userRouter;
