// 파일들을 초기화
import "./db";
import movieModel from "./models/Video";
import app from "./server";

const PORT = 4000;

const handleListening = () => console.log(`Server listening on port ${PORT}`);

app.listen(PORT, handleListening); //요청 대기
