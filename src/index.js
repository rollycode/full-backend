//require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "../src/db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("ERR:", err);
      throw err;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Mongo DB connection failed!!! ${err}`);
  });
