import { generateContent, generateJSON } from '../services/ai';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface AgentStep {
  id: string;
  name: string;
  description: string;
  input: any;
  output: any;
  startTime: number;
  endTime: number;
  status: 'pending' | 'success' | 'retry' | 'failed';
}

export interface AgentState {
  query: string;
  rewrittenQuery?: string;
  history: string[];
  chunks: any[];
  gradedChunks: any[];
  answer?: string;
  sources: any[];
  steps: AgentStep[];
  retryCount: number;
  confidence: number;
}

export class AgentOrchestrator {
  private state: AgentState;
  private onStep?: (step: AgentStep) => void;

  constructor(query: string, history: string[] = [], onStep?: (step: AgentStep) => void) {
    this.state = {
      query,
      history,
      chunks: [],
      gradedChunks: [],
      sources: [],
      steps: [],
      retryCount: 0,
      confidence: 0
    };
    this.onStep = onStep;
  }

  private async addStep(name: string, description: string, fn: () => Promise<any>) {
    const step: AgentStep = {
      id: uuidv4(),
      name,
      description,
      input: null,
      output: null,
      startTime: Date.now(),
      endTime: 0,
      status: 'pending'
    };
    this.state.steps.push(step);
    this.onStep?.(step);
    
    try {
      const result = await fn();
      step.output = result;
      step.status = 'success';
      step.endTime = Date.now();
      this.onStep?.(step);
      return result;
    } catch (error: any) {
      step.output = { error: error.message };
      step.status = 'failed';
      step.endTime = Date.now();
      this.onStep?.(step);
      throw error;
    }
  }

  async run() {
    // 1. Analyze and Rewrite Query
    await this.addStep('Query Analysis', 'Understanding intent and rewriting for optimal retrieval', async () => {
      const prompt = `Analyze this user query: "${this.state.query}". 
      Rewrite it to be more suitable for semantic search and web search. 
      Return JSON: { "rewrittenQuery": "...", "intent": "...", "isComplex": boolean }`;
      
      const result = await generateJSON<{ rewrittenQuery: string }>(prompt);
      this.state.rewrittenQuery = result.rewrittenQuery;
      return result;
    });

    // 2. Retrieval (Simulated Vector Search + SQL for now)
    await this.addStep('Information Retrieval', 'Searching local knowledge base', async () => {
      const searchTerms = this.state.rewrittenQuery || this.state.query;
      // In a real app, we'd use embeddings here. For now, we'll do a simple text search.
      const chunks = db.prepare(`
        SELECT c.*, d.filename 
        FROM chunks c 
        JOIN documents d ON c.document_id = d.id 
        WHERE c.content LIKE ? 
        LIMIT 5
      `).all(`%${searchTerms}%`);
      
      this.state.chunks = chunks;
      return { found: chunks.length };
    });

    // 3. Grading
    await this.addStep('Source Grading', 'Evaluating relevance and quality of retrieved information', async () => {
      if (this.state.chunks.length === 0) return { graded: 0 };
      
      const prompt = `Grade these pieces of information for relevance to query: "${this.state.query}".
      Information: ${JSON.stringify(this.state.chunks.map(c => c.content))}
      Return JSON: { "graded": [ { "index": number, "relevance": number, "reason": "..." } ] }`;
      
      const result = await generateJSON<{ graded: any[] }>(prompt);
      this.state.gradedChunks = result.graded
        .filter(g => g.relevance > 0.5)
        .map(g => ({ ...this.state.chunks[g.index], relevance: g.relevance }));
      
      this.state.sources = this.state.gradedChunks.map(c => ({
        id: c.id,
        title: c.filename,
        relevance: c.relevance
      }));
      
      return { remaining: this.state.gradedChunks.length };
    });

    // 4. Generate Answer
    await this.addStep('Answer Generation', 'Synthesizing final response with citations', async () => {
      const context = this.state.gradedChunks.map(c => c.content).join('\n\n');
      const prompt = `Answer the following question based ONLY on the provided context. 
      Question: ${this.state.query}
      Context: ${context || "No context found. Use your general knowledge but state that you are doing so."}
      
      Provide a detailed answer with citations if possible. 
      Return JSON: { "answer": "...", "confidence": number }`;
      
      const result = await generateJSON<{ answer: string, confidence: number }>(prompt);
      this.state.answer = result.answer || (result as any).text || "I processed the information but couldn't synthesize a specific answer.";
      this.state.confidence = result.confidence || 0.5;
      return result;
    });

    return {
      answer: this.state.answer,
      sources: this.state.sources,
      steps: this.state.steps,
      confidence: this.state.confidence
    };
  }
}
