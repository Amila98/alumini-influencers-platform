const ApiKey = require("../models/ApiKey");
const ApiKeyLog = require("../models/ApiKeyLog");
const crypto = require("crypto");
const CLIENT_PERMISSIONS = require("../utils/permissions");

const apiKeyAuth = (requiredPermission) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "API key required" });
  }

  const key = authHeader.split(" ")[1];

  try {
    const hashedKey = crypto
      .createHash("sha256")
      .update(key)
      .digest("hex");

    const apiKey = await ApiKey.findOne({
      where: { key: hashedKey, isActive: true }
    });

    if (!apiKey) {
      return res.status(401).json({ message: "Invalid or revoked API key" });
    }

    let permissions = apiKey.permissions;

    if (typeof permissions === "string") {
      try {
        permissions = JSON.parse(permissions);
      } catch (err) {
        console.error("Failed to parse permissions:", err);
        permissions = [];
      }
    }

    // Ensure it's an array
    if (!Array.isArray(permissions)) {
      permissions = [];
    }

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