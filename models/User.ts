import { Schema, model, models, InferSchemaType, Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema> & { _id: string };

export default (models.User as Model<User>) || model<User>("User", UserSchema);
