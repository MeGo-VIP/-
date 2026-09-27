// core/eventBus.js — tiny pub/sub used across all Anatomy modules.
// Kept dependency-free so any module (including future phases) can import it
// without pulling in Three.js.

export class EventBus {
  constructor() {
    this._events = new Map();
  }

  on(name, handler) {
    if (!this._events.has(name)) this._events.set(name, new Set());
    this._events.get(name).add(handler);
    return () => this.off(name, handler); // convenience unsubscribe
  }

  off(name, handler) {
    const set = this._events.get(name);
    if (set) set.delete(handler);
  }

  emit(name, payload) {
    const set = this._events.get(name);
    if (!set) return;
    // copy to array so a handler can unsubscribe itself mid-emit safely
    Array.from(set).forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[Anatomy:eventBus] handler for "${name}" threw:`, err);
      }
    });
  }

  clear() {
    this._events.clear();
  }
}

// One shared bus for the whole Anatomy system (Phase 1 scope).
export const anatomyBus = new EventBus();
