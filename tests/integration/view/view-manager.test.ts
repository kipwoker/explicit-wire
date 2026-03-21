import { ViewManager } from '../../../src/view/view-manager'
import { setContext, contextStore } from '../../../src/state/context'
import { RenderMiddleware, IControl } from '../../../src/view/control'
import { ILoading } from '../../../src/interaction/loading'
import { SilentError } from '../../../src/resilience/error'

describe('ViewManager Integration Tests', () => {
  let viewManager: ViewManager
  let renderMiddleware: RenderMiddleware

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '<div id="app"></div>'
    
    // Initialize render middleware context
    renderMiddleware = {
      preRenderActions: [],
      postRenderActions: [],
    }
    setContext<RenderMiddleware>('render-middleware', renderMiddleware)
    
    viewManager = new ViewManager()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    contextStore.clear()
  })

  const createMockLoading = (): ILoading => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    updateProgress: jest.fn().mockResolvedValue(undefined),
    inProgress: false,
  })

  const createMockControl = (content: string): IControl => ({
    render: jest.fn().mockResolvedValue(content),
  })

  describe('successful content replacement', () => {
    it('should replace anchor content with entry point content', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<h1>Hello World</h1>')
      const fallback = createMockControl('<div>Error</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      const anchor = document.getElementById('app')
      expect(anchor?.innerHTML).toBe('<h1>Hello World</h1>')
      expect(loading.start).toHaveBeenCalled()
      expect(loading.stop).toHaveBeenCalled()
      expect(control.render).toHaveBeenCalled()
      expect(fallback.render).not.toHaveBeenCalled()
    })

    it('should call loading lifecycle methods in correct order', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const callOrder: string[] = []

      loading.start = jest.fn().mockImplementation(() => {
        callOrder.push('start')
        return Promise.resolve()
      })
      loading.stop = jest.fn().mockImplementation(() => {
        callOrder.push('stop')
        return Promise.resolve()
      })
      control.render = jest.fn().mockImplementation(() => {
        callOrder.push('render')
        return Promise.resolve('<div>Content</div>')
      })

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(createMockControl('fallback')),
      })

      expect(callOrder).toEqual(['start', 'render', 'stop'])
    })
  })

  describe('error handling', () => {
    it('should show fallback content on entry point error', async () => {
      const loading = createMockLoading()
      const error = new Error('Render failed')
      const control: IControl = {
        render: jest.fn().mockRejectedValue(error),
      }
      const fallback = createMockControl('<div>Fallback Content</div>')

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      const anchor = document.getElementById('app')
      expect(anchor?.innerHTML).toBe('<div>Fallback Content</div>')
      expect(fallback.render).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Error in ViewManager.replace:', error)
      expect(loading.stop).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle SilentError gracefully without fallback', async () => {
      const loading = createMockLoading()
      const silentError = new SilentError('Silent navigation')
      const control: IControl = {
        render: jest.fn().mockRejectedValue(silentError),
      }
      const fallback = createMockControl('<div>Fallback</div>')

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      const anchor = document.getElementById('app')
      expect(anchor?.innerHTML).toBe('')
      expect(consoleWarnSpy).toHaveBeenCalledWith('Silent navigation')
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(fallback.render).not.toHaveBeenCalled()
      expect(loading.stop).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('should stop loading even when entry point throws', async () => {
      const loading = createMockLoading()
      const control: IControl = {
        render: jest.fn().mockRejectedValue(new Error('Fail')),
      }
      const fallback = createMockControl('<div>Fallback</div>')

      jest.spyOn(console, 'error').mockImplementation()

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(loading.stop).toHaveBeenCalled()

      jest.restoreAllMocks()
    })
  })

  describe('anchor validation', () => {
    it('should throw error when anchor element not found', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')

      await expect(
        viewManager.replace({
          anchorId: 'nonexistent',
          loadingFactory: () => Promise.resolve(loading),
          entryPointFactory: () => Promise.resolve(control),
          fallbackFactory: () => Promise.resolve(fallback),
        })
      ).rejects.toThrow('Anchor nonexistent not found')

      expect(loading.start).not.toHaveBeenCalled()
      expect(control.render).not.toHaveBeenCalled()
    })
  })

  describe('render middleware', () => {
    it('should execute pre-render actions before setting content', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')
      
      const actionOrder: string[] = []
      renderMiddleware.preRenderActions.push(
        jest.fn().mockImplementation(() => {
          actionOrder.push('pre1')
          return Promise.resolve()
        })
      )
      renderMiddleware.preRenderActions.push(
        jest.fn().mockImplementation(() => {
          actionOrder.push('pre2')
          return Promise.resolve()
        })
      )

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(actionOrder).toEqual(['pre1', 'pre2'])
      expect(renderMiddleware.preRenderActions).toEqual([])
    })

    it('should execute post-render actions after setting content', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')
      
      const actionOrder: string[] = []
      renderMiddleware.postRenderActions.push(
        jest.fn().mockImplementation(() => {
          actionOrder.push('post1')
          return Promise.resolve()
        })
      )
      renderMiddleware.postRenderActions.push(
        jest.fn().mockImplementation(() => {
          actionOrder.push('post2')
          return Promise.resolve()
        })
      )

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(actionOrder).toEqual(['post1', 'post2'])
      expect(renderMiddleware.postRenderActions).toEqual([])
    })

    it('should execute both pre and post render actions in correct order', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')
      
      const actionOrder: string[] = []
      renderMiddleware.preRenderActions.push(
        jest.fn().mockImplementation(() => {
          actionOrder.push('pre')
          return Promise.resolve()
        })
      )
      renderMiddleware.postRenderActions.push(
        jest.fn().mockImplementation(() => {
          actionOrder.push('post')
          return Promise.resolve()
        })
      )

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(actionOrder).toEqual(['pre', 'post'])
    })

    it('should clear pre-render actions after execution', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')

      renderMiddleware.preRenderActions.push(() => Promise.resolve())

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(renderMiddleware.preRenderActions).toEqual([])
    })

    it('should clear post-render actions after execution', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')

      renderMiddleware.postRenderActions.push(() => Promise.resolve())

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(renderMiddleware.postRenderActions).toEqual([])
    })
  })

  describe('DOM manipulation', () => {
    it('should clear existing content before setting new content', async () => {
      const anchor = document.getElementById('app')
      if (anchor) {
        anchor.innerHTML = '<p>Old content</p>'
      }

      const loading = createMockLoading()
      const control = createMockControl('<div>New content</div>')
      const fallback = createMockControl('<div>Fallback</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(anchor?.innerHTML).toBe('<div>New content</div>')
    })

    it('should handle complex HTML content', async () => {
      const complexHtml = `
        <div class="container">
          <header>
            <h1>Title</h1>
            <nav>
              <a href="/home">Home</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <section id="content">
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </section>
          </main>
        </div>
      `

      const loading = createMockLoading()
      const control = createMockControl(complexHtml)
      const fallback = createMockControl('<div>Fallback</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      const anchor = document.getElementById('app')
      expect(anchor?.querySelector('h1')?.textContent).toBe('Title')
      expect(anchor?.querySelectorAll('a').length).toBe(2)
      expect(anchor?.querySelectorAll('p').length).toBe(2)
    })

    it('should handle empty content', async () => {
      const loading = createMockLoading()
      const control = createMockControl('')
      const fallback = createMockControl('<div>Fallback</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      const anchor = document.getElementById('app')
      expect(anchor?.innerHTML).toBe('')
    })
  })

  describe('loading factory behavior', () => {
    it('should call loading factory to create loading instance', async () => {
      const loading = createMockLoading()
      const loadingFactory = jest.fn().mockResolvedValue(loading)
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory,
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(loadingFactory).toHaveBeenCalledTimes(1)
    })
  })

  describe('entry point factory behavior', () => {
    it('should call entry point factory to create control', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const entryPointFactory = jest.fn().mockResolvedValue(control)
      const fallback = createMockControl('<div>Fallback</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory,
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(entryPointFactory).toHaveBeenCalledTimes(1)
    })

    it('should not call fallback factory on success', async () => {
      const loading = createMockLoading()
      const control = createMockControl('<div>Content</div>')
      const fallback = createMockControl('<div>Fallback</div>')
      const fallbackFactory = jest.fn().mockResolvedValue(fallback)

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory,
      })

      expect(fallbackFactory).not.toHaveBeenCalled()
    })
  })

  describe('fallback factory behavior', () => {
    it('should call fallback factory with error on entry point failure', async () => {
      const loading = createMockLoading()
      const error = new Error('Test error')
      const control: IControl = {
        render: jest.fn().mockRejectedValue(error),
      }
      const fallback = createMockControl('<div>Fallback</div>')
      const fallbackFactory = jest.fn().mockResolvedValue(fallback)

      jest.spyOn(console, 'error').mockImplementation()

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control),
        fallbackFactory,
      })

      expect(fallbackFactory).toHaveBeenCalledTimes(1)
      expect(fallbackFactory).toHaveBeenCalledWith(error)

      jest.restoreAllMocks()
    })
  })

  describe('multiple replacements', () => {
    it('should handle multiple sequential replacements', async () => {
      const loading = createMockLoading()
      const control1 = createMockControl('<div>First</div>')
      const control2 = createMockControl('<div>Second</div>')
      const fallback = createMockControl('<div>Fallback</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control1),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(document.getElementById('app')?.innerHTML).toBe('<div>First</div>')

      await viewManager.replace({
        anchorId: 'app',
        loadingFactory: () => Promise.resolve(loading),
        entryPointFactory: () => Promise.resolve(control2),
        fallbackFactory: () => Promise.resolve(fallback),
      })

      expect(document.getElementById('app')?.innerHTML).toBe('<div>Second</div>')
    })
  })
})