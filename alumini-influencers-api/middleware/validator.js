const { body, validationResult } = require("express-validator");


exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};


exports.registerValidator = [
  body("email")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail()
    .matches(/@(my\.(eastminster|westminster)\.ac\.uk)$/)
    .withMessage("Must use a university email address"),

  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[!@#$%^&*]/).withMessage("Password must contain a special character (!@#$%^&*)"),
];

exports.loginValidator = [
  body("email")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .trim()
];

exports.forgotPasswordValidator = [
  body("email")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail()
];

exports.resetPasswordValidator = [
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain uppercase")
    .matches(/[0-9]/).withMessage("Must contain a number")
    .matches(/[!@#$%^&*]/).withMessage("Must contain a special character")
];


exports.profileValidator = [
  body("linkedInUrl")
    .optional()
    .isURL().withMessage("Invalid LinkedIn URL")
    .contains("linkedin.com").withMessage("Must be a LinkedIn URL"),

  body("bio")
    .optional()
    .isLength({ max: 500 }).withMessage("Bio must be under 500 characters")
    .trim()
    .escape() 
];

exports.degreeValidator = [
  body("title")
    .notEmpty().withMessage("Degree title is required")
    .isLength({ max: 200 }).withMessage("Title too long")
    .trim().escape(),

  body("institution")
    .notEmpty().withMessage("Institution is required")
    .trim().escape(),

  body("completionDate")
    .isDate().withMessage("Invalid date format"),

  body("url")
    .optional()
    .isURL().withMessage("Invalid URL")
];

exports.certificationValidator = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .trim().escape(),

  body("issuingBody")
    .notEmpty().withMessage("Issuing body is required")
    .trim().escape(),

  body("completionDate")
    .isDate().withMessage("Invalid date"),

  body("url")
    .optional()
    .isURL().withMessage("Invalid URL")
];

exports.licenceValidator = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .trim().escape(),

  body("awardingBody")
    .notEmpty().withMessage("Awarding body is required")
    .trim().escape(),

  body("completionDate")
    .isDate().withMessage("Invalid date"),

  body("url")
    .optional()
    .isURL().withMessage("Invalid URL")
];

exports.courseValidator = [
  body("title")
    .notEmpty().withMessage("Course title is required")
    .trim().escape(),

  body("provider")
    .notEmpty().withMessage("Provider is required")
    .trim().escape(),

  body("completionDate")
    .isDate().withMessage("Invalid date"),

  body("url")
    .optional()
    .isURL().withMessage("Invalid URL")
];

exports.employmentValidator = [
  body("jobTitle")
    .notEmpty().withMessage("Job title is required")
    .trim().escape(),

  body("company")
    .notEmpty().withMessage("Company is required")
    .trim().escape(),

  body("startDate")
    .isDate().withMessage("Invalid start date"),

  body("endDate")
    .optional({ nullable: true })
    .isDate().withMessage("Invalid end date"),

  body("description")
    .optional()
    .isLength({ max: 1000 }).withMessage("Description too long")
    .trim().escape()
];


exports.bidValidator = [
  body("amount")
    .isFloat({ min: 0.01 }).withMessage("Bid amount must be a positive number")
    .toFloat()
];