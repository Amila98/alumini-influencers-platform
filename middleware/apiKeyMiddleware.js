const ApiKey = require("../models/ApiKey");
const ApiKeyLog = require("../models/ApiKeyLog");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "API key required" });
  }

  const key = authHeader.split(" ")[1];

  try {
    const apiKey = await ApiKey.findOne({ where: { key, isActive: true } });

    if (!apiKey) {
      return res.status(401).json({ message: "Invalid or revoked API key" });
    }

    await apiKey.update({
      lastUsedAt: new Date(),
      usageCount: apiKey.usageCount + 1
    });

  
    await ApiKeyLog.create({
      apiKeyId: apiKey.id,
      endpoint: req.originalUrl,
      method: req.method,
      ipAddress: req.ip
    });

    req.apiKey = apiKey;
    next();

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};