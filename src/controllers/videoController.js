import Video from "../models/Video";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: "desc" });
    // createdAt 순서대로 내림차순
    return res.render("home", { pageTitle: "Home", videos });
  } catch {
    return res.render("server-error");
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id); // id를 통해 video를 검색
  if (!video) {
    res.status(404).render("404", { pageTitle: "Video not found" }); // video가 없을시 404 렌더링
  } else {
    res.render("watch", { pageTitle: video.title, video });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id); // id를 통해 video를 검색
  if (!video) {
    res.render("404", { pageTitle: "Video not found" }); // video가 없을시 404 렌더링
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
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
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  // here we will add a video
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      // Video 모델을 이용하여 video 제작
      title,
      description,
      createdAt: Date.now(),
      hashtags: Video.formatHashtags(hashtags),
      // Video model에서 만든 formatHashtags 함수를 import
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
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
    });
  }
  // keyword가 있으면 videos에 넣어주고 렌더링
  return res.render("search", { pageTitle: "Search", videos });
};

export const upload = (req, res) => res.send("Upload");
