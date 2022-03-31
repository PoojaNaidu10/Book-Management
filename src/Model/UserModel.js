const mongoose = require("mongoose")
const UserModel = mongoose.Schema({
    title: {
        type: String,
        required: true,
        enum:["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        trim: true,
        type: String,
        required: 'Intern mobile is required',
        unique: true,
        validate: {
            validator: function (mobile) {
                return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(mobile)
            }, message: 'Please fill a valid mobile number', isAsync: false
        }
    },
    email: { type: String, trim: true, lowercase: true, unique: true, required: 'Email address is required',
    validate: {
        validator: function (email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        }, message: 'Please fill a valid email address', isAsync: false
    }
  },
    password: {
        type: String,
        required:true,
        maxlength:15,
        minlength:8
        
        },
     address: {
        street:{type:String},
        city:{type:String},
        pincode:{type:String}
        }
    
    }, { timestamps: true })
module.exports=mongoose.model("User",UserModel)


