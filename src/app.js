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

export { app };
