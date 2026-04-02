import { create } from 'zustand';
import { AIChatMessage, AIProviderType, AIProvider, AIToolCall } from '../../shared/types';

interface AIState {
  providers: AIProvider[];
  selectedProvider: AIProviderType;
  selectedModel: string;
  messages: AIChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  pendingToolCalls: AIToolCall[];
  hasApiKey: Record<string, boolean>;

  loadProviders: () => Promise<void>;
  setProvider: (provider: AIProviderType) => void;
  setModel: (model: string) => void;
  setApiKey: (provider: AIProviderType, key: string) => Promise<void>;
  checkApiKey: (provider: AIProviderType) => Promise<boolean>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (msg: AIChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamContent: (content: string) => void;
  clearStreamContent: () => void;
  clearMessages: () => void;
  approveToolCall: (id: string) => void;
  rejectToolCall: (id: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  providers: [],
  selectedProvider: 'claude',
  selectedModel: 'claude-sonnet-4-20250514',
  messages: [],
  isStreaming: false,
  streamingContent: '',
  pendingToolCalls: [],
  hasApiKey: {},

  loadProviders: async () => {
    const providers = await window.crucible.ai.listProviders();
    set({ providers });

    // Check which keys exist
    const hasApiKey: Record<string, boolean> = {};
    for (const p of providers) {
      hasApiKey[p.id] = await window.crucible.keystore.hasKey(`apiKey:${p.id}`);
    }
    set({ hasApiKey });
  },

  setProvider: (provider) => {
    const { providers } = get();
    const p = providers.find(pr => pr.id === provider);
    set({
      selectedProvider: provider,
      selectedModel: p?.models[0]?.id || '',
    });
  },

  setModel: (model) => set({ selectedModel: model }),

  setApiKey: async (provider, key) => {
    await window.crucible.keystore.setKey(`apiKey:${provider}`, key);
    set(state => ({ hasApiKey: { ...state.hasApiKey, [provider]: true } }));
  },

  checkApiKey: async (provider) => {
    const has = await window.crucible.keystore.hasKey(`apiKey:${provider}`);
    set(state => ({ hasApiKey: { ...state.hasApiKey, [provider]: has } }));
    return has;
  },

  sendMessage: async (content) => {
    const { selectedProvider, selectedModel, messages } = get();

    const userMsg: AIChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
      provider: selectedProvider,
    };

    set(state => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingContent: '',
    }));

    await window.crucible.ai.chat({
      provider: selectedProvider,
      model: selectedModel,
      messages: [...messages, userMsg],
      tools: true,
    });
  },

  addMessage: (msg) => set(state => ({ messages: [...state.messages, msg] })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  appendStreamContent: (content) =>
    set(state => ({ streamingContent: state.streamingContent + content })),

  clearStreamContent: () => set({ streamingContent: '' }),

  clearMessages: () => set({ messages: [], streamingContent: '' }),

  approveToolCall: (id) => {
    window.crucible.ai.approveToolCall(id);
    set(state => ({
      pendingToolCalls: state.pendingToolCalls.filter(t => t.id !== id),
    }));
  },

  rejectToolCall: (id) => {
    window.crucible.ai.rejectToolCall(id);
    set(state => ({
      pendingToolCalls: state.pendingToolCalls.filter(t => t.id !== id),
    }));
  },
}));
