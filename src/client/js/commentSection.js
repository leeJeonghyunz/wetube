const form = document.getElementById("commentForm");
const videoContainer = document.getElementById("videoContainer"); // watch.pug 에 있는 videoContainer 호출
const deleteCommentBtn = document.querySelectorAll(".deleteCommentBtn");

// 비디오 삭제 API 생성
const handleDelete = async (event) => {
  const videoId = event.target.dataset.videoid;
  const id = event.target.dataset.id;
  const response = await fetch(`/api/videos/${videoId}/comment/${id}/delete`, {
    method: "DELETE",
  }); // Delete method 전송
  // 만약 코드가 201이면 'li' 삭제
  if (response.status === 201) {
    event.target.parentNode.remove();
  }
};

// fake comment 생성
const addComment = (text, id) => {
  const videoComment = document.querySelector(".video__commentsList ul");
  const newComment = document.createElement("li");
  const span = document.createElement("span");
  const spanX = document.createElement("span");
  span.innerText = text; // textarea의 value값
  spanX.innerText = "❌";
  spanX.className = "deleteCommentBtn";
  spanX.dataset.id = id;
  spanX.dataset.videoid = videoContainer.dataset.id;
  newComment.className = "video__comment";
  newComment.appendChild(span);
  newComment.appendChild(spanX);
  videoComment.prepend(newComment);
  spanX.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  const textarea = form.querySelector("textarea"); // 만약 form이 있다면 textarea 생성
  event.preventDefault(); // 새로고침하는 브라우저의 기본동작을 멈춤
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  // 만약 text의 내용이 공란이라면 아무것도 return하지 않음.
  if (text === "") {
    return;
  }

  // videoComment Api에 fetch
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // content-type을 json형식이라고 express에게 알려줌.
    },
    body: JSON.stringify({ text }), // json을 string형식으로 변환
  });

  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId); // fake comment 호출
  }
};

// 만약 form이 있다면 아래의 이벤트 생성
if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteCommentBtn)
  deleteCommentBtn.forEach((btn) =>
    btn.addEventListener("click", handleDelete)
  );
