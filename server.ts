import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // TVB News upstream primary and fallback sources
  const TVB_NEWS_PRIMARY_M3U8 = 'https://h5cdn3.kylintv.tv/live/tvbnews_iphone.m3u8';

  // Helper to resolve relative paths against a base URL
  function resolveUrl(relative: string, base: string): string {
    try {
      return new URL(relative, base).toString();
    } catch {
      return relative;
    }
  }

  // 1. Dedicated TVB News proxy endpoint: /api/stream/tvb.m3u8
  app.get('/api/stream/tvb.m3u8', async (_req: Request, res: Response) => {
    try {
      const response = await fetch(TVB_NEWS_PRIMARY_M3U8, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
          'Referer': 'https://www.kylintv.com/',
        },
      });

      if (!response.ok) {
        res.status(response.status).send(`Failed to fetch TVB stream: ${response.statusText}`);
        return;
      }

      const m3u8Text = await response.text();
      const baseUrl = TVB_NEWS_PRIMARY_M3U8;

      // Rewrite segment lines so they proxy through /api/stream/proxy
      const rewrittenLines = m3u8Text.split('\n').map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          return line;
        }
        const absoluteSegmentUrl = resolveUrl(trimmed, baseUrl);
        return `/api/stream/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
      });

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(rewrittenLines.join('\n'));
    } catch (err: any) {
      console.error('TVB stream proxy error:', err);
      res.status(502).send(`Upstream stream error: ${err.message}`);
    }
  });

  // 2. Generic stream proxy endpoint: /api/stream/proxy?url=...
  app.get('/api/stream/proxy', async (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    try {
      const upstreamRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': targetUrl,
        },
      });

      if (!upstreamRes.ok) {
        res.status(upstreamRes.status).send(`Failed upstream: ${upstreamRes.statusText}`);
        return;
      }

      const contentType = upstreamRes.headers.get('content-type') || '';
      const isM3u8 = targetUrl.includes('.m3u8') || contentType.includes('mpegurl');

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

      if (isM3u8) {
        const text = await upstreamRes.text();
        const rewritten = text.split('\n').map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          const absolute = resolveUrl(trimmed, targetUrl);
          return `/api/stream/proxy?url=${encodeURIComponent(absolute)}`;
        }).join('\n');

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(rewritten);
      } else {
        // .ts segment or binary video chunk
        res.setHeader('Content-Type', contentType || 'video/MP2T');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const arrayBuffer = await upstreamRes.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error('Stream segment proxy error:', err);
      res.status(502).send(`Segment error: ${err.message}`);
    }
  });

  // 3. Health check API for streams
  app.get('/api/stream/status', async (_req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const ping = await fetch(TVB_NEWS_PRIMARY_M3U8, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const latencyMs = Date.now() - startTime;
      res.json({
        channel: 'TVB 无线新闻台',
        status: ping.ok ? 'online' : 'unreachable',
        httpStatus: ping.status,
        latencyMs,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.json({
        channel: 'TVB 无线新闻台',
        status: 'offline',
        error: err.message,
        latencyMs: Date.now() - startTime,
      });
    }
  });

  // 4. Vite middleware for development or static serving for production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
