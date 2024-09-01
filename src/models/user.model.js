import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // to make a filed serachable(optimized serach) , its expensive so we don't use for many fields
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String, //this wil be a cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //this wil be a cloudinary url
    },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: {
      type: String, // we will be encoding so all types will become string
      required: [true, "Password id required"],
    },
    refereshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// custome methods can be created (Added) in mongoose'

//in this menthod we ask bcrypt to chek if password is correct or not, asunc await because encrypt-decrypt can take time

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// in this mentod we use jwt (it is bearer token , menans we allow who bears it)
//session and cookies both will be used access token will not be saved in DB , refreshtoken we will save in DB
//JWT is fast so no need for async
//in jwt payload left part is name for payload and right is from DB
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id, //data is saved in DB , we get this from mongoDB auto generated
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id, //data is saved in DB , we get this from mongoDB auto generated
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.Model("User", userSchema);
