import { EventHandlerStore } from '@/interaction/event';

describe('EventHandlerStore', () => {
    let store: EventHandlerStore;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        document.body.innerHTML = '';
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        store.destroy();
        consoleSpy.mockRestore();
    });

    function createStore(logDomEvents: boolean = false): EventHandlerStore {
        return new EventHandlerStore({ logDomEvents });
    }

    async function flushMutations(): Promise<void> {
        await new Promise<void>(resolve => setTimeout(resolve, 0));
    }

    describe('DOM registration via mutations', () => {
        it('should register handler when element with ID is added to DOM', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'test-btn', handler);

            const button = document.createElement('button');
            button.id = 'test-btn';
            document.body.appendChild(button);

            await flushMutations();

            // Fire a click event to verify handler is registered
            const event = new Event('click', { bubbles: true });
            button.dispatchEvent(event);
            await flushMutations();

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(event);
        });

        it('should unregister handler when element with ID is removed from DOM', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            const button = document.createElement('button');
            button.id = 'test-btn';
            document.body.appendChild(button);

            store.collect('click', 'test-btn', handler);

            // Trigger register by re-adding (or we can just add after collect)
            // Actually, collect stores in collected. We need element to be added AFTER collect for register to trigger.
            // Let's remove and re-add
            document.body.removeChild(button);
            await flushMutations();

            // Now add back to trigger register
            document.body.appendChild(button);
            await flushMutations();

            // Remove to trigger unregister
            document.body.removeChild(button);
            await flushMutations();

            // Re-add and try to fire event - handler should not be in state anymore
            document.body.appendChild(button);
            await flushMutations();

            const event = new Event('click', { bubbles: true });
            button.dispatchEvent(event);
            await flushMutations();

            // Handler was deleted from state on unregister, so it won't be called
            expect(handler).not.toHaveBeenCalled();
        });

        it('should register handlers for nested elements with IDs when parent is added', async () => {
            store = createStore();
            const outerHandler = jest.fn().mockResolvedValue(undefined);
            const innerHandler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'outer', outerHandler);
            store.collect('click', 'inner', innerHandler);

            const outer = document.createElement('div');
            outer.id = 'outer';
            const inner = document.createElement('button');
            inner.id = 'inner';
            outer.appendChild(inner);
            document.body.appendChild(outer);

            await flushMutations();

            outer.dispatchEvent(new Event('click', { bubbles: true }));
            inner.dispatchEvent(new Event('click', { bubbles: true }));
            await flushMutations();

            expect(outerHandler).toHaveBeenCalledTimes(1);
            expect(innerHandler).toHaveBeenCalledTimes(1);
        });

        it('should unregister handlers for nested elements with IDs when parent is removed', async () => {
            store = createStore();
            const innerHandler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'inner', innerHandler);

            const outer = document.createElement('div');
            outer.id = 'outer';
            const inner = document.createElement('button');
            inner.id = 'inner';
            outer.appendChild(inner);
            document.body.appendChild(outer);
            await flushMutations();

            // Remove parent
            document.body.removeChild(outer);
            await flushMutations();

            // Re-add and try to fire
            document.body.appendChild(outer);
            await flushMutations();

            inner.dispatchEvent(new Event('click', { bubbles: true }));
            await flushMutations();

            expect(innerHandler).not.toHaveBeenCalled();
        });

        it('should not register or unregister for elements without ID', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'some-id', handler);

            const noIdElement = document.createElement('div');
            document.body.appendChild(noIdElement);
            await flushMutations();

            document.body.removeChild(noIdElement);
            await flushMutations();

            // Handler should still be in collected (not moved to state)
            // Adding the actual element later should still work
            const realElement = document.createElement('div');
            realElement.id = 'some-id';
            document.body.appendChild(realElement);
            await flushMutations();

            realElement.dispatchEvent(new Event('click', { bubbles: true }));
            await flushMutations();

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should filter out empty string IDs from registration', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'valid-id', handler);

            const emptyIdElement = document.createElement('div');
            emptyIdElement.id = '';
            document.body.appendChild(emptyIdElement);
            await flushMutations();

            // Should not cause issues, handler remains in collected
            const validElement = document.createElement('div');
            validElement.id = 'valid-id';
            document.body.appendChild(validElement);
            await flushMutations();

            validElement.dispatchEvent(new Event('click', { bubbles: true }));
            await flushMutations();

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('Event proxy - stick-to-target', () => {
        it('should call stick-to-target handler when event fires on element with ID', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn', handler);

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            const event = new Event('click', { bubbles: true });
            btn.dispatchEvent(event);
            await flushMutations();

            expect(handler).toHaveBeenCalledWith(event);
        });

        it('should call stick-to-target handler via closest parent when target has no ID', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'parent', handler);

            const parent = document.createElement('div');
            parent.id = 'parent';
            const child = document.createElement('span');
            parent.appendChild(child);
            document.body.appendChild(parent);
            await flushMutations();

            const event = new Event('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: child, writable: false });
            child.dispatchEvent(event);
            await flushMutations();

            expect(handler).toHaveBeenCalledWith(event);
        });
    });

    describe('Event proxy - multilayer', () => {
        it('should call all multilayer handlers when event fires regardless of target', async () => {
            store = createStore();
            const handler1 = jest.fn().mockResolvedValue(undefined);
            const handler2 = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'target-1', handler1, { captureStrategy: 'multilayer' });
            store.collect('click', 'target-2', handler2, { captureStrategy: 'multilayer' });

            const el1 = document.createElement('div');
            el1.id = 'target-1';
            const el2 = document.createElement('div');
            el2.id = 'target-2';
            document.body.appendChild(el1);
            document.body.appendChild(el2);
            await flushMutations();

            const event = new Event('click', { bubbles: true });
            el1.dispatchEvent(event);
            await flushMutations();

            expect(handler1).toHaveBeenCalledWith(event);
            expect(handler2).toHaveBeenCalledWith(event);
        });

        it('should call multilayer handlers even when event target is unrelated', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'registered', handler, { captureStrategy: 'multilayer' });

            const registered = document.createElement('div');
            registered.id = 'registered';
            const other = document.createElement('div');
            other.id = 'other';
            document.body.appendChild(registered);
            document.body.appendChild(other);
            await flushMutations();

            const event = new Event('click', { bubbles: true });
            other.dispatchEvent(event);
            await flushMutations();

            expect(handler).toHaveBeenCalledWith(event);
        });
    });

    describe('collect - strict-single mode', () => {
        it('should throw error in strict-single mode when duplicate handler is collected', () => {
            store = createStore();
            const handler1 = jest.fn().mockResolvedValue(undefined);
            const handler2 = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn', handler1, { mode: 'strict-single' });

            expect(() => {
                store.collect('click', 'btn', handler2, { mode: 'strict-single' });
            }).toThrow(/already collected/);
        });

        it('should throw error in default (strict-single) mode when duplicate handler is collected', () => {
            store = createStore();
            const handler1 = jest.fn().mockResolvedValue(undefined);
            const handler2 = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn', handler1);

            expect(() => {
                store.collect('click', 'btn', handler2);
            }).toThrow(/already collected/);
        });
    });

    describe('collect - override-last mode', () => {
        it('should silently override in override-last mode when duplicate handler is collected', async () => {
            store = createStore();
            const handler1 = jest.fn().mockResolvedValue(undefined);
            const handler2 = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn', handler1, { mode: 'override-last' });
            store.collect('click', 'btn', handler2, { mode: 'override-last' });

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            btn.dispatchEvent(new Event('click', { bubbles: true }));
            await flushMutations();

            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    describe('collect - multiple event types', () => {
        it('should collect handlers for multiple event types when array is passed', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect(['click', 'focus', 'blur'], 'btn', handler);

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            btn.dispatchEvent(new Event('click', { bubbles: true }));
            btn.dispatchEvent(new Event('focus', { bubbles: true }));
            btn.dispatchEvent(new Event('blur', { bubbles: true }));
            await flushMutations();

            expect(handler).toHaveBeenCalledTimes(3);
        });
    });

    describe('DOM event listener registration', () => {
        it('should add DOM event listener to document on first registration of event type', async () => {
            store = createStore();
            const addListenerSpy = jest.spyOn(document, 'addEventListener');
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn', handler);

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            expect(addListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            addListenerSpy.mockRestore();
        });

        it('should not duplicate DOM event listener when event type already has one', async () => {
            store = createStore();
            const addListenerSpy = jest.spyOn(document, 'addEventListener');
            const handler1 = jest.fn().mockResolvedValue(undefined);
            const handler2 = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn1', handler1);
            store.collect('click', 'btn2', handler2);

            const btn1 = document.createElement('button');
            btn1.id = 'btn1';
            const btn2 = document.createElement('button');
            btn2.id = 'btn2';
            document.body.appendChild(btn1);
            await flushMutations();
            document.body.appendChild(btn2);
            await flushMutations();

            const clickCalls = addListenerSpy.mock.calls.filter(
                ([event]) => event === 'click'
            );
            expect(clickCalls).toHaveLength(1);
            addListenerSpy.mockRestore();
        });
    });

    describe('Handler lifecycle', () => {
        it('should move handler from collected to state on register', async () => {
            store = createStore();
            const handler = jest.fn().mockResolvedValue(undefined);

            store.collect('click', 'btn', handler);

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            // Handler should now be in state, not collected
            // We can verify by removing and re-adding - handler should NOT be re-registered
            document.body.removeChild(btn);
            await flushMutations();

            document.body.appendChild(btn);
            await flushMutations();

            btn.dispatchEvent(new Event('click', { bubbles: true }));
            await flushMutations();

            // Handler was moved to state on first add, then deleted on remove
            // On second add, collected no longer has it
            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('Logging', () => {
        it('should log mutations when logDomEvents is true', async () => {
            store = createStore(true);

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            expect(consoleSpy).toHaveBeenCalled();
            const logCalls = consoleSpy.mock.calls.map(([msg]) => msg);
            expect(logCalls.some((msg: string) => msg.includes('Mutation'))).toBe(true);
        });

        it('should not log mutations when logDomEvents is false', async () => {
            store = createStore(false);

            const btn = document.createElement('button');
            btn.id = 'btn';
            document.body.appendChild(btn);
            await flushMutations();

            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });
});