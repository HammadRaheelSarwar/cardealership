export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Independent Dealership CRM & AI Sales Platform API',
    version: '1.0.0',
    description: 'Multi-Tenant Automotive CRM API powered by Supabase PostgreSQL and Node.js Express',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Gateway',
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register new user account',
        tags: ['Authentication'],
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in user and return JWT access token',
        tags: ['Authentication'],
      },
    },
    '/leads': {
      get: {
        summary: 'List leads for active dealership context',
        tags: ['Leads'],
      },
      post: {
        summary: 'Create lead opportunity',
        tags: ['Leads'],
      },
    },
    '/customers': {
      get: {
        summary: 'List dealership customers',
        tags: ['Customers'],
      },
      post: {
        summary: 'Create customer record',
        tags: ['Customers'],
      },
    },
    '/vehicles': {
      get: {
        summary: 'List vehicle inventory',
        tags: ['Vehicles'],
      },
    },
    '/tasks': {
      get: {
        summary: 'List dealership tasks',
        tags: ['Tasks'],
      },
    },
    '/appointments': {
      get: {
        summary: 'List scheduled appointments',
        tags: ['Appointments'],
      },
    },
    '/integrations/status': {
      get: {
        summary: 'Get status of SMS, Email, AI, and Storage integrations',
        tags: ['Integrations'],
      },
    },
  },
};
