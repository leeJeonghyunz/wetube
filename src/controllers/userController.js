import User from "../models/User";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation deos not match.",
    });
  } // 패스워드 일치 여부

  const usernameExist = await User.exists({ username });
  if (usernameExist) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "The user name is already taken.",
    });
  } // username이 존재한다면 errorMessage return

  const emailExist = await User.exists({ email });
  if (emailExist) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "The Email is already taken.",
    });
  } // email이 존재한다면 errorMessage return

  await User.create({
    name,
    username,
    email,
    password,
    location,
  });
  return res.redirect("/login");
  // user를 생성하고 login으로 redirect
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");
