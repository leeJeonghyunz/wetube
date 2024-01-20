import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express(); //express application 생성
const logger = morgan("dev"); // morgan

app.set("view engine", "pug"); // app.set()을 이용하여 pug를 view engine으로 삼는다 선언
app.set("views", process.cwd() + `/src/views`);
app.use(logger);
app.use(express.urlencoded({ extended: true })); // express에게 form형식을 알려줌.
app.use("/", rootRouter); // rootRouter 생성
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
