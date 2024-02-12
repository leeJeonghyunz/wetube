import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    // createdAt 순서대로 내림차순
    return res.render("home", { pageTitle: "Home", videos });
  } catch {
    return res.render("server-error");
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  console.log(video);
  // id를 통해 video를 검색
  // populate를 통해 mongoose가 User의 정보를 "owner"에 입력해 줌,

  if (!video) {
    res.status(404).render("404", { pageTitle: "Video not found" }); // video가 없을시 404 렌더링
  } else {
    res.render("videos/watch", { pageTitle: video.title, video });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;
  const video = await Video.findById(id); // id를 통해 video를 검색

  if (!video) {
    res.render("404", { pageTitle: "Video not found" }); // video가 없을시 404 렌더링
  }

  // 만약 video의 owner가 아닌 사람이 edit창을 열려고 하는 것을 방지/=.
  if (String(video.owner) !== _id) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }

  return res.render("videos/edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id); // id를 통해 video를 검색
  if (!video) {
    res.render("404", { pageTitle: "Video not found" }); // video가 없을시 404 렌더링
  }
  await Video.findByIdAndUpdate(id, {
    // mongoose model function 사용.
    title,
    description,
    hashtags: Video.formatHashtags(hashtags), // formatHashtag 란 static을 사용
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("videos/upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;

  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      // Video 모델을 이용하여 video 제작, newVideo는 제작된 video값을 return
      title,
      description,
      createdAt: Date.now(),
      fileUrl: video[0].path, // req.files.video의 path
      thumbUrl: thumb[0].path.replace(/[\\]/g, "/"), // req.files.thumb의 path
      hashtags: Video.formatHashtags(hashtags), // Video model에서 만든 formatHashtags 함수를 import
      owner: _id, // video의 owner 파악
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id); // User모델에 있는 배열에 _id를 push한다.
    user.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;

  const video = await Video.findById(id); // id를 통해 video를 검색

  if (!video) {
    res.render("404", { pageTitle: "Video not found" }); // video가 없을시 404 렌더링
  }

  // 만약 video의 owner가 아닌 사람이 edit창을 열려고 하는 것을 방지/=.
  if (String(video.owner) !== _id) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);

  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: { $regex: new RegExp(keyword, "i") },
      // MongoDB 정규표현식을 이용하여 키워드가 들어가 있는 것을 찾음
    }).populate("owner");
  }
  // keyword가 있으면 videos에 넣어주고 렌더링
  return res.render("search", { pageTitle: "Search", videos });
};

export const upload = (req, res) => res.send("Upload");

// 조회수 생성
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404); // 단순 status가 아닌 sendStatus를 사용해야 연결이 끝남.
  }
  video.meta.views = video.meta.views + 1; // 메타 데이터의 views 조작
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  // video가 존재하지 않는다면 404 return
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  // 새로운 comment 생성
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id); // video.comments 배열에 comment._id를 미리 populate시키고 push시킨다.
  video.save();

  return res.status(201).json({ newCommentId: comment._id });
};

// db에서 comment 삭제 controller 생성
export const deleteComment = async (req, res) => {
  const { id, videoId } = req.params; // dataset을 이용하여 id와 videoId를 얻음
  await Comment.findByIdAndDelete(id); // 댓글 삭제
  const video = await Video.findById(videoId); // Video 검색
  const index = video.comments.indexOf(id); // video 객체에서 comment 객체의 id로 인덱스를 검색
  video.comments.splice(index, 1); // index에 해당하는 배열의 index 삭제
  video.save(); // video 저장
  return res.sendStatus(201);
};
