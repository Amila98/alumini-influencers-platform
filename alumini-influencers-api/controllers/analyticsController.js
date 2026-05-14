const { Op, fn, col, literal, QueryTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile      = require("../models/Profile");
const User         = require("../models/User");
const Degree       = require("../models/Degree");
const Certification = require("../models/Certification");
const Licence      = require("../models/Licence");
const Course       = require("../models/Course");
const Employment   = require("../models/Employment");


const buildProfileFilter = (query) => {
  const where = {};
  if (query.programme)      where.programme = query.programme;       // exact match
  if (query.graduationYear) where.graduationYear = query.graduationYear;
  return where;
};

const buildEmploymentFilter = (query) => {
  const where = {};
  if (query.sector) where.industrySector = { [Op.like]: `%${query.sector}%` };
  return where;
};


//  Filter Options for Frontend Dropdowns 
exports.getFilterOptions = async (req, res) => {
  try {
    const [programmes, years, sectors] = await Promise.all([
      Profile.findAll({
        attributes: [[fn("DISTINCT", col("programme")), "programme"]],
        where: { programme: { [Op.not]: null } },
        raw: true
      }),
      Profile.findAll({
        attributes: [[fn("DISTINCT", col("graduationYear")), "graduationYear"]],
        where: { graduationYear: { [Op.not]: null } },
        order: [["graduationYear", "DESC"]],
        raw: true
      }),
      Employment.findAll({
        attributes: [[fn("DISTINCT", col("industrySector")), "industrySector"]],
        where: { industrySector: { [Op.not]: null } },
        raw: true
      })
    ]);

    res.json({
      programmes: programmes.map(p => p.programme).filter(Boolean).sort(),
      graduationYears: years.map(y => y.graduationYear).filter(Boolean),
      sectors: sectors.map(s => s.industrySector).filter(Boolean).sort()
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//  Get All Alumni (filtered) 
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

// Skills Gap Analysis 
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

// Employment by Industry Sector
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

// Most Common Job Titles 
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
      where: { endDate: null }, 
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

// Geographic Distribution 
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

// Certification Trends Over Time 
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

// Summary Stats (Dashboard overview cards) 

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


// Programme Comparison (Radar Chart) 
exports.getProgrammeComparison = async (req, res) => {
  try {
    const programmes = await Profile.findAll({
      attributes: [
        "programme",
        [fn("COUNT", col("Profile.id")), "totalAlumni"],
        [fn("AVG", col("Certifications.id")), "avgCerts"],
      ],
      include: [
        { model: Certification, attributes: [] },
        { model: Course, attributes: [] },
        { model: Employment, attributes: [], where: { endDate: null }, required: false }
      ],
      group: ["programme"],
      raw: true
    });

    // Simpler approach — query each metric separately
    const programmeList = await Profile.findAll({
      attributes: [[fn("DISTINCT", col("programme")), "programme"]],
      where: { programme: { [Op.not]: null } },
      raw: true
    });

    const results = await Promise.all(
      programmeList.map(async ({ programme }) => {
        const where = { programme };

        const [total, certs, courses, employed, degrees] = await Promise.all([
          Profile.count({ where }),
          Certification.count({ include: [{ model: Profile, where, attributes: [] }] }),
          Course.count({ include: [{ model: Profile, where, attributes: [] }] }),
          Employment.count({
            include: [{ model: Profile, where, attributes: [] }],
            where: { endDate: null }
          }),
          Degree.count({ include: [{ model: Profile, where, attributes: [] }] })
        ]);

        return {
          programme,
          totalAlumni: total,
          avgCerts:    total > 0 ? Math.round((certs    / total) * 10) / 10 : 0,
          avgCourses:  total > 0 ? Math.round((courses  / total) * 10) / 10 : 0,
          avgDegrees:  total > 0 ? Math.round((degrees  / total) * 10) / 10 : 0,
          employmentRate: total > 0 ? Math.round((employed / total) * 100) : 0
        };
      })
    );

    res.json({
      filters: req.query,
      programmes: results.filter(p => p.programme && p.totalAlumni > 0)
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



exports.getCareerProgression = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const jobs = await Employment.findAll({
      include: [{
        model: Profile,
        where: profileWhere,
        attributes: ['graduationYear']
      }],
      where: { endDate: null }, 
      attributes: ['jobTitle', 'startDate']
    });

    const levels = {
      'Junior': 0,
      'Mid-Level': 0,
      'Senior': 0,
      'Lead': 0,
      'Manager': 0
    };

    jobs.forEach(job => {
      const title = job.jobTitle.toLowerCase();
      if (title.includes('junior') || title.includes('graduate')) {
        levels['Junior']++;
      } else if (title.includes('senior') || title.includes('principal')) {
        levels['Senior']++;
      } else if (title.includes('lead') || title.includes('staff')) {
        levels['Lead']++;
      } else if (title.includes('manager') || title.includes('director') || title.includes('head')) {
        levels['Manager']++;
      } else {
        levels['Mid-Level']++;
      }
    });

    res.json({
      filters: req.query,
      totalJobs: jobs.length,
      levels
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getEmploymentTimeline = async (req, res) => {
  try {
    const profileWhere = buildProfileFilter(req.query);

    const profiles = await Profile.findAll({
      where: profileWhere,
      include: [{
        model: Employment,
        where: { endDate: null },
        required: false
      }],
      attributes: ['id', 'graduationYear']
    });


    const timelineData = {};
    
    profiles.forEach(p => {
      const year = p.graduationYear;
      if (!timelineData[year]) {
        timelineData[year] = { total: 0, employed: 0 };
      }
      timelineData[year].total++;
      if (p.Employments && p.Employments.length > 0) {
        timelineData[year].employed++;
      }
    });

    const timeline = Object.entries(timelineData)
      .sort((a, b) => a[0] - b[0])
      .map(([year, stats]) => ({
        year: parseInt(year),
        total: stats.total,
        employed: stats.employed,
        employmentRate: Math.round((stats.employed / stats.total) * 100)
      }));

    res.json({
      filters: req.query,
      timeline
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
