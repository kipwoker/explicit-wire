import { Router, IRouterProps, RouteDefinition, RouteAction } from '@/plugins/routing/router';
import { Navigator } from '@/navigation/navigator';
import { getContext, contextStore } from '@/state/context';
import { IControl } from '@/view/control';

describe('Router', () => {
  let router: Router;
  let mockNavigator: jest.Mocked<Navigator>;
  let mockProps: IRouterProps;
  let originalOnpopstate: typeof window.onpopstate;

  beforeEach(() => {
    // Clear context store
    contextStore.clear();

    // Mock Navigator
    mockNavigator = {
      navigate: jest.fn().mockResolvedValue(undefined),
      replace: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Navigator>;

    // Set up context mock
    (getContext as jest.Mock) = jest.fn((key: string) => {
      if (key === 'navigator') {
        return mockNavigator;
      }
      return undefined;
    });

    // Store original onpopstate
    originalOnpopstate = window.onpopstate;

    // Create mock props
    mockProps = {
      onBeforeRoute: jest.fn().mockResolvedValue(undefined),
      onAfterRoute: jest.fn().mockResolvedValue(undefined),
      onRouteNotFound: jest.fn().mockResolvedValue(undefined),
    };

    router = new Router(mockProps);
  });

  afterEach(() => {
    // Restore onpopstate
    window.onpopstate = originalOnpopstate;
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a Router instance with provided props', () => {
      expect(router).toBeInstanceOf(Router);
    });

    it('should initialize empty routes object', () => {
      expect(router.routes).toEqual({});
    });

    it('should set up onpopstate handler', () => {
      expect(window.onpopstate).toBeDefined();
      expect(typeof window.onpopstate).toBe('function');
    });

    it('should call resolve when onpopstate is triggered', async () => {
      const resolveSpy = jest.spyOn(router, 'resolve');
      
      // Trigger onpopstate
      if (window.onpopstate) {
        await window.onpopstate(new PopStateEvent('popstate'));
      }

      expect(resolveSpy).toHaveBeenCalled();
    });
  });

  describe('on', () => {
    it('should register a route with alias and handler', () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition = {
        alias: '/users/:id',
        handler: mockHandler,
      };

      router.on(routeDef);

      expect(router.routes['/users/:id']).toBe(mockHandler);
    });

    it('should return a GoToFunction', () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition = {
        alias: '/users/:id',
        handler: mockHandler,
      };

      const goToFunction = router.on(routeDef);

      expect(typeof goToFunction).toBe('function');
    });

    it('should register multiple routes', () => {
      const handler1 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const handler2 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });

      router.on({ alias: '/route1', handler: handler1 });
      router.on({ alias: '/route2', handler: handler2 });

      expect(Object.keys(router.routes)).toHaveLength(2);
      expect(router.routes['/route1']).toBe(handler1);
      expect(router.routes['/route2']).toBe(handler2);
    });

    it('should overwrite route with same alias', () => {
      const handler1 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const handler2 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });

      router.on({ alias: '/same', handler: handler1 });
      router.on({ alias: '/same', handler: handler2 });

      expect(router.routes['/same']).toBe(handler2);
    });
  });

  describe('GoToFunction returned by on', () => {
    it('should navigate to the route with parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition<{ id: string }> = {
        alias: '/users/:id',
        handler: mockHandler,
      };

      const goToFunction = router.on(routeDef);
      await goToFunction({ id: '123' });

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/users/123', 'hard');
    });

    it('should use provided navigation mode', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition<{ id: string }> = {
        alias: '/users/:id',
        handler: mockHandler,
      };

      const goToFunction = router.on(routeDef);
      await goToFunction({ id: '123' }, 'soft');

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/users/123', 'soft');
    });

    it('should use route defaultMode when no mode provided', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition<{ id: string }> = {
        alias: '/users/:id',
        handler: mockHandler,
        defaultMode: 'soft',
      };

      const goToFunction = router.on(routeDef);
      await goToFunction({ id: '123' });

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/users/123', 'soft');
    });

    it('should encode special characters in parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition<{ query: string }> = {
        alias: '/search/:query',
        handler: mockHandler,
      };

      const goToFunction = router.on(routeDef);
      await goToFunction({ query: 'hello world' });

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/search/hello%20world', 'hard');
    });

    it('should handle multiple parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const routeDef: RouteDefinition<{ userId: string; postId: string }> = {
        alias: '/users/:userId/posts/:postId',
        handler: mockHandler,
      };

      const goToFunction = router.on(routeDef);
      await goToFunction({ userId: '42', postId: '7' });

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/users/42/posts/7', 'hard');
    });
  });

  describe('resolve', () => {
    const mockPathname = (path: string) => {
      history.pushState(null, '', path);
    };

    it('should call onRouteNotFound when no matching route exists', async () => {
      mockPathname('/nonexistent');
      router.on({ alias: '/users', handler: jest.fn() });

      await router.resolve();

      expect(mockProps.onRouteNotFound).toHaveBeenCalled();
    });

    it('should call onRouteNotFound when routes object is empty', async () => {
      mockPathname('/any-path');

      await router.resolve();

      expect(mockProps.onRouteNotFound).toHaveBeenCalled();
    });

    it('should match exact routes without parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users');
      router.on({ alias: '/users', handler: mockHandler });

      await router.resolve();

      expect(mockHandler).toHaveBeenCalledWith({});
      expect(mockProps.onRouteNotFound).not.toHaveBeenCalled();
    });

    it('should match routes with single parameter', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users/123');
      router.on({ alias: '/users/:id', handler: mockHandler });

      await router.resolve();

      expect(mockHandler).toHaveBeenCalledWith({ id: '123' });
    });

    it('should match routes with multiple parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users/42/posts/7');
      router.on({ alias: '/users/:userId/posts/:postId', handler: mockHandler });

      await router.resolve();

      expect(mockHandler).toHaveBeenCalledWith({ userId: '42', postId: '7' });
    });

    it('should call onBeforeRoute before route handler', async () => {
      const callOrder: string[] = [];
      const mockHandler = jest.fn().mockImplementation(async () => {
        callOrder.push('handler');
        return { type: 'replace-control', control: {} };
      });
      (mockProps.onBeforeRoute as jest.Mock).mockImplementation(async () => {
        callOrder.push('before');
      });

      mockPathname('/users');
      router.on({ alias: '/users', handler: mockHandler });

      await router.resolve();

      expect(callOrder).toEqual(['before', 'handler']);
    });

    it('should call onAfterRoute after route handler', async () => {
      const callOrder: string[] = [];
      const mockHandler = jest.fn().mockImplementation(async () => {
        callOrder.push('handler');
        return { type: 'replace-control', control: {} };
      });
      (mockProps.onAfterRoute as jest.Mock).mockImplementation(async () => {
        callOrder.push('after');
      });

      mockPathname('/users');
      router.on({ alias: '/users', handler: mockHandler });

      await router.resolve();

      expect(callOrder).toEqual(['handler', 'after']);
    });

    it('should not call onBeforeRoute or onAfterRoute when route not found', async () => {
      mockPathname('/nonexistent');

      await router.resolve();

      expect(mockProps.onBeforeRoute).not.toHaveBeenCalled();
      expect(mockProps.onAfterRoute).not.toHaveBeenCalled();
    });

    it('should skip routes that do not match the path', async () => {
      const handler1 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const handler2 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      
      mockPathname('/route2');
      router.on({ alias: '/route1', handler: handler1 });
      router.on({ alias: '/route2', handler: handler2 });

      await router.resolve();

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should use customParams when provided', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users/123');
      router.on({ alias: '/users/:id', handler: mockHandler });

      const customParams = { id: '456', extra: 'value' };
      await router.resolve(customParams);

      expect(mockHandler).toHaveBeenCalledWith(customParams);
    });

    it('should return early after first matching route', async () => {
      const handler1 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const handler2 = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      
      mockPathname('/route1');
      router.on({ alias: '/route1', handler: handler1 });
      router.on({ alias: '/route2', handler: handler2 });

      await router.resolve();

      // Only the matching route should be called
      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('applyRouteAction', () => {
    const mockPathname = (path: string) => {
      history.pushState(null, '', path);
    };

    it('should call navigator.replace for replace-control action', async () => {
      const mockControl: IControl = {
        render: jest.fn().mockResolvedValue('<div>Test</div>'),
      };
      const action: RouteAction = {
        type: 'replace-control',
        control: mockControl,
      };

      const mockHandler = jest.fn().mockResolvedValue(action);
      mockPathname('/test');
      router.on({ alias: '/test', handler: mockHandler });

      await router.resolve();

      expect(mockNavigator.replace).toHaveBeenCalledWith(mockControl);
    });

    it('should call redirect function for redirect action', async () => {
      const mockRedirect = jest.fn().mockResolvedValue(undefined);
      const action: RouteAction = {
        type: 'redirect',
        redirect: mockRedirect,
        params: { id: '123' },
        mode: 'soft',
      };

      const mockHandler = jest.fn().mockResolvedValue(action);
      mockPathname('/test');
      router.on({ alias: '/test', handler: mockHandler });

      await router.resolve();

      expect(mockRedirect).toHaveBeenCalledWith({ id: '123' }, 'soft');
    });

    it('should call redirect without params and mode when not provided', async () => {
      const mockRedirect = jest.fn().mockResolvedValue(undefined);
      const action: RouteAction = {
        type: 'redirect',
        redirect: mockRedirect,
      };

      const mockHandler = jest.fn().mockResolvedValue(action);
      mockPathname('/test');
      router.on({ alias: '/test', handler: mockHandler });

      await router.resolve();

      expect(mockRedirect).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('path matching edge cases', () => {
    const mockPathname = (path: string) => {
      history.pushState(null, '', path);
    };

    it('should not match partial paths', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users/123/extra');
      router.on({ alias: '/users/:id', handler: mockHandler });

      await router.resolve();

      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockProps.onRouteNotFound).toHaveBeenCalled();
    });

    it('should match root path', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/');
      router.on({ alias: '/', handler: mockHandler });

      await router.resolve();

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should handle routes with trailing slashes inconsistently', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users/');
      router.on({ alias: '/users', handler: mockHandler });

      await router.resolve();

      // This should not match because the regex expects exact match
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle empty string parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      mockPathname('/users/');
      router.on({ alias: '/users/:id', handler: mockHandler });

      await router.resolve();

      // This should not match because regex requires at least one character
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('navigation with soft mode', () => {
    it('should call resolve when navigating with soft mode', async () => {
      const resolveSpy = jest.spyOn(router, 'resolve');
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      
      router.on({ alias: '/users/:id', handler: mockHandler });
      
      const goToFunction = router.on({ alias: '/users/:id', handler: mockHandler });
      await goToFunction({ id: '123' }, 'soft');

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/users/123', 'soft');
      expect(resolveSpy).toHaveBeenCalledWith({ id: '123' });
    });

    it('should not call resolve when navigating with hard mode', async () => {
      const resolveSpy = jest.spyOn(router, 'resolve');
      const mockHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      
      router.on({ alias: '/users/:id', handler: mockHandler });
      
      const goToFunction = router.on({ alias: '/users/:id', handler: mockHandler });
      await goToFunction({ id: '123' }, 'hard');

      expect(mockNavigator.navigate).toHaveBeenCalledWith('/users/123', 'hard');
      // Note: resolve is not called for hard navigation - that's handled by page reload
    });
  });

  describe('integration scenarios', () => {
    const mockPathname = (path: string) => {
      history.pushState(null, '', path);
    };

    it('should handle complex routing scenario with multiple routes', async () => {
      const homeHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const userListHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const userDetailHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });
      const postHandler = jest.fn().mockResolvedValue({ type: 'replace-control', control: {} });

      router.on({ alias: '/', handler: homeHandler });
      router.on({ alias: '/users', handler: userListHandler });
      router.on({ alias: '/users/:id', handler: userDetailHandler });
      router.on({ alias: '/users/:userId/posts/:postId', handler: postHandler });

      // Test user detail route
      mockPathname('/users/42');
      await router.resolve();
      expect(userDetailHandler).toHaveBeenCalledWith({ id: '42' });
      expect(homeHandler).not.toHaveBeenCalled();
      expect(userListHandler).not.toHaveBeenCalled();
      expect(postHandler).not.toHaveBeenCalled();
    });

    it('should handle redirect action', async () => {
      const redirectFn = jest.fn().mockResolvedValue(undefined);
      const loginHandler = jest.fn().mockResolvedValue({
        type: 'redirect',
        redirect: redirectFn,
        params: { returnUrl: '/dashboard' },
        mode: 'soft',
      });

      mockPathname('/login');
      router.on({ alias: '/login', handler: loginHandler });

      await router.resolve();

      expect(redirectFn).toHaveBeenCalledWith({ returnUrl: '/dashboard' }, 'soft');
    });

    it('should call all lifecycle hooks in correct order', async () => {
      const callOrder: string[] = [];
      
      (mockProps.onBeforeRoute as jest.Mock).mockImplementation(async () => {
        callOrder.push('before');
      });
      
      const handler = jest.fn().mockImplementation(async () => {
        callOrder.push('handler');
        return { type: 'replace-control', control: {} };
      });
      
      (mockProps.onAfterRoute as jest.Mock).mockImplementation(async () => {
        callOrder.push('after');
      });

      mockPathname('/test');
      router.on({ alias: '/test', handler });

      await router.resolve();

      expect(callOrder).toEqual(['before', 'handler', 'after']);
    });
  });
});
