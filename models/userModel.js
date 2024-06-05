const crypto = require('crypto');
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "PLease provide a valid email"],
  },
  photo: String,
  role:{
    type:String,
    enum:['user','guide','lead-guide','admin'],
    default:'user'
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select:false
  },
  passwordConfirm: {
    type: String,
    required: [true, "PLease confirm your password"],
    validate: {
      // This only works on CREATE AND SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
  passwordChangeAt:Date,
  passwordResetToken:String,
  passwordResetExpires:Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }

});

userSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

   // Hash the password with cost of 12   
  this.password = await bcrypt.hash(this.password, 12);
 
  // Delete passwordConfirm field    
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save',function(next){
if(!this.isModified('password') || this.isNew) return next();

this.passwordChangeAt=Date.now()-1000;
});

userSchema.pre(/^find/,function(next){
  // this points to current querry
  this.find({active:{$ne:false}});
  next();

})

userSchema.methods.correctPassword=async function (candidatePassword,userPassword){
  return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changePasswordAfter=  function(JWTTimestamp){
  if (this.passwordChangeAt){
    const changedTimestamp = parseInt(this.passwordChangeAt.getTime()/1000,10);
    console.log(this.passwordChangeAt,JWTTimestamp);

    return JWTTimestamp<changedTimestamp;

  }
  // False means NOT changed
  return false;
}
userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');

 this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');

//  console.log({resetToken},this.passwordResetToken);

 this.passwordResetExpires = Date.now() + 10*60*1000;

 return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
