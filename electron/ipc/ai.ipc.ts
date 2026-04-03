import { BrowserWindow, ipcMain } from 'electron';
import { AI_CHANNELS } from '../../shared/ipcChannels';
import { AIChatRequest, AIProvider, AIStreamChunk } from '../../shared/types';
import { SecureStore } from '../services/SecureStore';

const secureStore = new SecureStore();

const PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000, supportsVision: true, supportsFunctionCalling: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 128000, supportsVision: true, supportsFunctionCalling: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000, supportsVision: true, supportsFunctionCalling: true },
    ],
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    models: [
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', maxTokens: 200000, supportsVision: true, supportsFunctionCalling: true },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', maxTokens: 200000, supportsVision: true, supportsFunctionCalling: true },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', maxTokens: 200000, supportsVision: true, supportsFunctionCalling: true },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxTokens: 1048576, supportsVision: true, supportsFunctionCalling: true },
      { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', maxTokens: 1048576, supportsVision: true, supportsFunctionCalling: true },
    ],
  },
];

let activeAbortController: AbortController | null = null;

export function registerAiHandlers(window: BrowserWindow) {
  ipcMain.handle(AI_CHANNELS.LIST_PROVIDERS, async (): Promise<AIProvider[]> => {
    return PROVIDERS;
  });

  ipcMain.handle(AI_CHANNELS.CHAT, async (_event, request: AIChatRequest): Promise<void> => {
    const apiKey = secureStore.get(`apiKey:${request.provider}`);
    if (!apiKey) {
      window.webContents.send(AI_CHANNELS.CHAT_ERROR, { error: `No API key configured for ${request.provider}` });
      return;
    }

    const provider = PROVIDERS.find(p => p.id === request.provider);
    if (!provider) {
      window.webContents.send(AI_CHANNELS.CHAT_ERROR, { error: `Unknown provider: ${request.provider}` });
      return;
    }

    const model = provider.models.find(m => m.id === request.model);
    if (!model) {
      window.webContents.send(AI_CHANNELS.CHAT_ERROR, { error: `Model not found: ${request.model}` });
      return;
    }

    activeAbortController = new AbortController();
    const { signal } = activeAbortController;

    try {
      switch (request.provider) {
        case 'openai':
          await streamOpenAI(window, request, apiKey, signal);
          break;
        case 'claude':
          await streamClaude(window, request, apiKey, signal);
          break;
        case 'gemini':
          await streamGemini(window, request, apiKey, signal);
          break;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        window.webContents.send(AI_CHANNELS.CHAT_ERROR, { error: err.message || 'AI request failed' });
      }
    } finally {
      activeAbortController = null;
    }
  });

  ipcMain.on(AI_CHANNELS.CANCEL, () => {
    activeAbortController?.abort();
  });
}

async function streamOpenAI(window: BrowserWindow, request: AIChatRequest, apiKey: string, signal: AbortSignal) {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey });

  const messages = request.messages.map(m => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  const stream = await client.chat.completions.create({
    model: request.model,
    messages,
    stream: true,
  }, { signal });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      window.webContents.send(AI_CHANNELS.CHAT_STREAM, { type: 'text', content } as AIStreamChunk);
    }
  }

  window.webContents.send(AI_CHANNELS.CHAT_DONE);
}

async function streamClaude(window: BrowserWindow, request: AIChatRequest, apiKey: string, signal: AbortSignal) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const messages = request.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const systemMsg = request.messages.find(m => m.role === 'system');

  const stream = client.messages.stream({
    model: request.model,
    max_tokens: 4096,
    system: systemMsg?.content || 'You are a helpful coding assistant inside Crucible IDE.',
    messages,
  }, { signal });

  stream.on('text', (text) => {
    window.webContents.send(AI_CHANNELS.CHAT_STREAM, { type: 'text', content: text } as AIStreamChunk);
  });

  await stream.finalMessage();
  window.webContents.send(AI_CHANNELS.CHAT_DONE);
}

async function streamGemini(window: BrowserWindow, request: AIChatRequest, apiKey: string, _signal: AbortSignal) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: request.model });

  const history = request.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const lastMessage = history.pop();
  if (!lastMessage) return;

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.parts[0].text);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      window.webContents.send(AI_CHANNELS.CHAT_STREAM, { type: 'text', content: text } as AIStreamChunk);
    }
  }

  window.webContents.send(AI_CHANNELS.CHAT_DONE);
}
