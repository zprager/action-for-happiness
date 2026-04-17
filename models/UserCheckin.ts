import { Schema, model, models, InferSchemaType, Model, Types } from "mongoose";

const AnswerSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const UserCheckinSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkinId: { type: String, required: true, trim: true },
    version: { type: Number, required: true, default: 1 },
    answers: { type: [AnswerSchema], default: [] },
    completedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true, collection: "user-checkins" }
);

UserCheckinSchema.index({ userId: 1, completedAt: -1 });

export type UserCheckin = InferSchemaType<typeof UserCheckinSchema> & { _id: Types.ObjectId };

export default (models.UserCheckin as Model<UserCheckin>) || model<UserCheckin>("UserCheckin", UserCheckinSchema);
