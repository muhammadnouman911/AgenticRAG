import express from 'express';
import multer from 'multer';
import { processDocument } from '../services/documentProcessor';
import db from '../db/database';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.array('files'), async (req: express.Request, res: express.Response) => {
  const files = req.files as Express.Multer.File[];
  const results = [];

  for (const file of files) {
    try {
      const result = await processDocument(file);
      results.push(result);
    } catch (error: any) {
      results.push({ filename: file.originalname, error: error.message });
    }
  }

  res.json(results);
});

router.get('/', (req, res) => {
  const docs = db.prepare('SELECT * FROM documents ORDER BY upload_date DESC').all();
  res.json(docs);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
