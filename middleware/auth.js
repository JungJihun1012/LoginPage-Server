const {user} = require("../models/user");
let auth = (req, res, next) => {
    user.findByIdToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true});

   req.token = token;
   req.user = user;
   next(); 
  });
};


module.exports = {auth};