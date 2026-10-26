import express from 'express';
const app = express(); app.use(express.json({limit:'512kb'}));
app.get('/api/health', (_req,res) => res.json({ ok: true, project: 'paper2play' }));
app.listen(5209, '127.0.0.1', () => console.log('[paper2play] api ready on 5209'));
