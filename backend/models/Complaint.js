import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Plumbing",
        "Electrical",
        "Housekeeping",
        "Security",
        "Elevator",
        "Common Area",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    photo_url: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    manual_overdue: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Map MongoDB _id to virtual id for frontend compatibility
complaintSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

complaintSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
