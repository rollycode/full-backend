import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
); // this is data when we fill form

app.use(express.urlencoded({ limit: "16kb", extended: true })); //this is when data is in url , %20 is usually for space

app.use(express.static("public")); //for PDF and image or favicon that we want to store in our server, provide folder name

app.use(cookieParser());

// router import

import userRouter from "./routes/user.routers.js";

//router declaration
// app.get - > when we are not importing router , router and controller are here in same file
//app.use-> when we use middleware i.e. router is in seperate file

//below is the middleware , benefir is that we don't need to write it again just add the extended url part

// https://localhost:800/api/v1/users/register

app.use("/api/v1/users", userRouter);

// https://localhost:800/api/v1/users/login
//app.use("/api/v1/users", loginRoute);
export { app };
