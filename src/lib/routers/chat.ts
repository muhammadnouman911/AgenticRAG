import express from 'express';
import { AgentOrchestrator, AgentStep } from '../agent/orchestrator';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const saveResult = (sessionId: string, query: string, result: any) => {
  // Ensure session exists first to avoid FOREIGN KEY constraint failures
  db.prepare(`
    INSERT OR IGNORE INTO chat_sessions (id, title)
    VALUES (?, ?)
  `).run(sessionId, query.slice(0, 50));

  // Save user message
  db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, content)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), sessionId, 'user', query);

  // Save assistant message
  db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, content, sources_json, confidence, trace_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    sessionId,
    'assistant',
    result.answer,
    JSON.stringify(result.sources),
    result.confidence,
    JSON.stringify(result.steps)
  );

  // Update session time
  db.prepare(`
    UPDATE chat_sessions SET last_updated = CURRENT_TIMESTAMP WHERE id = ?
  `).run(sessionId);
};

router.post('/query', async (req, res) => {
  const { query, sessionId = uuidv4() } = req.body;

  try {
    const orchestrator = new AgentOrchestrator(query);
    const result = await orchestrator.run();
    saveResult(sessionId, query, result);
    res.json({ ...result, sessionId });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stream', (req, res) => {
  const { query, sessionId = uuidv4() } = req.query;
  const sid = sessionId as string;
  const q = query as string;

  if (!q) {
    return res.status(400).json({ error: 'Query is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const orchestrator = new AgentOrchestrator(q, [], (step) => {
    sendEvent({ type: 'step', step });
  });

  orchestrator.run()
    .then((result) => {
      saveResult(sid, q, result);
      sendEvent({ type: 'done', result: { ...result, sessionId: sid } });
      res.end();
    })
    .catch((error) => {
      sendEvent({ type: 'error', error: error.message });
      res.end();
    });

  req.on('close', () => {
    res.end();
  });
});

router.get('/history', (req, res) => {
  const history = db.prepare('SELECT * FROM chat_sessions ORDER BY last_updated DESC').all();
  res.json(history);
});

router.get('/history/:sessionId', (req, res) => {
  const messages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC').all(req.params.sessionId);
  res.json(messages.map((m: any) => ({
    ...m,
    sources: m.sources_json ? JSON.parse(m.sources_json) : [],
    steps: m.trace_json ? JSON.parse(m.trace_json) : []
  })));
});

export default router;
