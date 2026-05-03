import express from 'express';
import db from '../db/database';

const router = express.Router();

router.get('/stats', (req, res) => {
  const totalQueries = (db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE role = "user"').get() as any) || { count: 0 };
  const totalDocs = (db.prepare('SELECT COUNT(*) as count FROM documents').get() as any) || { count: 0 };
  const avgConfidence = (db.prepare('SELECT AVG(confidence) as avg FROM chat_messages WHERE role = "assistant"').get() as any) || { avg: 0 };
  
  res.json({
    totalQueries: totalQueries.count || 0,
    totalDocuments: totalDocs.count || 0,
    averageConfidence: (avgConfidence.avg || 0) * 100,
    activeSessions: (db.prepare('SELECT COUNT(*) as count FROM chat_sessions').get() as any)?.count || 0
  });
});

router.get('/timeline', (req, res) => {
  const timeline = db.prepare(`
    SELECT DATE(timestamp) as date, COUNT(*) as count 
    FROM chat_messages 
    WHERE role = "user" 
    GROUP BY DATE(timestamp) 
    ORDER BY date ASC 
    LIMIT 7
  `).all();
  res.json(timeline);
});

export default router;
