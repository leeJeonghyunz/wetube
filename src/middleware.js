export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn); // req.session.loggedin 값을 locals.loggedIn 값에 전달
  res.locals.siteName = "wetube";
  res.locals.loggedInUser = req.session.user; // locals.loggedInUser에 session에 저장되어 있는 user를 넣어 줌.
  next();
};
