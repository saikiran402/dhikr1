const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      User       = require("../models/user");
var joinus = require("../models/joinus");

// root route
router.get('/', (req, res) => res.render('landing'));

// show register form


router.get('/joinus', (req, res) => res.render('joinus'));

const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

//INDEX - show all campgrounds
router.get("/show", (req, res) => {
  let noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    joinus.find({username: regex}, function(err, data) {
      if (err) { console.log(err); }
      else {
        if (data.length < 1) {
          noMatch = "No one found, please try again.";
        }
        res.render("show", { data: data, page: "show", noMatch: noMatch });  
      }
    });
  } else {
    // Get all camgrounds from DB
    joinus.find({}, function(err, data) {
      if (err) { console.log(err); }
      else {
        res.render("show", { data: data, page: "show", noMatch: noMatch });  
      }
    }); 
  }
});

// handle sign up logic

// show login form
router.get("/login", (req, res) => res.render("login", {page: "login"}));


// login logic: app.post("/login", middleware, callback)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect('/login');
    }
    req.logIn(user, err => {
      if (err) { return next(err); }
      let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/show';
      delete req.session.redirectTo;
      req.flash("success", "Good to see you again, " + user.username);
      res.redirect(redirectTo);
    });
  })(req, res, next);
});


router.post("/joinus",function(req,res){
     
    var   username  = req.body.username;
    var   type       = req.body.type2;
    var   count      =req.body.count;
    var   newJoinus = {username:username,type:type,count:count}
  joinus.create(newJoinus, function(err, user){
        if(err){
            res.render("joinus", {error: err.message});
        }
        else{
           res.redirect("/"); 
        }
    });
});


// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out seccessfully. Look forward to seeing you again!");
  res.redirect("/");
});

module.exports = router;