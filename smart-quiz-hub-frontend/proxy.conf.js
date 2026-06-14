/**
 * Angular dev-server proxy configuration.
 *
 * All requests to /api are forwarded to the backend.
 * BACKEND_URL is read from the environment at `ng serve` start time:
 *   - Docker : BACKEND_URL=http://backend:8080  (set in docker-compose.yml)
 *   - Local  : defaults to http://localhost:8080 (no env var needed)
 */
const target = process.env['BACKEND_URL'] || 'http://localhost:8080';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn'
  }
};
