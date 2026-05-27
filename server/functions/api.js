const serverless = require('serverless-http');
const app = require('../index.js');

// Wrap the Express app and configure binary media types for PDF rendering
const handler = serverless(app, {
  binary: ['application/pdf', 'application/octet-stream']
});

module.exports.handler = async (event, context) => {
  // Netlify routes paths to `/.netlify/functions/api/...`
  // We rewrite the event path so Express's internal routes (like `/api/...`) match seamlessly!
  if (event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
  }
  
  return await handler(event, context);
};