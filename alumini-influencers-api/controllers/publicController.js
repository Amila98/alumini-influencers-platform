const Profile       = require("../models/Profile");
const User          = require("../models/User");
const Degree        = require("../models/Degree");
const Certification = require("../models/Certification");
const Licence       = require("../models/Licence");
const Course        = require("../models/Course");
const Employment    = require("../models/Employment");

exports.getAlumniOfTheDay = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { isActiveToday: true },
      include: [
        { model: User, attributes: ["email"] },
        { model: Degree },
        { model: Certification },
        { model: Licence },
        { model: Course },
        { model: Employment }
      ],

      attributes: { exclude: ["userId", "appearanceCount"] }
    });

    if (!profile) {
      return res.status(404).json({ message: "No Alumni of the Day yet" });
    }

    res.json({
      date: new Date().toISOString().split("T")[0],
      alumniOfTheDay: profile
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
