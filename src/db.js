import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL); // mongodb의 db를 만드는 방법. url뒤에 / 를 입력하고 db이름 입력

const db = mongoose.connection;

db.on("error", (error) => console.log("DB Error", error)); // db 에러 표시
db.once("open", () => console.group("Connection to DB")); // db가 open 되었을 때
