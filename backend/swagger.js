// Swagger/OpenAPI documentation setup
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PaxiPM AI API',
      version: '1.0.0',
      description: 'AI-driven Project Management SaaS API',
      contact: {
        name: 'PaxiPM AI Support',
        email: 'support@paxipm.ai'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['Admin', 'Project Manager', 'Viewer'], example: 'Project Manager' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Complete website redesign project' },
            client: { type: 'string', example: 'Acme Corp' },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-06-30' },
            status: { type: 'string', enum: ['Active', 'Completed', 'On Hold', 'Cancelled'], example: 'Active' },
            riskScore: { type: 'integer', minimum: 0, maximum: 100, example: 45 }
          }
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            projectId: { type: 'integer', example: 1 },
            summary: { type: 'string', example: 'Project status report summary' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./api/routes/*.js', './app.js']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };

