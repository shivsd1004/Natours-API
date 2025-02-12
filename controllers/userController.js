const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory=require('./handlerFactory');

const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el]=obj[el];
  })
return newObj;
}

exports.updateMe=async(req,res,next)=>{
  // 1) Create error if user Posts password data
  if(req.body.password|| req.body.passwordConfirm){
    return next (new AppError('this route is not for password updates.Please use /updatePassword',400))
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody=filterObj(req,body,'name','email');
  // 3)Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
    runValidators:true
  });
    res.status(200).json({
    status:'success',
    data:{
      user:updatedUser
    }
  })
};
exports.getme=(req,res,next)=>{
  req.params.id=req.user.id;
  next()
}

exports.deleteMe= catchAsync(async(req,res,next)=>{
  await User.findByIdAndDelete(req.user.id, {active:false });

  res.status(204).json({
    status:'success',
    data:null
  });
});
exports.createUser=(req,res)=>{
  res.status(500).json({
    status:'error',
    message:'this route is not yet defined'
  });
};


exports.getAllUsers=factory.getAll(User);
exports.getUser=factory.getOne(User);
  // Do not update password with this
exports.updateUser=factory.updateOne(User);
exports.deleteUser=factory.deleteOne(User);
  