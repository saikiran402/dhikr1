const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      User       = require("../models/user");
var middleware = require("../middleware");
var joinus = require("../models/joinus");

// root route
router.get('/', (req, res) => res.render('landing'));

// show register form


router.get('/joinus', (req, res) => res.render('joinus'));

const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

//INDEX - show all campgrounds
router.get("/show", middleware.isLoggedIn, (req, res) => {
  let noMatch = null;
  
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    joinus.find({username: regex}, function(err, data) {
      if (err) { console.log(err); }
      else {
        if (data.length < 1) {
          noMatch = "No one found, please try again.";
        }
        joinus.aggregate([{$group:{_id:"$type",num:{$sum:"$count"}}}]).exec(function(error, result1) {
        if (error) return console.log(error);
        else { result=result1;
          }
          res.render("show", { data: data,result: result, page: "show", noMatch: noMatch }); 
      })
      }
    });
  } else {

    // Get all camgrounds from DB
    joinus.find({}, function(err, data) {
      let result = null;

      if (err) { console.log(err); }
      else {
        
        joinus.aggregate([{$group:{_id:"$type",num:{$sum:"$count"}}}]).exec(function(error, result1) {
        if (error) return console.log(error);
        else { result=result1;
         }
          res.render("show", { data: data,result: result, page: "show", noMatch: noMatch }); 
      })
         
      }

    }); 
  }


});




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

router.post("/show/date",middleware.isLoggedIn,function(req, res){

    var   date   = req.body.date;

joinus.find({"createdAt" : {"$gte": new Date("2018-11-30")}}).exec(function(error, result1) {
        if (error) return console.log(error);
        else { result=result1;
         }
          res.redirect("/show"); 
      })



});

router.delete("/show/:id", middleware.isLoggedIn,function(req, res){
   joinus.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/show");
      } else {
          res.redirect("/show");
      }
   });
});

router.get("/register", (req, res) => res.render("register", {page: "register"}));


router.post("/register", (req, res) => {
  let newUser = new User({
    username: req.body.username,
  });
  
  if (req.body.adminCode === 'abcd') {
    newUser.isAdmin = true;
  
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate email
        req.flash("error", "That email has already been registered.");
        return res.redirect("/register");
      } 
      // Some other error
      req.flash("error", "Something went wrong...");
      return res.redirect("/register");
    }
    
    passport.authenticate("local")(req, res, () => {
      req.flash("success", "Welcome Nazim " + user.username);
      res.redirect("/show");
    });
  });
}
else{
req.flash("error", "Something went wrong...");
      return res.redirect("/register");
    }

});








// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out seccessfully. Look forward to seeing you again!");
  res.redirect("/");
});

module.exports = router;


// db.joinus.aggregate({"$project": {
//         "y": {
//             "$year": "$createdAt"
//         },
//         "m": {
//             "$month": "$createdAt"
//         },
//         "d": {
//             "$dayOfMonth": "$createdAt"
//         }
    
// }},{$group:{_id:{type:{type:"$type"}},num:{$sum:"$count"}}},
// {
//     $sort: {
//         "_id.year": 1,
//         "_id.month": 1,
//         "_id.day": 1
//     }
// })

// db.joinus.aggregate(
// {
//     "$project": {
//         "y": {
//             "$year": "$createdAt"
//         },
//         "m": {
//             "$month": "$createdAt"
//         },
//         "d": {
//             "$dayOfMonth": "$createdAt"
//         }
//     }
// },
// {
//     "$group": {
//         "_id": {
//             "year": "$y",
//             "month": "$m",
//             "day": "$d"
//         },
//         count: {
//             "$sum": 4
//         }
//     }
// },
// {
//     $sort: {
//         "_id.year": 1,
//         "_id.month": 1,
//         "_id.day": 1
//     }
// })

db.joinus.find({
        createdAt: {
            $gte: new Date(new Date().getTime()-60*5*1000).toISOString()
         }
     })
        