import Notice from "../models/Notice.js";
import User from "../models/User.js";
import { sendAlertEmail } from "../config/email.js";

// Helper to map notice to frontend shape
const mapNoticeForFrontend = (notice) => {
  const author = notice.posted_by || {};
  return {
    id: notice.id,
    title: notice.title,
    body: notice.body,
    important: notice.is_important,
    authorName: author.name || "System Admin",
    createdAt: notice.created_at ? notice.created_at.toISOString() : new Date().toISOString(),
  };
};

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Admin only)
export const createNotice = async (req, res) => {
  const { title, body, important } = req.body;

  try {
    if (!title || !body) {
      return res.status(400).json({ message: "Please provide title and body" });
    }

    const notice = await Notice.create({
      posted_by: req.user._id,
      title,
      body,
      is_important: !!important,
    });

    const populated = await Notice.findById(notice._id).populate("posted_by", "name");
    const result = mapNoticeForFrontend(populated);

    // If marked important, email all residents
    if (important) {
      const residents = await User.find({ role: "resident" });
      const emails = residents.map((r) => r.email).filter(Boolean);

      if (emails.length > 0) {
        console.log(`Sending important notice email alert to ${emails.length} residents...`);
        const emailBody = `📢 IMPORTANT SOCIETY NOTICE:\n\nTitle: ${title}\n\nMessage:\n${body}\n\nPosted by: ${populated.posted_by.name}\n\nSociety Management`;
        
        const emailHtml = `<h3>📢 Important Announcement</h3>
                           <h2>${title}</h2>
                           <p style="white-space: pre-wrap; line-height: 1.6; font-size: 14px;">${body}</p>
                           <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;"/>
                           <p style="font-size: 12px; color: #666;">Posted by: ${populated.posted_by.name}</p>`;

        // Send to residents asynchronously without blocking response
        for (const email of emails) {
          sendAlertEmail({
            to: email,
            subject: `📢 Society Maintainence Tracker Society Announcement: ${title}`,
            text: emailBody,
            html: emailHtml,
          });
        }
      }
    }

    res.status(201).json({
      ok: true,
      notice: result,
    });
  } catch (error) {
    console.error("Create notice error:", error);
    res.status(500).json({ message: "Server error creating notice" });
  }
};

// @desc    Get notices
// @route   GET /api/notices
// @access  Private (All users)
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("posted_by", "name")
      .sort({ created_at: -1 });

    const mapped = notices.map(mapNoticeForFrontend);

    // Sort: important ones first, then newest first
    mapped.sort((a, b) => {
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(mapped);
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({ message: "Server error retrieving notices" });
  }
};

// @desc    Update a notice
// @route   PATCH /api/notices/:id
// @access  Private (Admin only)
export const updateNotice = async (req, res) => {
  const { title, body, important } = req.body;

  try {
    const notice = await Notice.findById(req.params.id).populate("posted_by", "name");
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    notice.title = title || notice.title;
    notice.body = body || notice.body;
    notice.is_important = important !== undefined ? !!important : notice.is_important;

    const updatedNotice = await notice.save();
    const result = mapNoticeForFrontend(updatedNotice);

    res.json({
      ok: true,
      notice: result,
    });
  } catch (error) {
    console.error("Update notice error:", error);
    res.status(500).json({ message: "Server error updating notice" });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    await Notice.deleteOne({ _id: req.params.id });

    res.json({
      ok: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);
    res.status(500).json({ message: "Server error deleting notice" });
  }
};
