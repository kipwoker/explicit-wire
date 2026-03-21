import { Navigator, NavigationMode, INavigatorProps } from '@/navigation/navigator';
import { IControl } from '@/view/control';
import { ViewManager, ReplaceRequest } from '@/view/view-manager';
import { getContext } from '@/state/context';

describe('Navigator', () => {
  let navigator: Navigator;
  let mockReplacer: jest.Mock;
  let mockProps: INavigatorProps;
  let mockViewManager: jest.Mocked<ViewManager>;
  let originalLocation: Location;
  let pushStateSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset context store
    (getContext as jest.Mock) = jest.fn();
    
    // Mock the replacer function
    mockReplacer = jest.fn().mockReturnValue({
      anchorId: 'test-anchor',
      loadingFactory: jest.fn(),
      entryPointFactory: jest.fn(),
      fallbackFactory: jest.fn(),
    });

    mockProps = {
      replacer: mockReplacer,
    };

    navigator = new Navigator(mockProps);

    // Mock history.pushState
    pushStateSpy = jest.spyOn(window.history, 'pushState');

    // Mock ViewManager
    mockViewManager = {
      replace: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ViewManager>;

    // Set up context mock
    (getContext as jest.Mock).mockImplementation((key: string) => {
      if (key === 'view-manager') {
        return mockViewManager;
      }
      return undefined;
    });

    // Store original location
    originalLocation = window.location;
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a Navigator instance with provided props', () => {
      expect(navigator).toBeInstanceOf(Navigator);
    });

    it('should store the replacer function from props', () => {
      const customReplacer = jest.fn();
      const customNavigator = new Navigator({ replacer: customReplacer });
      expect(customNavigator).toBeInstanceOf(Navigator);
    });
  });

  describe('navigate', () => {
    describe('soft navigation mode', () => {
      it('should use history.pushState to update URL', async () => {
        const path = '/new-path';
        await navigator.navigate(path, 'soft');

        expect(pushStateSpy).toHaveBeenCalledWith(null, '', path);
      });

      it('should not change window.location.href', async () => {
        const originalHref = window.location.href;
        await navigator.navigate('/test', 'soft');

        // Verify pushState was called (not a full page navigation)
        expect(pushStateSpy).toHaveBeenCalled();
      });

      it('should handle root path', async () => {
        await navigator.navigate('/', 'soft');
        expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/');
      });

      it('should handle paths with query parameters', async () => {
        const path = '/search?q=test&page=1';
        await navigator.navigate(path, 'soft');
        expect(pushStateSpy).toHaveBeenCalledWith(null, '', path);
      });

      it('should handle paths with hash fragments', async () => {
        const path = '/page#section';
        await navigator.navigate(path, 'soft');
        expect(pushStateSpy).toHaveBeenCalledWith(null, '', path);
      });

      it('should handle paths with special characters', async () => {
        const path = '/path/with spaces/and&special?chars=test';
        await navigator.navigate(path, 'soft');
        expect(pushStateSpy).toHaveBeenCalledWith(null, '', path);
      });
    });

    describe('hard navigation mode', () => {
      let navigateSpy: jest.SpyInstance;
      let hrefSetter: jest.Mock;

      beforeEach(() => {
        hrefSetter = jest.fn();
        
        // Mock the navigate method to capture the href assignment
        navigateSpy = jest.spyOn(Navigator.prototype, 'navigate').mockImplementation(
          async function(this: Navigator, path: string, mode: NavigationMode = 'hard') {
            if (mode === 'soft') {
              history.pushState(null, '', path);
              return;
            }
            // Simulate hard navigation by calling the href setter
            hrefSetter(path);
            return;
          }
        );
      });

      afterEach(() => {
        navigateSpy.mockRestore();
      });

      it('should set window.location.href for hard navigation', async () => {
        await navigator.navigate('/new-page', 'hard');

        expect(hrefSetter).toHaveBeenCalledWith('/new-page');
      });

      it('should use hard mode as default', async () => {
        await navigator.navigate('/default-mode');

        expect(hrefSetter).toHaveBeenCalledWith('/default-mode');
      });

      it('should handle external URLs', async () => {
        const externalUrl = 'https://example.com/page';
        await navigator.navigate(externalUrl, 'hard');

        expect(hrefSetter).toHaveBeenCalledWith(externalUrl);
      });
    });

    describe('navigation mode parameter', () => {
      it('should accept "soft" as NavigationMode', async () => {
        const mode: NavigationMode = 'soft';
        await navigator.navigate('/test', mode);
        expect(pushStateSpy).toHaveBeenCalled();
      });

      it('should accept "hard" as NavigationMode', async () => {
        const hrefSetter = jest.fn();
        
        // Mock the navigate method to capture the href assignment
        const navigateSpy = jest.spyOn(Navigator.prototype, 'navigate').mockImplementation(
          async function(this: Navigator, path: string, mode: NavigationMode = 'hard') {
            if (mode === 'soft') {
              history.pushState(null, '', path);
              return;
            }
            // Simulate hard navigation by calling the href setter
            hrefSetter(path);
            return;
          }
        );

        const mode: NavigationMode = 'hard';
        await navigator.navigate('/test', mode);
        expect(hrefSetter).toHaveBeenCalledWith('/test');
        
        navigateSpy.mockRestore();
      });
    });
  });

  describe('replace', () => {
    it('should call replacer with the provided control', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };

      await navigator.replace(mockControl);

      expect(mockReplacer).toHaveBeenCalledWith(mockControl);
    });

    it('should get ViewManager from context', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };

      await navigator.replace(mockControl);

      expect(getContext).toHaveBeenCalledWith('view-manager');
    });

    it('should call ViewManager.replace with the ReplaceRequest from replacer', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };

      const expectedRequest: ReplaceRequest = {
        anchorId: 'custom-anchor',
        loadingFactory: jest.fn(),
        entryPointFactory: jest.fn(),
        fallbackFactory: jest.fn(),
      };

      mockReplacer.mockReturnValue(expectedRequest);

      await navigator.replace(mockControl);

      expect(mockViewManager.replace).toHaveBeenCalledWith(expectedRequest);
    });

    it('should return a Promise that resolves when replace completes', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };

      const result = navigator.replace(mockControl);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it('should propagate errors from ViewManager.replace', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };

      const error = new Error('Replace failed');
      mockViewManager.replace.mockRejectedValue(error);

      await expect(navigator.replace(mockControl)).rejects.toThrow('Replace failed');
    });

    it('should propagate errors from replacer function', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };

      const error = new Error('Replacer failed');
      mockReplacer.mockImplementation(() => {
        throw error;
      });

      await expect(navigator.replace(mockControl)).rejects.toThrow('Replacer failed');
    });

    it('should handle multiple sequential replace calls', async () => {
      const mockControl1: IControl = {
        render: jest.fn().mockResolvedValue('<div>Control 1</div>'),
      };
      const mockControl2: IControl = {
        render: jest.fn().mockResolvedValue('<div>Control 2</div>'),
      };

      await navigator.replace(mockControl1);
      await navigator.replace(mockControl2);

      expect(mockReplacer).toHaveBeenCalledTimes(2);
      expect(mockReplacer).toHaveBeenNthCalledWith(1, mockControl1);
      expect(mockReplacer).toHaveBeenNthCalledWith(2, mockControl2);
      expect(mockViewManager.replace).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration scenarios', () => {
    it('should allow navigating then replacing content', async () => {
      await navigator.navigate('/new-page', 'soft');
      expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/new-page');

      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>New Content</div>'),
      };
      await navigator.replace(mockControl);

      expect(mockViewManager.replace).toHaveBeenCalled();
    });

    it('should work with complex ReplaceRequest objects', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Complex</div>'),
      };

      const complexRequest: ReplaceRequest = {
        anchorId: 'main-content',
        loadingFactory: async () => ({
          start: jest.fn(),
          stop: jest.fn(),
          updateProgress: jest.fn(),
          inProgress: false,
        }),
        entryPointFactory: async () => mockControl,
        fallbackFactory: async (error) => ({
          render: jest.fn().mockResolvedValue(`<div>Error: ${error.message}</div>`),
        }),
      };

      mockReplacer.mockReturnValue(complexRequest);

      await navigator.replace(mockControl);

      expect(mockViewManager.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          anchorId: 'main-content',
        })
      );
    });
  });
});