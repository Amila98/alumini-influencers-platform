const Profile      = require("../models/Profile");
const Degree       = require("../models/Degree");
const Certification = require("../models/Certification");
const Licence      = require("../models/Licence");
const Course       = require("../models/Course");
const Employment   = require("../models/Employment");


exports.upsertProfile = async (req, res) => {
  try {
    const { bio, linkedInUrl } = req.body;
    const userId = req.user.userId;

    const [profile, created] = await Profile.findOrCreate({
      where: { userId },
      defaults: { bio, linkedInUrl }
    });

    if (!created) {
      await profile.update({ bio, linkedInUrl });
    }

    res.status(created ? 201 : 200).json({
      message: created ? "Profile created" : "Profile updated",
      profile
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.userId },
      include: [Degree, Certification, Licence, Course, Employment]
    });

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.addItem = (Model) => async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const item = await Model.create({ ...req.body, profileId: profile.id });
    res.status(201).json({ message: "Added successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.updateItem = (Model) => async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const [updated] = await Model.update(req.body, {
      where: { id: req.params.itemId, profileId: profile.id }
    });

    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.deleteItem = (Model) => async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const deleted = await Model.destroy({
      where: { id: req.params.itemId, profileId: profile.id }
    });

    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};