import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/APIError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/Cloudinary.js";
import { ApiResponse } from "../utils/APIResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  console.log("REQUEST BODY DETAILS :", req.body);
  // if (fullName === "") {
  //   throw new ApiError(400, "Full Name is required");
  // }
  if (
    [username, fullName, email, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //validate if user exists

  const exitsUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exitsUser) {
    throw new ApiError(409, "User (email or name) already exists");
  }
  console.log("LOCAL PATH  FOR REQ.FILES***", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar file is required");
  }
  //upload file to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // let user;
  // try {
  //   user = await User.create({
  //     fullName,
  //     avatar: avatar.url,
  //     coverImage: coverImage?.url || "",
  //     email,
  //     password,
  //     username: username.toLowerCase(),
  //   });
  // } catch (error) {
  //   console.error("Error creating user:", error);
  //   throw new ApiError(500, "Something went wrong while registering the user");
  // }

  // Fetch created user
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("Created User:", createdUser);

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user Registered Successfully"));
});

export { registerUser };
