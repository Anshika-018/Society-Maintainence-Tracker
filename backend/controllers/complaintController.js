import Complaint from "../models/Complaint.js";
import ComplaintHistory from "../models/ComplaintHistory.js";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
import { sendAlertEmail } from "../config/email.js";

// Helper to get overdue threshold
const getOverdueThresholdDays = async () => {
  try {
    const setting = await Setting.findOne({ key: "overdueDays" });
    if (setting) {
      return parseInt(setting.value);
    }
  } catch (error) {
    console.error("Error fetching overdue setting:", error);
  }
  return parseInt(process.env.OVERDUE_THRESHOLD_DAYS || "7");
};

// Helper to map a complaint to the frontend shape
const mapComplaintForFrontend = async (complaint, overdueThresholdDays) => {
  const resident = complaint.resident_id || {};
  
  // Find all history logs for this complaint, sorted chronologically (oldest first)
  const historyLogs = await ComplaintHistory.find({ complaint_id: complaint._id })
    .populate("changed_by", "name")
    .sort({ timestamp: 1 });

  const now = new Date();
  const createdAt = new Date(complaint.createdAt);
  const ageDays = (now - createdAt) / (1000 * 60 * 60 * 24);
  const isOverdue = complaint.status !== "Resolved" && 
    (complaint.manual_overdue || ageDays > overdueThresholdDays);

  const mappedHistory = historyLogs.map((log) => ({
    at: log.timestamp.toISOString(),
    actorName: log.changed_by ? log.changed_by.name : "System",
    action: log.action,
    note: log.note || undefined,
  }));

  return {
    id: complaint.id,
    residentId: resident._id ? resident._id.toHexString() : "",
    residentName: resident.name || "Unknown Resident",
    residentFlat: resident.flat || "",
    category: complaint.category,
    description: complaint.description,
    photo: complaint.photo_url,
    status: complaint.status,
    priority: complaint.priority,
    manualOverdue: complaint.manual_overdue,
    createdAt: complaint.createdAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
    history: mappedHistory,
    isOverdue, // Derived property for convenience
  };
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Resident only)
export const createComplaint = async (req, res) => {
  const { category, description } = req.body;

  try {
    if (!category || !description) {
      return res.status(400).json({ message: "Please provide category and description" });
    }

    // Build static absolute URL for uploaded photo if it exists
    let photo_url = null;
    if (req.file) {
      photo_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // Create complaint
    const complaint = await Complaint.create({
      resident_id: req.user._id,
      category,
      description,
      photo_url,
      priority: "Medium",
      status: "Open",
      manual_overdue: false,
    });

    // Write initial ComplaintHistory row
    await ComplaintHistory.create({
      complaint_id: complaint._id,
      changed_by: req.user._id,
      action: "Complaint raised",
      old_status: "Created",
      new_status: "Open",
      note: "Complaint raised by resident",
    });

    const threshold = await getOverdueThresholdDays();
    
    // Fetch complaint populated with resident details
    const populated = await Complaint.findById(complaint._id).populate("resident_id", "name flat email");
    const result = await mapComplaintForFrontend(populated, threshold);

    res.status(201).json({
      ok: true,
      complaint: result,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Server error during complaint creation" });
  }
};

// @desc    Get mine complaints
// @route   GET /api/complaints/mine
// @access  Private (Resident only)
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ resident_id: req.user._id })
      .populate("resident_id", "name flat email")
      .sort({ createdAt: -1 });

    const threshold = await getOverdueThresholdDays();
    const mapped = await Promise.all(
      complaints.map((c) => mapComplaintForFrontend(c, threshold))
    );

    res.json(mapped);
  } catch (error) {
    console.error("Get my complaints error:", error);
    res.status(500).json({ message: "Server error retrieving complaints" });
  }
};

// @desc    Get complaint detail + history array
// @route   GET /api/complaints/:id
// @access  Private (Resident / Admin)
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("resident_id", "name flat email");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Residents can only view their own complaints
    if (req.user.role === "resident" && complaint.resident_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    const threshold = await getOverdueThresholdDays();
    const result = await mapComplaintForFrontend(complaint, threshold);

    res.json(result);
  } catch (error) {
    console.error("Get complaint by ID error:", error);
    res.status(500).json({ message: "Server error retrieving complaint details" });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin only)
export const getComplaints = async (req, res) => {
  const { category, status, date_start, date_end } = req.query;

  try {
    const query = {};

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply status filter
    if (status) {
      query.status = status;
    }

    // Apply date range filter
    if (date_start || date_end) {
      query.createdAt = {};
      if (date_start) {
        query.createdAt.$gte = new Date(date_start);
      }
      if (date_end) {
        // Extend to end of the day
        const end = new Date(date_end);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const complaints = await Complaint.find(query)
      .populate("resident_id", "name flat email")
      .sort({ createdAt: -1 });

    const threshold = await getOverdueThresholdDays();
    
    // Map with overdue calculation
    const mapped = await Promise.all(
      complaints.map((c) => mapComplaintForFrontend(c, threshold))
    );

    // Sort overdue to the top, then newest first
    mapped.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(mapped);
  } catch (error) {
    console.error("Get admin complaints error:", error);
    res.status(500).json({ message: "Server error retrieving complaints" });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin only)
export const updateComplaintStatus = async (req, res) => {
  const { status, note } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: "Please provide a new status" });
    }

    const complaint = await Complaint.findById(req.params.id).populate("resident_id", "name flat email");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Resolved complaints reject further edits
    if (complaint.status === "Resolved") {
      return res.status(400).json({ message: "Resolved complaints are closed and cannot be modified" });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    complaint.updatedAt = new Date();

    const updatedComplaint = await complaint.save();

    // Log the change in history
    await ComplaintHistory.create({
      complaint_id: complaint._id,
      changed_by: req.user._id,
      action: `Status → ${status}`,
      old_status: oldStatus,
      new_status: status,
      note: note || "",
    });

    const threshold = await getOverdueThresholdDays();
    const result = await mapComplaintForFrontend(updatedComplaint, threshold);

    // Send email alert to resident (async, do not block request)
    const resident = populatedResident(updatedComplaint);
    if (resident.email) {
      const emailBody = `Hello ${resident.name},\n\nYour complaint regarding "${complaint.category}" has been updated.\n\nOld Status: ${oldStatus}\nNew Status: ${status}\nAdmin Note: ${note || "None"}\n\nThank you,\nSociety Management`;
      
      const emailHtml = `<p>Hello <strong>${resident.name}</strong>,</p>
                         <p>Your complaint regarding "${complaint.category}" has been updated.</p>
                         <table border="1" cellpadding="8" style="border-collapse: collapse;">
                           <tr><td><strong>Old Status</strong></td><td>${oldStatus}</td></tr>
                           <tr><td><strong>New Status</strong></td><td><strong>${status}</strong></td></tr>
                           <tr><td><strong>Admin Note</strong></td><td>${note || "<em>None</em>"}</td></tr>
                         </table>
                         <p>Thank you,<br/>Society Management</p>`;

      sendAlertEmail({
        to: resident.email,
        subject: `Complaint #${complaint.id.slice(-6).toUpperCase()} Status Updated to ${status}`,
        text: emailBody,
        html: emailHtml,
      });
    }

    res.json({
      ok: true,
      complaint: result,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
};

// @desc    Update complaint priority
// @route   PATCH /api/complaints/:id/priority
// @access  Private (Admin only)
export const updateComplaintPriority = async (req, res) => {
  const { priority } = req.body;

  try {
    if (!priority) {
      return res.status(400).json({ message: "Please provide a priority level" });
    }

    const complaint = await Complaint.findById(req.params.id).populate("resident_id", "name flat email");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Resolved complaints reject further edits
    if (complaint.status === "Resolved") {
      return res.status(400).json({ message: "Resolved complaints are closed and cannot be modified" });
    }

    const oldPriority = complaint.priority;
    complaint.priority = priority;
    complaint.updatedAt = new Date();

    const updatedComplaint = await complaint.save();

    // Log in history
    await ComplaintHistory.create({
      complaint_id: complaint._id,
      changed_by: req.user._id,
      action: `Priority set to ${priority}`,
      old_status: complaint.status,
      new_status: complaint.status,
      note: `Priority changed from ${oldPriority} to ${priority}`,
    });

    const threshold = await getOverdueThresholdDays();
    const result = await mapComplaintForFrontend(updatedComplaint, threshold);

    res.json({
      ok: true,
      complaint: result,
    });
  } catch (error) {
    console.error("Update priority error:", error);
    res.status(500).json({ message: "Server error updating priority" });
  }
};

// @desc    Toggle manual overdue flag
// @route   PATCH /api/complaints/:id/manual-overdue
// @access  Private (Admin only)
export const toggleManualOverdue = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("resident_id", "name flat email");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Resolved complaints reject further edits
    if (complaint.status === "Resolved") {
      return res.status(400).json({ message: "Resolved complaints are closed and cannot be modified" });
    }

    const nextFlag = !complaint.manual_overdue;
    complaint.manual_overdue = nextFlag;
    complaint.updatedAt = new Date();

    const updatedComplaint = await complaint.save();

    // Log in history
    await ComplaintHistory.create({
      complaint_id: complaint._id,
      changed_by: req.user._id,
      action: nextFlag ? "Flagged as overdue" : "Overdue flag removed",
      old_status: complaint.status,
      new_status: complaint.status,
    });

    const threshold = await getOverdueThresholdDays();
    const result = await mapComplaintForFrontend(updatedComplaint, threshold);

    res.json({
      ok: true,
      complaint: result,
    });
  } catch (error) {
    console.error("Toggle overdue error:", error);
    res.status(500).json({ message: "Server error toggling overdue status" });
  }
};

// Helper to return resident info safely
const populatedResident = (complaint) => {
  if (complaint.resident_id && typeof complaint.resident_id === "object") {
    return complaint.resident_id;
  }
  return {};
};
