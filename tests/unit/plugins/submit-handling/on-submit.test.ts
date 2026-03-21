import { onSubmit } from '@/plugins/submit-handling/on-submit';
import { on } from '@/interaction/event';
import { ILoading } from '@/interaction/loading';

jest.mock('@/interaction/event', () => ({
    on: jest.fn(),
}));

describe('onSubmit', () => {
    let mockLoading: ILoading;
    let capturedHandler: (event: Event) => Promise<void>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockLoading = {
            start: jest.fn().mockResolvedValue(undefined),
            stop: jest.fn().mockResolvedValue(undefined),
            updateProgress: jest.fn().mockResolvedValue(undefined),
            inProgress: false,
        };

        (on as jest.Mock).mockImplementation(
            (_eventType: string, _targetId: string, handler: (event: Event) => Promise<void>) => {
                capturedHandler = handler;
            }
        );
    });

    describe('on function registration', () => {
        it('should call on with submit event type and formId', () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            expect(on).toHaveBeenCalledTimes(1);
            expect(on).toHaveBeenCalledWith('submit', 'my-form', expect.any(Function));
        });

        it('should register handler for different form IDs', () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('form-a', mockLoading, action);
            onSubmit('form-b', mockLoading, action);

            expect(on).toHaveBeenCalledTimes(2);
            expect(on).toHaveBeenNthCalledWith(1, 'submit', 'form-a', expect.any(Function));
            expect(on).toHaveBeenNthCalledWith(2, 'submit', 'form-b', expect.any(Function));
        });
    });

    describe('handler - early returns', () => {
        it('should return early if event has no target', async () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            const event = {
                target: null,
                defaultPrevented: false,
                preventDefault: jest.fn(),
            } as unknown as Event;

            await capturedHandler(event);

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
            expect(mockLoading.start).not.toHaveBeenCalled();
        });

        it('should return early if defaultPrevented is true', async () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const event = {
                target: form,
                defaultPrevented: true,
                preventDefault: jest.fn(),
            } as unknown as Event;

            await capturedHandler(event);

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(action).not.toHaveBeenCalled();
            expect(mockLoading.start).not.toHaveBeenCalled();
        });
    });

    describe('handler - form submission', () => {
        function createSubmitEvent(form: HTMLFormElement): Event {
            const event = new Event('submit');
            Object.defineProperty(event, 'target', { value: form, writable: false });
            return event;
        }

        it('should call preventDefault on the event', async () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const event = createSubmitEvent(form);
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            await capturedHandler(event);

            expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
        });

        it('should call loading.start before action', async () => {
            const callOrder: string[] = [];
            const action = jest.fn().mockImplementation(async () => {
                callOrder.push('action');
            });
            (mockLoading.start as jest.Mock).mockImplementation(async () => {
                callOrder.push('start');
            });

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const event = createSubmitEvent(form);

            await capturedHandler(event);

            expect(callOrder).toEqual(['start', 'action']);
        });

        it('should call loading.stop after action completes', async () => {
            const callOrder: string[] = [];
            const action = jest.fn().mockImplementation(async () => {
                callOrder.push('action');
            });
            (mockLoading.stop as jest.Mock).mockImplementation(async () => {
                callOrder.push('stop');
            });

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const event = createSubmitEvent(form);

            await capturedHandler(event);

            expect(callOrder).toEqual(['action', 'stop']);
        });

        it('should call loading.stop even if action throws', async () => {
            const action = jest.fn().mockRejectedValue(new Error('Action failed'));

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const event = createSubmitEvent(form);

            await expect(capturedHandler(event)).rejects.toThrow('Action failed');

            expect(mockLoading.start).toHaveBeenCalledTimes(1);
            expect(mockLoading.stop).toHaveBeenCalledTimes(1);
        });

        it('should pass form data to action', async () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const nameInput = document.createElement('input');
            nameInput.name = 'username';
            nameInput.value = 'testuser';
            form.appendChild(nameInput);

            const emailInput = document.createElement('input');
            emailInput.name = 'email';
            emailInput.value = 'test@example.com';
            form.appendChild(emailInput);

            const event = createSubmitEvent(form);

            await capturedHandler(event);

            expect(action).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
            });
        });

        it('should extract checkbox values as booleans', async () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'agree';
            checkbox.checked = true;
            form.appendChild(checkbox);

            const uncheckedBox = document.createElement('input');
            uncheckedBox.type = 'checkbox';
            uncheckedBox.name = 'newsletter';
            uncheckedBox.checked = false;
            form.appendChild(uncheckedBox);

            const event = createSubmitEvent(form);

            await capturedHandler(event);

            expect(action).toHaveBeenCalledWith({
                agree: true,
                newsletter: false,
            });
        });

        it('should ignore form elements without a name attribute', async () => {
            const action = jest.fn().mockResolvedValue(undefined);

            onSubmit('my-form', mockLoading, action);

            const form = document.createElement('form');
            const namedInput = document.createElement('input');
            namedInput.name = 'field1';
            namedInput.value = 'value1';
            form.appendChild(namedInput);

            const unnamedInput = document.createElement('input');
            unnamedInput.value = 'value2';
            form.appendChild(unnamedInput);

            const event = createSubmitEvent(form);

            await capturedHandler(event);

            expect(action).toHaveBeenCalledWith({
                field1: 'value1',
            });
        });
    });
});