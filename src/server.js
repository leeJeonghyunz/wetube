import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localMiddleware } from "./middleware";
import apiRouter from "./routers/apiRouter";

const app = express(); //express application 생성
const logger = morgan("dev"); // morgan

app.set("view engine", "pug"); // app.set()을 이용하여 pug를 view engine으로 삼는다 선언
app.set("views", process.cwd() + `/src/views`);
app.use(logger);
app.use(express.urlencoded({ extended: true })); // express에게 form형식을 알려줌.
app.use(express.json()); // express에게 json형식으로 변환해 달라 요청
app.use(
  session({
    secret: process.env.COOKIE_SECRET, // 비밀 키
    resave: false,
    saveUninitialized: false, // 세션이 만들어지고 수정되어진적이 없을 때.
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    // 세션을 mongoDB db에 저장
  })
); // express-session을 이용하여 session 생성

app.use(flash());
app.use(localMiddleware);
app.use("/uploads", express.static("uploads")); // express.static()을 사용하여 디렉토리 접근 권한 제공
app.use("/assets", express.static("assets")); // express.static()을 사용하여 디렉토리 접근 권한 제공
app.use("/", rootRouter); // rootRouter 생성
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
