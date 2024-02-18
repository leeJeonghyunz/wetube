const { S3Client } = require("@aws-sdk/client-s3");
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");

const app = express();

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isRender = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "wetubeljh",
  acl: "public-read",
  // content의 저장경로를 생성
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = "images/" + newFileName;
    ab_callback(null, fullPath);
  },
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "wetubeljh",
  acl: "public-read",
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = "videos/" + newFileName;
    ab_callback(null, fullPath);
  },
});

export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn); // req.session.loggedin 값을 locals.loggedIn 값에 전달
  res.locals.siteName = "wetube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isRender = isRender;
  // locals.loggedInUser에 session에 저장되어 있는 user를 넣어 줌.
  // 만약 로그인 유저가 비었다면 EMPTY를 보여줌
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
}; // 만약 로그인하지 않은 사람이 접속하면 /login으로 redirect. 로그인을 하였다면 다음동작 수행.

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
}; // 만약 로그인 한 사람이 접속하면 홈으로 redirect

export const avatarUpload = multer({
  dest: "uploads/avatars", // 파일 저장 경로
  limits: {
    fileSize: 3000000, // 파일 크기 제한
  },
  storage: isRender ? s3ImageUploader : undefined,
}); // 사용자가 보낸 파일을 uploads 폴더에 저장한다.

export const videoUpload = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: 10000000,
  },
  storage: isRender ? s3VideoUploader : undefined,
});
