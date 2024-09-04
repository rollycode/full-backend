import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subsciber: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // one who owns the channel
      ref: "User",
    },
  },
  { timestamps }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
