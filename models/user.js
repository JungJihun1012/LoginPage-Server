const mongoose = require("mongoose"); // 몽구스를 가져온다.
const bcrypt = require("bcrypt"); // 비밀번호를 암호화 시키기 위해
const saltRounds = 10; // salt를 몇 글자로 할지
const jwt = require("jsonwebtoken"); // 토큰을 생성하기 위해

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 스페이스를 없애주는 역할
    unique: 1, // 중복을 허용하지 않는다.
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastnmae: {
    type: String,
    maxlength: 50,
  },
  role: {
    // 관리자와 일반 유저를 구분하기 위한 역할
    type: Number,
    default: 0, // 0은 일반 유저, 1은 관리자
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// save하기 전에 비밀번호를 암호화 시킨다.
userSchema.pre("save", function (next) {
  const user = this;
  // 비밀번호를 바꿀 때만 암호화 시킨다.
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// 비밀번호를 비교하는 메소드
userSchema.methods.comparePassword = function (plainPassword, cb) {
  const user = this;
  // plainPassword를 암호화해서 db에 있는 비밀번호와 비교
  bcrypt.compare(plainPassword, user.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// 토큰을 생성하는 메소드
userSchema.methods.generateToken = function (cb) {
  const user = this;
  // jsonwebtoken을 이용해서 token을 생성하기
  const token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

// 토큰을 복호화하는 메소드
userSchema.statics.findByToken = function (token, cb) {
  const user = this;
  // 토큰을 decode 한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema); // 스키마를 모델로 감싸준다.

module.exports = { User }; // 다른 곳에서도 사용할 수 있도록 export 해준다.