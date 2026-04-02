import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAIStore } from '../../stores/useAIStore';
import { AIChatMessage } from '../../../shared/types';

function ChatMessage({ msg }: { msg: AIChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`px-3 py-2 ${isUser ? 'bg-crucible-hover/30' : ''}`}>
      <div className="text-[11px] font-medium text-crucible-text-secondary mb-1">
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="text-sm text-crucible-text whitespace-pre-wrap break-words">
        {msg.content}
      </div>
    </div>
  );
}

export function AIPanel() {
  const {
    providers, selectedProvider, selectedModel, messages, isStreaming, streamingContent,
    hasApiKey, loadProviders, setProvider, setModel, setApiKey, sendMessage, clearMessages,
  } = useAIStore();
  const [input, setInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadProviders(); }, [loadProviders]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Set up stream listeners
  useEffect(() => {
    const unsubStream = window.crucible.ai.onStream((chunk: any) => {
      if (chunk.type === 'text' && chunk.content) {
        useAIStore.getState().appendStreamContent(chunk.content);
      }
    });

    const unsubDone = window.crucible.ai.onDone(() => {
      const store = useAIStore.getState();
      if (store.streamingContent) {
        store.addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: store.streamingContent,
          timestamp: Date.now(),
          provider: store.selectedProvider,
          model: store.selectedModel,
        });
        store.clearStreamContent();
      }
      store.setStreaming(false);
    });

    const unsubError = window.crucible.ai.onError((err: any) => {
      const store = useAIStore.getState();
      store.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.error || 'Unknown error'}`,
        timestamp: Date.now(),
      });
      store.clearStreamContent();
      store.setStreaming(false);
    });

    return () => { unsubStream(); unsubDone(); unsubError(); };
  }, []);

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    await sendMessage(msg);
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSaveKey = useCallback(async () => {
    if (keyInput.trim()) {
      await setApiKey(selectedProvider, keyInput.trim());
      setKeyInput('');
      setShowKeyInput(false);
    }
  }, [keyInput, selectedProvider, setApiKey]);

  const currentProvider = providers.find(p => p.id === selectedProvider);

  return (
    <div className="flex flex-col h-full">
      {/* Provider selector */}
      <div className="p-2 space-y-2 border-b border-crucible-border">
        <div className="flex gap-2">
          <select
            value={selectedProvider}
            onChange={e => setProvider(e.target.value as any)}
            className="flex-1 px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text"
          >
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={selectedModel}
            onChange={e => setModel(e.target.value)}
            className="flex-1 px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text"
          >
            {currentProvider?.models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {!hasApiKey[selectedProvider] && (
          <div className="text-xs text-yellow-400">
            No API key set.{' '}
            <button onClick={() => setShowKeyInput(true)} className="underline hover:text-yellow-300">
              Add key
            </button>
          </div>
        )}

        {showKeyInput && (
          <div className="flex gap-1">
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder={`${selectedProvider} API key`}
              className="flex-1 px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text"
            />
            <button onClick={handleSaveKey} className="px-2 py-1 bg-crucible-accent text-white rounded text-xs">
              Save
            </button>
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto">
        {messages.length === 0 && !streamingContent && (
          <div className="p-4 text-center text-xs text-crucible-text-secondary">
            <p className="mb-2">Ask me anything about your code!</p>
            <p className="opacity-50">I can read files, write code, run commands, and search your codebase.</p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {streamingContent && (
          <div className="px-3 py-2">
            <div className="text-[11px] font-medium text-crucible-text-secondary mb-1">AI</div>
            <div className="text-sm text-crucible-text whitespace-pre-wrap">{streamingContent}</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-crucible-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code... (Enter to send)"
            rows={2}
            className="flex-1 px-2 py-1.5 bg-crucible-editor border border-crucible-border rounded text-sm text-crucible-text placeholder-crucible-text-secondary/50 focus:outline-none focus:border-crucible-accent resize-none"
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <button
            onClick={clearMessages}
            className="text-[11px] text-crucible-text-secondary hover:text-crucible-text"
          >
            Clear chat
          </button>
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-3 py-1 bg-crucible-accent text-white rounded text-xs disabled:opacity-50"
          >
            {isStreaming ? 'Generating...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
