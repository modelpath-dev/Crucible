import { AIChatMessage, AIStreamChunk, AIContext } from '../../../shared/types';

export interface AIProviderInterface {
  id: string;
  name: string;

  sendMessage(
    messages: AIChatMessage[],
    context: AIContext | undefined,
    onChunk: (chunk: AIStreamChunk) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ): void;

  cancel(): void;
}
