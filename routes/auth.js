const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser")


const JWT_SECRET = "ayan is goog$boy";
 
// RoutE1:Create a user using POST "/api/auth/".Doesnt require auth.No login required

router.post(
  "/createuser",
  [
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("email", "enter valid email").isEmail(),
    body("password", "password atleast 5 character").isLength({ min: 5 }),

    //if there are errors ,return Bad requiest and the erros
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check whether user with same email exist already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }
      //secured
      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password, salt);

      //create  new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const data = {
        id: user.id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // console.log(jwtData)
      // res.json(user);
      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some Error occured");
    }
  }
);

//route2:authntic a login
router.post(
  "/login",
  [
    
    body("email", "enter valid email").isEmail(),
    body("password", "password cannot blank").exists(),
     

    //if there are errors ,return Bad requiest and the erros
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
const {email,password} =req.body;
try {
  let user = await User.findOne({email});
  if(!user){
    return res.status(400).json({error:"Please try to login with correct credentials"});

  }
  const passwordCompare = await bcrypt.compare(password,user.password);
  if(!passwordCompare){
    return res.status(400).json({error:"please try to login with correct credentials"})
  }
  const data ={
    user:{
      id:user.id
    }
  }
  const authtoken =jwt.sign(data,JWT_SECRET);
  res.json({authtoken})


  
} catch (error) {
  console.error(error.message);
      res.status(500).send("Internal server Error occured");
}

  })
  //Route3: get logggedin user Details Using POST "/api/auth/gatuser".Doesnt require auth. Login required
  router.post(
    "/getuser",
    fetchuser,
     async(req,res)=>{
try {
   const userId = req.user.id;
  const user =await User.findById(userId).select("-password")
  res.send(user)
  
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal server Error occured");
}
    })

module.exports = router
