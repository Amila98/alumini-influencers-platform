const rateLimit = require("express-rate-limit");


exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,                   
  message: {
    message: "Too many attempts from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});


exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});



exports.emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,                    
  message: {
    message: "Too many email requests, please try again after 1 hour"
  }
});