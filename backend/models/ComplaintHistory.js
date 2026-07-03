import mongoose from "mongoose";

const complaintHistorySchema = new mongoose.Schema({
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  changed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g. "Complaint raised", "Status → In Progress", "Priority set to High", "Flagged as overdue"
  },
  old_status: {
    type: String,
    required: true,
  },
  new_status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

complaintHistorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

complaintHistorySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const ComplaintHistory = mongoose.model("ComplaintHistory", complaintHistorySchema);
export default ComplaintHistory;
