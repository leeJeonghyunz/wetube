import multer from "multer";

export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn); // req.session.loggedin 값을 locals.loggedIn 값에 전달
  res.locals.siteName = "wetube";
  res.locals.loggedInUser = req.session.user || {};
  // locals.loggedInUser에 session에 저장되어 있는 user를 넣어 줌.
  // 만약 로그인 유저가 비었다면 EMPTY를 보여줌
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
}; // 만약 로그인하지 않은 사람이 접속하면 /login으로 redirect. 로그인을 하였다면 다음동작 수행.

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
}; // 만약 로그인 한 사람이 접속하면 홈으로 redirect

export const avatarUpload = multer({
  dest: "uploads/avatars", // 파일 저장 경로
  limits: {
    fileSize: 3000000, // 파일 크기 제한
  },
}); // 사용자가 보낸 파일을 uploads 폴더에 저장한다.

export const videoUpload = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: 10000000,
  },
});
