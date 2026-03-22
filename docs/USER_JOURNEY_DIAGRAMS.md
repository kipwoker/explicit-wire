# User Journey Diagrams

## Page Load & Initial Render

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as explicit-wire App
    participant VM as ViewManager
    participant DOM
    
    User->>Browser: Navigate to page
    Browser->>App: Initialize app
    App->>App: Build framework (FrameworkBuilder)
    App->>VM: Setup ViewManager
    
    App->>VM: Replace view (anchor, control)
    VM->>DOM: Clear anchor
    VM->>DOM: Show loading indicator
    VM->>App: Create control
    App->>App: Render control
    App-->>VM: Return HTML string
    VM->>DOM: Inject HTML
    VM->>DOM: Execute postRenderActions (bind events)
    VM->>DOM: Hide loading indicator
    
    Browser-->>User: Page rendered & interactive
```

## User Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant DOM
    participant EHS as EventHandlerStore
    participant Handler as Event Handler
    participant VM as ViewManager
    
    Note over DOM: Page loaded, events registered
    
    User->>DOM: Click button / Submit form
    DOM->>EHS: Event fired (click/submit)
    EHS->>EHS: Find handler by targetId
    EHS->>Handler: Execute handler(event)
    
    Handler->>VM: Trigger view update
    VM->>DOM: Clear old content
    VM->>DOM: Show loading
    Handler->>Handler: Process logic / Fetch data
    Handler-->>VM: Return new control
    VM->>DOM: Inject new HTML
    VM->>DOM: Bind new events
    
    DOM-->>User: Updated view displayed
```

## Element Lifecycle & Cleanup

```mermaid
sequenceDiagram
    participant User
    participant DOM
    participant Observer as MutationObserver
    participant EHS as EventHandlerStore
    
    Note over DOM: Button with id='submit-btn' exists
    
    User->>DOM: Navigate away (view replacement)
    DOM->>DOM: Old content removed
    Observer->>EHS: Mutation: element removed
    EHS->>EHS: Unregister handler for 'submit-btn'
    EHS->>DOM: Event listener cleanup
    
    Note over DOM: No behavior leaks, handlers cleaned up