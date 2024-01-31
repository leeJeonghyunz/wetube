import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const { file } = req;
  const { name, username, email, password, password2, location, avatarUrl } =
    req.body;
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
    // db에 계정이 있다면 사용
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
      avatarUrl: file ? file.path : "uploads/avatars/et.jpg", // 이미지 지정 안했을 시 기본이미지.
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
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    ); // primary와 verified가 true인 것을 찾음
    if (!emailObj) {
      return res.redirect("/login");
    }
    const existingUser = await User.findOne({ email: emailObj.email }); // db에 emailObj.email(깃헙이메일)과 같은 것이 있는지 확인
    if (existingUser) {
      req.session.loggedIn = true; // session obj에 login true로 변경
      req.session.user = existingUser; // session obj에 existingUser 삽입
      return res.redirect("/");
    } else {
      // 만약 계정이 없다면? 만든다.
      const user = await User.create({
        name: userData.name,
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        socialOnly: true,
        password: "", // github login을 하면 password를 입력할 수 없다.
        location: userData.location,
      });
      req.session.loggedIn = true; // session obj에 login true로 변경
      req.session.user = user; // session obj에 user 삽입
      return res.redirect("/");
    }
  } else {
    return res.redirect("/");
  }
};

export const logout = (req, res) => {
  req.session.destroy(); // 세션을 끝내버림
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", {
    pageTitle: "Edit Profile",
  });
};

export const postEdit = async (req, res) => {
  const pageTitle = "Edit";
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location }, // form의 name, email, username, location
    file,
  } = req;
  const filePath = file ? file.path : null; // file이 있다면 filePath에 삽입

  // 1.이름을 바꿨을때 해당 이름의 유저가 있는지 확인한다.
  const findUserName = await User.findOne({ username });

  const a = findUserName
    ? Boolean(findUserName._id.toString() === _id.toString())
    : null;
  const b = Boolean(req.body.username === req.session.user.username);
  const c = Boolean(req.body.email === req.session.user.email);
  const d = Boolean(req.body.name === req.session.user.name);
  const e = Boolean(req.body.location === req.session.user.location);
  const f = Boolean(filePath === avatarUrl);

  // 2.1 만약 유저가 존재하고 유저의 ID와 현재 세션의 ID가 같다면(아무것도 입력 안하고 post) 홈으로 redirect
  if (findUserName && a && b && c && d && e && f) {
    console.log("변경사항이 없습니다.");
    return res.redirect("/");
  }

  // 2.2 만약 중복된 이름이 존재할 시(유저id와 세션id가 다를 때.)
  if (findUserName && !a) {
    return res.render("users/edit-profile", {
      pageTitle,
      errorMessage: `Name ${findUserName.username}Already Existing`,
    });
  }

  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl, // avatarUrl에 새로 입력값이 없으면 기존의 avatarUrl을 작성하고 아니면 path의 내용을 입력
      name,
      email,
      username,
      location,
    },
    { new: true } // findByIdAndUpdate는 기본적으로 이전 값을 반환하므로 new:true 입력해야한다.
  ); // user를 id로 찾고 업데이트
  req.session.user = updateUser; // req.session에 update된 user입력

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "ChangePassword " });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  // 1.현재 비밀번호 확인
  const ok = await bcrypt.compare(oldPassword, password); // bcrypt를 이용해서 oldPassword와 session에 있는 password를 비교
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "ChangePassword ",
      errorMessage: "The current password is incorrect",
    });
  }

  // 2.변경된 비밀번호 재확인
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "ChangePassword ",
      errorMessage: "The password does not match the confirmation",
    });
  }

  // 3. 변경된 비밀번호 저장
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save(); // 비밀번호 저장
  req.session.user.password = user.password; // session에 바뀐 비밀번호 입력
  return res.redirect("/users/logout");
};

export const see = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos", // 가장 먼저 populate 하고 싶은 것
    populate: {
      path: "owner", // 다음으로 populate할 것
    },
  });
  if (!user) {
    res.status(404).render("404", { pageTitle: "User Not Found" });
  }

  return res.render("users/profile", {
    pageTitle: `${user.name} Profile`,
    user,
  });
};
