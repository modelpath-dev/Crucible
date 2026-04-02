import { AIStreamChunk, AIChatMessage } from '../../../shared/types';
import { useAIStore } from '../../stores/useAIStore';

export class StreamHandler {
  private cleanups: (() => void)[] = [];

  setup(): void {
    const unsubStream = window.crucible.ai.onStream((chunk: AIStreamChunk) => {
      const store = useAIStore.getState();
      if (chunk.type === 'text' && chunk.content) {
        store.appendStreamContent(chunk.content);
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

    const unsubError = window.crucible.ai.onError((err: { error: string }) => {
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

    this.cleanups = [unsubStream, unsubDone, unsubError];
  }

  teardown(): void {
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
  }
}
