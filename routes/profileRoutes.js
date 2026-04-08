const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const pc = require("../controllers/profileController");
const Degree        = require("../models/Degree");
const Certification = require("../models/Certification");
const Licence       = require("../models/Licence");
const Course        = require("../models/Course");
const Employment    = require("../models/Employment");

router.post("/",auth, pc.upsertProfile);
router.get("/me",auth, pc.getMyProfile);

router.post("/degrees",auth, pc.addItem(Degree));
router.delete("/degrees/:itemId",auth, pc.deleteItem(Degree));

router.post("/certifications",           auth, pc.addItem(Certification));
router.delete("/certifications/:itemId", auth, pc.deleteItem(Certification));

router.post("/licences",           auth, pc.addItem(Licence));
router.delete("/licences/:itemId", auth, pc.deleteItem(Licence));

router.post("/courses",           auth, pc.addItem(Course));
router.delete("/courses/:itemId", auth, pc.deleteItem(Course));

router.post("/employment",           auth, pc.addItem(Employment));
router.delete("/employment/:itemId", auth, pc.deleteItem(Employment));

module.exports = router;