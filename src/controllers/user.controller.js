import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/APIError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/Cloudinary.js";
import { ApiResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBefore: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating token");
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  // check if files are not empty
  //check if user exists(find the user)
  //password matches - throw error if it doesn't
  // if matches acess and refresh token generation
  // send secure cookies with token
  // res - success
  console.log("***********", req.body);
  const { email, username, password } = req.body;
  console.log("CONTROLLER rEQ BODY", req.body);
  if (!username && !email) {
    throw new ApiError(400, "user name or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user doen't exits ");
  }

  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user password ");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // remove cookies acess token and refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  // console.log("$$$$$$$$", accessToken);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedout "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //get refresh token from cookie or body(mobile app)
  const incomingRefreshToken = req.body.refreshToken || req.cookie.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (decodedToken?._id) {
      throw new ApiError(401, "Unauthorized req - rolls");
    }
    const user = User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // match incoming token when decoded matches with token saved in user (when we created)
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    const options = { httpOnly: true, secure: true };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Acess token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || " invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
