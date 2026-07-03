import Complaint from "../models/Complaint.js";
import Setting from "../models/Setting.js";

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

// @desc    Get dashboard metrics
// @route   GET /api/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    const thresholdDays = await getOverdueThresholdDays();
    const now = new Date();

    const statusCounts = {
      Open: 0,
      "In Progress": 0,
      Resolved: 0,
    };

    const categoryCounts = {
      Plumbing: 0,
      Electrical: 0,
      Housekeeping: 0,
      Security: 0,
      Elevator: 0,
      "Common Area": 0,
      Other: 0,
    };

    let overdueCount = 0;

    complaints.forEach((c) => {
      // Increment status count
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }

      // Increment category count
      if (categoryCounts[c.category] !== undefined) {
        categoryCounts[c.category]++;
      }

      // Increment overdue count
      if (c.status !== "Resolved") {
        const createdAt = new Date(c.createdAt);
        const ageDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        if (c.manual_overdue || ageDays > thresholdDays) {
          overdueCount++;
        }
      }
    });

    res.json({
      countsByStatus: statusCounts,
      countsByCategory: categoryCounts,
      overdueCount,
      totalCount: complaints.length,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error calculating stats" });
  }
};
