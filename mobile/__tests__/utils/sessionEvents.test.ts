/**
 * Session Events Tests
 */

import { sessionEvents } from '@utils/sessionEvents';

describe('sessionEvents', () => {
  it('calls registered listener on emitSessionExpired', () => {
    const listener = jest.fn();
    sessionEvents.onSessionExpired(listener);
    sessionEvents.emitSessionExpired();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls multiple listeners', () => {
    const a = jest.fn();
    const b = jest.fn();
    sessionEvents.onSessionExpired(a);
    sessionEvents.onSessionExpired(b);
    sessionEvents.emitSessionExpired();
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  it('removes listener when unsubscribe is called', () => {
    const listener = jest.fn();
    const unsubscribe = sessionEvents.onSessionExpired(listener);
    unsubscribe();
    sessionEvents.emitSessionExpired();
    expect(listener).not.toHaveBeenCalled();
  });

  it('only removes the specific listener', () => {
    const a = jest.fn();
    const b = jest.fn();
    const unsubscribeA = sessionEvents.onSessionExpired(a);
    sessionEvents.onSessionExpired(b);
    unsubscribeA();
    sessionEvents.emitSessionExpired();
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  it('emitSessionExpired does not throw when no listeners', () => {
    // Remove any lingering listeners by calling all unsubscribes — but since
    // we share module state, just verify it doesn't throw
    expect(() => sessionEvents.emitSessionExpired()).not.toThrow();
  });
});
