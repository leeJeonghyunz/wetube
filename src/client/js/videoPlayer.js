const video = document.querySelector("video"); // html의 video 태그
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoController = document.getElementById("videoController");

console.log(videoContainer.dataset);

let volumeValue = 0.5; // volumeValue라는 global 변수 선언
video.volume = volumeValue;
let timeOutController = null; // 글로벌 변수 생성. 타임아웃 값 입력
let timeOutControllerMovement = null; // 글로벌 변수 생성. 타임아웃 값 입력

// 비디오가 정지되어있으면 플레이, 아니면 정지
const handlePlay = (e) => {
  if (video.paused) {
    video.play();
    playBtnIcon.classList = "fas fa-pause";
  } else {
    video.pause();
    playBtnIcon.classList = "fas fa-play";
  }
};

// 음소거가 되어있으면 소리나오게, 아니면 음소거
const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-xmark";
  } else {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-high";
  }
  volumeRange.value = video.muted ? 0 : volumeValue; // 음소거가 되면 range 값이 0, 음소거를 해제하면 글로벌 변수값인 volumeValue값
};

// volume Range를 변화시키면 소리 변화
const handleVolumeChange = (e) => {
  const { value } = e.target;
  video.volume = value; // video의 volume은 event의 value값
  if (video.muted) {
    // video가 음소거시?
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-xmark";
  }
  volumeValue = value; // volumeValue 에 e.target.value값 삽입
  video.volume = value;
};

// date Constructor를 이용하여 초 단위를 만드는 함수를 만듦.
const formatTime = (second) =>
  new Date(second * 1000).toISOString().substring(11, 19);

// metaData의 값을 변경함..
const handleLoadMetadata = () => {
  currentTime.innerText = formatTime(0);
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration); // time bar의 Max 값을 변경
};

// time이 update 할 때마다의 변화값을 구함
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime); // 시간이 변함에 따라 bar의 위치 변함.
};

// video timeline의 value 값의 변화에 따른 변화
const handleTimelineChange = (event) => {
  const { value } = event.target;
  video.currentTime = value;
};

// fullScreen으로 전환 버튼
const handleFullScreen = () => {
  const fullScreen = document.fullscreenElement; // full screen 여부
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenBtnIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoController.classList.remove("showing");

// 유저의 마우스가 영상 위에서 움직인다면 컨트롤러를 보여준다.
const handleMouseMove = () => {
  // 만약 영상 위에 커서를 다시 올렸는데 timeOut값이 있다면 제거
  if (timeOutController) {
    clearTimeout(timeOutController);
    timeOutController = null;
  }
  // 만약 영상에서 마우스가 계속 움직일 경우, timeOutControllerMovement의 값을 받고 다시 null로 만든다.
  if (timeOutControllerMovement) {
    clearTimeout(timeOutControllerMovement);
    timeOutControllerMovement = null;
  }
  videoController.classList.add("showing");
  timeOutControllerMovement = setTimeout(hideControls, 3000); // timeOutControllerMovement의 값을 생성
};

// 유저의 마우스가 영상 밖으로 이동한다면 컨트롤러를 없앤다.
const handleMouseLeave = () => {
  // 3초뒤에 'showing' 클래스를 사라지게 한다.
  timeOutController = setTimeout(hideControls, 3000);
};

const handleMouseClick = () => {
  handlePlay();
};

const handleSpacebar = (event) => {
  if (event.code === "Space") {
    handlePlay();
  }
};

// 조회수 만들기
const handleEnded = () => {
  const { id } = videoContainer.dataset; // dataset을 이용하여 id를 가져온다.
  // fetch를 이용하여 POST요청
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handleMouseClick);
video.addEventListener("ended", handleEnded);
document.addEventListener("keydown", handleSpacebar); // document로 해주어야
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
