import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;

const app = express(); //express application 생성
const logger = morgan("dev"); // morgan
app.use(logger);

app.use("/", globalRouter); // globalRouter 생성
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const handleListening = () => console.log(`Server listening on port ${PORT}`);

app.listen(PORT, handleListening); //요청 대기
