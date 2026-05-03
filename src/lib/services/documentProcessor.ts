import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export async function processDocument(file: { originalname: string; buffer: Buffer; size: number; mimetype: string }) {
  let content = '';
  const id = uuidv4();

  if (file.mimetype === 'application/pdf') {
    const data = await pdf(file.buffer);
    content = data.text;
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    content = data.value;
  } else if (file.mimetype === 'text/plain') {
    content = file.buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type');
  }

  // Basic chunking (sliding window)
  const chunkSize = 1000;
  const chunkOverlap = 200;
  const chunks: string[] = [];
  
  for (let i = 0; i < content.length; i += chunkSize - chunkOverlap) {
    chunks.push(content.slice(i, i + chunkSize));
  }

  // Store metadata
  db.prepare(`
    INSERT INTO documents (id, filename, file_type, file_size, chunk_count)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, file.originalname, file.mimetype, file.size, chunks.length);

  // Store chunks
  const insertChunk = db.prepare(`
    INSERT INTO chunks (id, document_id, content)
    VALUES (?, ?, ?)
  `);

  const transaction = db.transaction((chunks: string[]) => {
    for (const chunk of chunks) {
      insertChunk.run(uuidv4(), id, chunk);
    }
  });

  transaction(chunks);

  return { id, filename: file.originalname, chunkCount: chunks.length };
}
