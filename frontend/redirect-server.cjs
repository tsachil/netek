const http = require('http');

const HTTP_PORT = 5180;
// Redirect to external HTTPS port (mapped in docker-compose)
const HTTPS_EXTERNAL_PORT = process.env.HTTPS_EXTERNAL_PORT || 3030;

const server = http.createServer((req, res) => {
  const host = req.headers.host?.split(':')[0] || 'localhost';
  const redirectUrl = `https://${host}:${HTTPS_EXTERNAL_PORT}${req.url}`;

  res.writeHead(301, { Location: redirectUrl });
  res.end();
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`HTTP redirect server running on port ${HTTP_PORT} -> HTTPS port ${HTTPS_EXTERNAL_PORT}`);
});
