// 파일들을 초기화
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = process.env.PORT || 4000; // 배포할 땐 변수로 입력하고 개발할 땐 4000

const handleListening = () => console.log(`✅Server listening on port ${PORT}`);

app.listen(PORT, handleListening); //요청 대기
