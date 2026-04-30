const { Op } = require("sequelize");
const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");
const ApiKeyLog = require("../models/ApiKeyLog");

const CLIENT_PERMISSIONS = require("../utils/permissions");

exports.generateKey = async (req, res) => {
  try {
    const { name, clientType = "other" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Key name is required" });
    }

    const validTypes = ["analytics_dashboard", "ar_app", "other"];
    if (!validTypes.includes(clientType)) {
      return res.status(400).json({
        message: "Invalid clientType",
        validOptions: validTypes
      });
    }

    // Handle analytics dashboard separately
    if (clientType === "analytics_dashboard") {
  await ApiKey.update(
    { isActive: false },
    {
      where: {
        userId: req.user.userId,
        clientType: "analytics_dashboard",
        isActive: true
      }
    }
  );
}

    //Get active NON-dashboard keys
    const activeKeys = await ApiKey.findAll({
      where: {
        userId: req.user.userId,
        isActive: true,
        clientType: { [Op.ne]: "analytics_dashboard" }
      },
      order: [["createdAt", "ASC"]] 
    });

    // Enforce max 5 (excluding dashboard key)
    if (activeKeys.length >= 5) {
      const keysToDeactivate = activeKeys.slice(0, activeKeys.length - 4);

      const ids = keysToDeactivate.map(k => k.id);

      await ApiKey.update(
        { isActive: false },
        { where: { id: ids } }
      );
    }

    // Generate new key
    const rawKey = crypto.randomBytes(32).toString("hex");
    const hashedKey = crypto
      .createHash("sha256")
      .update(rawKey)
      .digest("hex");
    const permissions = CLIENT_PERMISSIONS[clientType] || [];

    const apiKey = await ApiKey.create({
      userId: req.user.userId,
      key: hashedKey,
      name,
      clientType,
      permissions
    });

    res.status(201).json({
      message: "API key generated successfully",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        clientType: apiKey.clientType,
        permissions: apiKey.permissions,
        key: rawKey,
        createdAt: apiKey.createdAt
      },
      warning: "Save this key now — it will not be shown again"
    });

  } catch (err) {
    console.error("Generate key error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


exports.listKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { userId: req.user.userId },
      attributes: [
        "id", 
        "name", 
        "clientType", 
        "permissions", 
        "isActive", 
        "usageCount", 
        "lastUsedAt", 
        "createdAt"
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({ 
      count: keys.length,
      keys 
    });

  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.getKeyStats = async (req, res) => {
  try {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findOne({
      where: { 
        id: keyId, 
        userId: req.user.userId 
      },
      attributes: [
        "id", 
        "name", 
        "clientType", 
        "permissions", 
        "isActive", 
        "usageCount", 
        "lastUsedAt", 
        "createdAt"
      ]
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    const logs = await ApiKeyLog.findAll({
      where: { apiKeyId: keyId },
      order: [["accessedAt", "DESC"]],
      limit: 50,
      attributes: [
        "endpoint", 
        "method", 
        "ipAddress", 
        "denied", 
        "deniedReason", 
        "accessedAt"
      ]
    });

    res.json({
      apiKey,
      recentLogs: logs,
      totalLogs: logs.length
    });

  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.revokeKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const apiKey = await ApiKey.findOne({
      where: { 
        id: keyId, 
        userId: req.user.userId 
      }
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    await apiKey.update({ isActive: false });

    res.json({ 
      message: "API key revoked successfully",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        isActive: apiKey.isActive
      }
    });

  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};