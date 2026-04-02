import type { CrucibleAPI } from '../../electron/preload';

declare global {
  interface Window {
    crucible: CrucibleAPI;
  }
}

export {};
