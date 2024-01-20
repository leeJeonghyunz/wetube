// 파일들을 초기화
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;

const handleListening = () => console.log(`Server listening on port ${PORT}`);

app.listen(PORT, handleListening); //요청 대기
