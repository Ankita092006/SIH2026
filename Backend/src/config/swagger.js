const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Dementia Cognitive Gaming API",
      version: "1.0.0",
      description:
        "API documentation for the Dementia Cognitive Gaming Platform",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
  },

  apis: [
    "./src/app.js",
    "./src/routes/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;