const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Alumni Influencers API",
      version: "1.0.0",
      description: "API for the Alumni Influencer Platform - manage profiles, bids, and public data"
    },
    servers: [
      { 
        url: process.env.APP_URL || "http://localhost:3000", 
        description: "API server" 
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authenticated alumni users"
        },
        ApiKeyAuth: {
          type: "apiKey", 
          in: "header",
          name: "Authorization",
          description: "Format: Bearer <api_key>" 
        }
      }
    }
  },
  apis: [path.join(__dirname, "../routes/*.js")]
};

module.exports = swaggerJsdoc(options);
