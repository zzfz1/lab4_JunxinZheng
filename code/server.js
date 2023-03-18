const express = require("express");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("./db/database");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.redirect("/identify");
});

app
  .route("/identify")
  .post(async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const user = await db.getUser(name);
    if (!user.length) {
      res.redirect(400, "/register");
      return;
    }
    const userID = user[0].userID;
    if (!(await bcrypt.compare(password, user[0].password))) {
      res.status(400).render("fail.ejs", {
        message: "Incorrect Password!",
      });
    }
    const token = jwt.sign(
      { userID: userID, name: name, role: user[0].role },
      process.env.ACCESS_TOKEN_SECRET
    );
    const cookieOptions = {
      httpOnly: true,
      maxAge: 86400000,
    };
    res.cookie("jwt", token, cookieOptions);
    res.redirect("/users/" + userID);
  })
  .get((req, res) => {
    res.render("identify.ejs");
  });

function authenticateToken(req, res, next) {
  let decoded;
  if (!req.cookies || !req.cookies.jwt) {
    res.redirect(401, "/identify");
  } else if (
    (decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET))
  ) {
    req.user = {
      userID: decoded.userID,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } else {
    res.redirect(401, "/identify");
  }
}

function authenticateRole(page) {
  permittedRoles = {
    student1: ["student", "teacher", "admin"],
    student2: ["student", "teacher", "admin"],
    teacher: ["teacher", "admin"],
    admin: ["admin"],
  };
  permittedStudents = {
    student1: "user1",
    student2: "user2",
  };
  return (req, res, next) => {
    const currentRole = req.user.role;
    if (permittedRoles[page].includes(currentRole)) {
      if (
        currentRole == "student" &&
        req.user.name !== permittedStudents[page]
      ) {
        res.redirect(403, "/identify");
        return;
      }
      next();
      return;
    }
    res.redirect(403, "/identify");
  };
}

app
  .route("/admin")
  .get(authenticateToken, authenticateRole("admin"), async (req, res) => {
    const users = await db.getUsers();
    res.render("admin.ejs", { users: users });
  });

app
  .route("/student1")
  .get(authenticateToken, authenticateRole("student1"), async (req, res) => {
    res.render("student1.ejs", { username: req.user.name });
  });
app
  .route("/student2")
  .get(authenticateToken, authenticateRole("student2"), async (req, res) => {
    res.render("student2.ejs", { username: req.user.name });
  });
app
  .route("/teacher")
  .get(authenticateToken, authenticateRole("teacher"), async (req, res) => {
    res.render("teacher.ejs", { username: req.user.name });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register.ejs");
  })
  .post(async (req, res) => {
    let name = req.body.name;
    let passwd = req.body.password;
    let role = req.body.role;
    if (!name || !passwd) {
      res.status(400).render("fail.ejs", {
        message: "The username and password shouldn't be empty!",
      });
      return;
    }
    passwd = await bcrypt.hash(passwd, 10);
    try {
      console.log(
        await db.addUser({
          userID: name,
          name: name,
          role: role,
          password: passwd,
        })
      );
      res.redirect("/identify");
    } catch (error) {
      console.log(error);
      res.status(409).render("fail.ejs", {
        message: "There's already a user with this username!",
      });
    }
  });

app.route("/users/:userId").get(authenticateToken, async (req, res) => {
  const user = await db.getUser(req.user.name);
  if (!user.length) {
    res.status(404).render("fail.ejs", { message: "No Such User!" });
  }
  if (req.user.userID == req.params.userId)
    res.render("profile.ejs", { user: user[0] });
  else res.redirect(403, "/identify");
});

app.listen(8000);
