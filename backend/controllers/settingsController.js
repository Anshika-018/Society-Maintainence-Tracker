import Setting from "../models/Setting.js";

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: "overdueDays" });
    
    if (!setting) {
      const defaultDays = process.env.OVERDUE_THRESHOLD_DAYS || "7";
      setting = await Setting.create({ key: "overdueDays", value: defaultDays });
    }

    res.json({
      overdueDays: parseInt(setting.value),
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error retrieving settings" });
  }
};

// @desc    Update global settings
// @route   PATCH /api/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res) => {
  const { overdueDays } = req.body;

  try {
    if (overdueDays === undefined || isNaN(overdueDays) || parseInt(overdueDays) < 1) {
      return res.status(400).json({ message: "Please provide a valid positive number of days" });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: "overdueDays" },
      { value: overdueDays.toString() },
      { new: true, upsert: true }
    );

    res.json({
      ok: true,
      settings: {
        overdueDays: parseInt(setting.value),
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error updating settings" });
  }
};
