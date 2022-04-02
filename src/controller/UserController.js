const UserModel = require("../Model/UserModel")
const jwt = require('jsonwebtoken')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null)
      return false
    if (typeof value === 'string' && value.trim().length === 0)
      return false
    else
      return true;
  }
  const isTitleValid = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
  }
  const isBodyRequestValid = function (requestBody) {
    return Object.keys(requestBody).length > 0
  }

const CreateUser =async function(req, res){
    try{
        let requestBody = req.body

        if(!isBodyRequestValid(requestBody)){
            res.status(400).send({status:false, msg:"No input provided"})
            return
    }

       const {title,name,phone,email,password,address} = requestBody

       if(!isValid(title)){
        return res.status(400).send({status:false, msg:"title is required"})
        
    }

       if(!isTitleValid(title)){
        res.status(400).send({status:false, msg:"title should be 'Mr', 'Mrs', 'Miss' "})
        return
    }

       if(!isValid(name)){
            res.status(400).send({status:false, msg:"name is required"})
            return
    }

    if(!isValid(phone)){
        res.status(400).send({status:false, msg:"phone is required"})
        return
    }

   
    const isPhoneUsed = await UserModel.findOne({phone})
    if (isPhoneUsed) {
        res.status(400).send({status:false, msg:"phone no should be unique"})
        return
    }

    if(!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))){
        res.status(400).send({status:false, msg:"phone no is not valid"})
        return
    }


    if(!isValid(email)){
        res.status(400).send({status:false, msg:"email is required"})
        return
    }

    const isEmailUsed = await UserModel.findOne({email})
    if (isEmailUsed) {
        res.status(400).send({status:false, msg:"email should be unique"})
        return
    }

    if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
        res.status(400).send({status:false, msg:"email is not valid"})
        return
    }

    if(!isValid(password)){
       res.status(400).send({status:false, msg:"password is required"})
       return
    }

    

    if (password.length<8 || password.length>15) {
        return res.status(400).send({status:false, msg:"Password should be between 8-15"})
    }

    if(!isValid(address)){
    res.status(400).send({status:false, msg:"address is required"})
    return
    }

    const newUser = await UserModel.create(requestBody);
    
    res.status(201).send({ status: true, message: `new User created`, data: newUser });

    }
    catch(error){
        res.status(500).send({status:false, msg:error.msg})
    }
}

const UserLogin = async function(req, res){
    try{
        let requestBody = req.body

        if(!isBodyRequestValid(requestBody)){
            res.status(400).send({status:false, msg:"No input provided"})
            return
    }

    const {email,password} = requestBody

    if(!isValid(email)){
     return res.status(400).send({status:false, msg:"email is required"})
     
 }

 if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
    res.status(400).send({status:false, msg:"email is not valid"})
}

if(!isValid(password)){
   res.status(400).send({status:false, msg:"password is required"})
   return
}

const User = await UserModel.findOne({ email, password });
    if (!User) {
      res.status(401).send({ status: false, message: `Email or password is invalid ` });
      return
    }

    const token = await jwt.sign({
        userId: User._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 60 * 60
      }, 'secret-key')
      res.header('x-api-key', token);
      res.status(200).send({ status: true, message: `User login successfull`, data: { token } });

    }
    catch(error){
        res.status(500).send({status:false, msg:error.msg})
    }
}

module.exports.CreateUser=CreateUser
module.exports.UserLogin=UserLogin
