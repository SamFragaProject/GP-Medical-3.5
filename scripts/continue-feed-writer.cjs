'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.CONTINUE_FEED_PORT ? Number(process.env.CONTINUE_FEED_PORT) : 5051;
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, '.continue');
const OUT_MD = path.join(OUT_DIR, 'analysis-feed.md');
const OUT_NDJSON = path.join(OUT_DIR, 'analysis-feed.ndjson');

fs.mkdirSync(OUT_DIR, { recursive: true });

function appendMarkdown(entry) {
  const line = `\n\n### ${new Date(entry.timestamp).toISOString()} • ${entry.type.toUpperCase()} ${entry.level ? '('+entry.level+')' : ''}\n\n- path: ${entry.path || ''}\n- message: ${entry.message || ''}\n- data: ${'```json\n' + JSON.stringify(entry.data || {}, null, 2) + '\n```'}\n`;
  fs.appendFileSync(OUT_MD, line, 'utf8');
}

function appendNdjson(entry) {
  fs.appendFileSync(OUT_NDJSON, JSON.stringify(entry) + '\n', 'utf8');
}

function ok(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify({ ok: true, ...data }));
}

function bad(res, code, msg) {
  res.writeHead(code || 400, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify({ ok: false, error: msg }));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.url === '/report' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const entry = {
          type: payload.type || 'event',
          level: payload.level || 'info',
          message: payload.message || '',
          data: payload.data || null,
          path: payload.path || '',
          timestamp: payload.timestamp || Date.now(),
        };
        appendMarkdown(entry);
        appendNdjson(entry);
        return ok(res, { written: true });
      } catch (e) {
        return bad(res, 400, 'Invalid JSON payload');
      }
    });
    return;
  }

  if (req.url === '/health') {
    return ok(res, { port: PORT });
  }

  bad(res, 404, 'Not found');
});

server.listen(PORT, () => {
  const initHeader = `# Continue Analysis Feed\n\nStarted at ${new Date().toISOString()} on port ${PORT}.\n\nThis file is appended automatically.\n`;
  if (!fs.existsSync(OUT_MD)) fs.writeFileSync(OUT_MD, initHeader, 'utf8');
  console.log(`[continue-feed] listening on http://localhost:${PORT}`);
});
