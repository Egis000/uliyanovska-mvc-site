const http = require('http');
const url = require('url');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // CORS для клиента на другом домене
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (pathname === '/sum') {
    const a = Number(query.a);
    const b = Number(query.b);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Parameters a and b must be numbers' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ result: a + b }));
  }

  // healthcheck
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
