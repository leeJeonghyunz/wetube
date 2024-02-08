import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream; // 하위 변수를 위해 stream 생성
let recorder;
let videoFile;

// 파일 관리
const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

// <a>를 이용하여 다운로드 시스템 만듦
const fileDownload = (fileUrl, fileName) => {
  const a = document.createElement("a"); // anchor 생성
  a.href = fileUrl; //fileUrl을 링크로 넣는다.
  a.download = fileName; // 다운로드 기능 이용. fileName이란 이름으로 다운로드 받음
  document.body.appendChild(a);
  a.click(); // 클릭하는 것처럼 보이게 함
};

// 다운로드 기능
const handleDownload = async () => {
  startBtn.innerText = "Transcoding.."; // 변환 중
  startBtn.removeEventListener("click", handleDownload); // 'Download Recording' 누름과 동시에 handleDownload 이벤트 삭제
  startBtn.disabled = true; // 버튼 기능 막아놓음.

  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => console.log(message));
  await ffmpeg.load();

  ffmpeg.writeFile(files.input, await fetchFile(videoFile));

  await ffmpeg.exec(["-i", files.input, "-r", "60", files.output]);
  await ffmpeg.exec([
    "-i",
    files.input,
    "-ss", // 특정시간대로 이동
    "00:00:01",
    "-frames:v",
    "1", // 1 프레임
    files.thumb, // 썸네일로 생성
  ]);

  const mp4File = await ffmpeg.readFile(files.output); // 위에서 만든 files.output을 읽는다.
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" }); // Blob()을 이용하여 mp4File.buffer의 내용을 mp4형식으로 변환한다.
  const mp4Url = URL.createObjectURL(mp4Blob); // mp4Blob을 URL형식으로 만든다.

  fileDownload(mp4Url, "MyRecording.mp4");

  const thumbnailFile = await ffmpeg.readFile(files.thumb);
  const thumbBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" }); // Blob()을 이용하여 mp4File.buffer의 내용을 mp4형식으로 변환한다.
  const thumbUrl = URL.createObjectURL(thumbBlob); // mp4Blob을 URL형식으로 만든다.

  fileDownload(thumbUrl, "MyThumb.jpg");

  // 파일삭제
  await ffmpeg.deleteFile(files.input);
  await ffmpeg.deleteFile(files.output);
  await ffmpeg.deleteFile(files.thumb);

  // URL 삭제
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  // stream을 삭제시키고 비디오를 정지시킴
  const tracks = await stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });

  stream = null;
  video.src = videoFile; // 빈 videoFile입력

  startBtn.disabled = false;
  startBtn.innerText = "Start Recording"; // 다시 시작
  startBtn.addEventListener("click", handleStart); // 삭제와 동시에 handleStart 이벤트 생성
  init(); // 자동으로 미리보기 기능
};

// 녹화 정지기능
const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop); // 'Stop Recording'을 누름과 동시에 handleStop 이벤트 삭제
  startBtn.addEventListener("click", handleDownload); // 삭제와 동시에 handleStart 이벤트 생성

  recorder.stop();
};

// 녹화 시작기능
const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart); // 'Start Recording' 누름과 동시에 handleStart 이벤트 삭제
  startBtn.addEventListener("click", handleStop); // 삭제와 동시에 handleStop 이벤트 생성

  recorder = new MediaRecorder(stream); // MediaRecorder에 stream을 argument로
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); // 브라우저 메모리에서만 가능한 URL을 만들어준다.
    video.srcObject = null;
    video.src = videoFile; // video의 src에 가상URL 파일 주소 입력
    video.loop = true;
    video.play();
  };
  recorder.start();
};

// 미리보기 기능
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 200, height: 100 },
  });
  video.srcObject = stream;
  video.play();
  startBtn.addEventListener("click", handleStart);
};

init(); // 자동으로 미리보기 기능
