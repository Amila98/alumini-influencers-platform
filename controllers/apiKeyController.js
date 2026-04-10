const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");
const ApiKeyLog = require("../models/ApiKeyLog");


exports.generateKey = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Key name is required" });
    }
    const existingCount = await ApiKey.count({
      where: { userId: req.user.userId, isActive: true }
    });

    if (existingCount >= 5) {
      return res.status(400).json({ message: "Maximum 5 active API keys allowed" });
    }
    const key = crypto.randomBytes(32).toString("hex");

    const apiKey = await ApiKey.create({
      userId: req.user.userId,
      key,
      name
    });

    res.status(201).json({
      message: "API key generated successfully",
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key,           
        createdAt: apiKey.createdAt
      },
      warning: "Save this key now — it will not be shown again"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.listKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { userId: req.user.userId },
      attributes: ["id", "name", "isActive", "usageCount", "lastUsedAt", "createdAt"]
    });

    res.json(keys);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getKeyStats = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.keyId, userId: req.user.userId },
      attributes: ["id", "name", "isActive", "usageCount", "lastUsedAt", "createdAt"]
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    const logs = await ApiKeyLog.findAll({
      where: { apiKeyId: apiKey.id },
      order: [["accessedAt", "DESC"]],
      limit: 50,
      attributes: ["endpoint", "method", "ipAddress", "accessedAt"]
    });

    res.json({
      key: apiKey,
      totalRequests: apiKey.usageCount,
      lastUsed: apiKey.lastUsedAt,
      recentLogs: logs
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.revokeKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.keyId, userId: req.user.userId }
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    if (!apiKey.isActive) {
      return res.status(400).json({ message: "API key is already revoked" });
    }

    await apiKey.update({ isActive: false });

    res.json({ message: "API key revoked successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};