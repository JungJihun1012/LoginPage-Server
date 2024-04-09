const express = require('express');
const app = express();
const port = 5000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { User} = require("./models/user.js");
const {auth} = require("./middleware/auth.js");
const config = require("./config/key.js");


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://sdh230414:<wjdwlgns965>@cluster0.ycmjjon.mongodb.net/', config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.get('/api/users/', (req, res) => res.send("Hello World!"));

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err});
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  User.findOne(
    {
      email: req.body.email,
    },
    (err, user) => {
      if(!user) {
        return res.json({
          loginSuccess: false,
          message: "계정이 없음",
        });
      }
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch) {
          return res.json({
            loginSuccess: false,
            message: "비밀번호를 입력해주세요"
          });
        }
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, UserId: user._id});
        })
      })
    }
  )
})

app.get('/api/users/auth', auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});

app.get("/api/users/logout", (req, res) => {
  console.log(req.user);
  User.findOneAndUpdate({_id: req.user._id}, {token: ""}, (err, user) => {
    if (err) return res.json({ success: false, err});
    return res.then(200).send({success: true});
  })
})

app.get("/api/hello", (req, res) => {
  res.send('hello');
})

app.listen(port, () => console.log(`Example app listening on port ${port}`));