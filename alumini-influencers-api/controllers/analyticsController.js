const { Op, fn, col, literal, QueryTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile      = require("../models/Profile");
const User         = require("../models/user");
const Degree       = require("../models/Degree");
const Certification = require("../models/Certification");
const Licence      = require("../models/Licence");
const Course       = require("../models/Course");
const Employment   = require("../models/Employment");

// ─── Helper: build filter WHERE clause ───────────────────────
// Supports ?programme=CS&graduationYear=2023&sector=Technology
const buildProfileFilter = (query) => {
  const where = {};
  if (query.programme)      where.programme = query.programme;
  if (query.graduationYear) where.graduationYear = query.graduationYear;
  return where;
};

const buildEmploymentFilter = (query) => {
  const where = {};
  if (query.sector) where.industrySector = { [Op.like]: `%${query.sector}%` };
  return where;
};

// ─── 1. Get All Alumni (filtered) ────────────────────────────
// GET /api/public/alumni?programme=CS&graduationYear=2023&sector=Tech
exports.getAllAlumni = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const alumni = await Profile.findAll({
      where: profileWhere,
      include: [
        { model: User, attributes: ["email"] },
        { model: Degree },
        { model: Certification },
        { model: Licence },
        { model: Course },
        {
          model: Employment,
          where: buildEmploymentFilter(req.query),
          required: Object.keys(buildEmploymentFilter(req.query)).length > 0
        }
      ],
      attributes: { exclude: ["appearanceCount"] }
    });

    res.json({
      total: alumni.length,
      filters: req.query,
      alumni
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 2. Skills Gap Analysis ───────────────────────────────────
// GET /api/public/analytics/skills-gap
// Shows certifications alumni acquired AFTER graduation
// = signals what the curriculum is missing
exports.getSkillsGap = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    // Count certifications grouped by issuingBody + title
    const certGaps = await Certification.findAll({
      attributes: [
        "title",
        "issuingBody",
        [fn("COUNT", col("Certification.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      group: ["title", "issuingBody"],
      order: [[literal("count"), "DESC"]],
      limit: 20,
      raw: true
    });

    // Count courses grouped by title + provider
    const courseGaps = await Course.findAll({
      attributes: [
        "title",
        "provider",
        [fn("COUNT", col("Course.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      group: ["title", "provider"],
      order: [[literal("count"), "DESC"]],
      limit: 20,
      raw: true
    });

    // Total alumni for percentage calculation
    const totalAlumni = await Profile.count({ where: profileWhere });

    // Add percentage and severity rating
    const rateCerts = certGaps.map(c => ({
      ...c,
      count: parseInt(c.count),
      percentage: totalAlumni > 0 ? Math.round((c.count / totalAlumni) * 100) : 0,
      // Severity helps dashboard colour-code the gap
      severity: c.count / totalAlumni >= 0.5 ? "critical"
              : c.count / totalAlumni >= 0.25 ? "significant"
              : "emerging"
    }));

    const rateCourses = courseGaps.map(c => ({
      ...c,
      count: parseInt(c.count),
      percentage: totalAlumni > 0 ? Math.round((c.count / totalAlumni) * 100) : 0,
      severity: c.count / totalAlumni >= 0.5 ? "critical"
              : c.count / totalAlumni >= 0.25 ? "significant"
              : "emerging"
    }));

    res.json({
      totalAlumni,
      filters: req.query,
      certificationGaps: rateCerts,
      courseGaps: rateCourses
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 3. Employment by Industry Sector ────────────────────────
// GET /api/public/analytics/employment-sectors
exports.getEmploymentSectors = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const sectors = await Employment.findAll({
      attributes: [
        "industrySector",
        [fn("COUNT", col("Employment.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      where: {
        industrySector: { [Op.not]: null },
        // Current jobs only (endDate is null)
        endDate: null
      },
      group: ["industrySector"],
      order: [[literal("count"), "DESC"]],
      raw: true
    });

    const total = sectors.reduce((sum, s) => sum + parseInt(s.count), 0);

    const result = sectors.map(s => ({
      sector: s.industrySector || "Unknown",
      count: parseInt(s.count),
      percentage: total > 0 ? Math.round((s.count / total) * 100) : 0
    }));

    res.json({
      totalEmployed: total,
      filters: req.query,
      sectors: result
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 4. Most Common Job Titles ────────────────────────────────
// GET /api/public/analytics/job-titles?limit=10
exports.getJobTitles = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);
    const limit = parseInt(req.query.limit) || 10;

    const titles = await Employment.findAll({
      attributes: [
        "jobTitle",
        [fn("COUNT", col("Employment.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      where: { endDate: null }, // current roles only
      group: ["jobTitle"],
      order: [[literal("count"), "DESC"]],
      limit,
      raw: true
    });

    res.json({
      filters: req.query,
      jobTitles: titles.map(t => ({
        title: t.jobTitle,
        count: parseInt(t.count)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 5. Top N Employers ───────────────────────────────────────
// GET /api/public/analytics/top-employers?limit=10
exports.getTopEmployers = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);
    const limit = parseInt(req.query.limit) || 10;

    const employers = await Employment.findAll({
      attributes: [
        "company",
        [fn("COUNT", col("Employment.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      where: { endDate: null }, // current jobs only
      group: ["company"],
      order: [[literal("count"), "DESC"]],
      limit,
      raw: true
    });

    res.json({
      filters: req.query,
      employers: employers.map(e => ({
        company: e.company,
        count: parseInt(e.count)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 6. Geographic Distribution ──────────────────────────────
// GET /api/public/analytics/geographic
exports.getGeographic = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const locations = await Employment.findAll({
      attributes: [
        "location",
        [fn("COUNT", col("Employment.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      where: {
        location: { [Op.not]: null },
        endDate: null
      },
      group: ["location"],
      order: [[literal("count"), "DESC"]],
      raw: true
    });

    const total = locations.reduce((sum, l) => sum + parseInt(l.count), 0);

    res.json({
      filters: req.query,
      totalMapped: total,
      locations: locations.map(l => ({
        location: l.location || "Unknown",
        count: parseInt(l.count),
        percentage: total > 0 ? Math.round((l.count / total) * 100) : 0
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 7. Certification Trends Over Time ───────────────────────
// GET /api/public/analytics/cert-trends
// Shows how certifications have grown month by month
exports.getCertTrends = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const trends = await Certification.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("completionDate"), "%Y-%m"), "month"],
        "issuingBody",
        [fn("COUNT", col("Certification.id")), "count"]
      ],
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: []
      }],
      where: {
        completionDate: {
          [Op.not]: null,
          // Last 24 months
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 24))
        }
      },
      group: [
        fn("DATE_FORMAT", col("completionDate"), "%Y-%m"),
        "issuingBody"
      ],
      order: [[literal("month"), "ASC"]],
      raw: true
    });

    res.json({
      filters: req.query,
      trends: trends.map(t => ({
        month: t.month,
        issuingBody: t.issuingBody,
        count: parseInt(t.count)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── 8. Summary Stats (Dashboard overview cards) ─────────────
// GET /api/public/analytics/summary
exports.getSummary = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const [
      totalAlumni,
      totalCertifications,
      totalEmployed,
      totalCourses
    ] = await Promise.all([
      Profile.count({ where: profileWhere }),
      Certification.count({
        include: [{ model: Profile, where: profileWhere, attributes: [] }]
      }),
      Employment.count({
        include: [{ model: Profile, where: profileWhere, attributes: [] }],
        where: { endDate: null }
      }),
      Course.count({
        include: [{ model: Profile, where: profileWhere, attributes: [] }]
      })
    ]);

    res.json({
      filters: req.query,
      summary: {
        totalAlumni,
        totalCertifications,
        totalEmployed,
        totalCourses,
        avgCertsPerAlumni: totalAlumni > 0
          ? Math.round((totalCertifications / totalAlumni) * 10) / 10
          : 0,
        employmentRate: totalAlumni > 0
          ? Math.round((totalEmployed / totalAlumni) * 100)
          : 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};