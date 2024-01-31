import Video from "../models/Video";
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
  const video = await Video.findById(id).populate("owner");
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
  const file = req.file;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      // Video 모델을 이용하여 video 제작, newVideo는 제작된 video값을 return
      title,
      description,
      createdAt: Date.now(),
      fileUrl: file.path,
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
