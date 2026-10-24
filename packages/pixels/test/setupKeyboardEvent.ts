// jsdom rejects the Window proxy when React Aria clones native keyboard events
// copy keyboard init fields without view, browser tests retain the native constructor
const NativeKeyboardEvent = globalThis.KeyboardEvent;

if (NativeKeyboardEvent !== undefined) {
  try {
    const probe = new NativeKeyboardEvent('keydown', {
      key: 'ArrowRight',
      view: globalThis.window,
    });
    const clone = new NativeKeyboardEvent('keydown', probe);
    if (clone.key !== probe.key) {
      throw new Error('KeyboardEvent cloning lost its key');
    }
  } catch {
    class KeyboardEventWithSafeView extends NativeKeyboardEvent {
      constructor(type: string, init: KeyboardEventInit = {}) {
        super(type, {
          altKey: init.altKey,
          bubbles: init.bubbles,
          cancelable: init.cancelable,
          charCode: init.charCode,
          code: init.code,
          composed: init.composed,
          ctrlKey: init.ctrlKey,
          detail: init.detail,
          isComposing: init.isComposing,
          key: init.key,
          keyCode: init.keyCode,
          location: init.location,
          metaKey: init.metaKey,
          repeat: init.repeat,
          shiftKey: init.shiftKey,
        });
      }
    }

    Object.defineProperty(globalThis, 'KeyboardEvent', {
      configurable: true,
      value: KeyboardEventWithSafeView,
      writable: true,
    });
  }
}

export {};
