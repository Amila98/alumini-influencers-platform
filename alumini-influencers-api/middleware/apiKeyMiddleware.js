const ApiKey = require("../models/ApiKey");
const ApiKeyLog = require("../models/ApiKeyLog");

const CLIENT_PERMISSIONS = {
  analytics_dashboard: ["read:alumni", "read:analytics"],
  ar_app:              ["read:alumni_of_day"],
  other:               []
};

const apiKeyAuth = (requiredPermission) => async (req, res, next) => {
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

    const permissions = Array.isArray(apiKey.permissions)
      ? apiKey.permissions
      : [];

    const hasPermission = permissions.includes(requiredPermission);

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress;

    if (!hasPermission) {
      await ApiKeyLog.create({
        apiKeyId: apiKey.id,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: ip,
        denied: true,
        deniedReason: `Missing permission: ${requiredPermission}`
      });

      return res.status(403).json({
        message: "Forbidden — insufficient permissions",
        required: requiredPermission,
        yourPermissions: permissions
      });
    }

    await apiKey.increment("usageCount");
    await apiKey.update({ lastUsedAt: new Date() });

    await ApiKeyLog.create({
      apiKeyId: apiKey.id,
      endpoint: req.originalUrl,
      method: req.method,
      ipAddress: ip,
      denied: false
    });

    req.apiKey = apiKey;
    next();

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = apiKeyAuth;