import User from "../models/User";
import bcrypt from "bcrypt";

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
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
    // user를 생성하고 login으로 redirect
  } catch (error) {
    console.log(error);
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username }); // username의 존재여부 확인
  if (!user) {
    return res.status(404).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists",
    });
  } // username의 존재여부 확인

  const ok = await bcrypt.compare(password, user.password); // bcrypt를 이용하여 현재 패스워드와 db의 패스워드를 비교
  if (!ok) {
    return res.status(404).render("login", {
      pageTitle,
      errorMessage: "Password is not correct!",
    });
  }
  req.session.loggedIn = true; // session obj에 login true로 변경
  req.session.user = user; // session obj에 user 삽입
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`; // 깃헙 oauth에서 제공하는 링크
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  }; // client _id와 scope등을 담은 config 작성
  const params = new URLSearchParams(config).toString(); // urlSearchparams를 이용하여 config파일을 params로 만들고 string()화
  const finalUrl = `${baseUrl}?${params}`; // url작성
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token"; // github에서 제공하는 post URL
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_CLIENT_SECRET,
    code: req.query.code, // github에서 제공하는 코드
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json", // headers에서 json파일로 받겠다고 요청
      },
    })
  ).json(); // code를 제출 후 accessToken을 받음. tokenRequest를 json()화
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com"; // apiUrl 생성
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }, // github에 accessToken을 보여주고 유저의 데이터를 받음.
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }, // github에 accessToken을 보여주고 email list를 받아옴.
      })
    ).json();
    const email = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    console.log(email);
    if (!email) {
      return res.redirect("/login");
    }
  } else {
    return res.redirect("/login");
  }
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");
