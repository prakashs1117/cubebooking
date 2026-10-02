/**
 * Session event emitter
 * Allows the API client (outside of React) to signal session expiry to the AuthContext.
 */

type SessionEventListener = () => void;

const listeners: SessionEventListener[] = [];

export const sessionEvents = {
  onSessionExpired(listener: SessionEventListener): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  emitSessionExpired() {
    listeners.forEach(fn => fn());
  },
};
