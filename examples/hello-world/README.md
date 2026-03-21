# Hello World Example

A minimal example demonstrating the basic setup of an explicit-wire application.

## What It Does

Renders a simple centered "Hello World!" message on the page. This is the simplest possible explicit-wire application.

## What It Demonstrates

- **Control Implementation**: How to create a basic `IControl` that returns an HTML string
- **FrameworkBuilder**: Setting up the core framework with a navigator and router
- **Router Configuration**: Defining a default route (`/`) that renders a control
- **Basic App Initialization**: Bootstrapping the application on `DOMContentLoaded`

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3007`

## Project Structure

```
hello-world/
├── src/
│   ├── controls/
│   │   └── hello-world.ts    # The main control that renders "Hello World!"
│   └── main.ts               # App entry point with FrameworkBuilder setup
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Control

```typescript
export class HelloWorld implements IControl {
    async render(): Promise<string> {
        return `<h1>Hello World!</h1>`
    }
}
```

A Control is any object implementing the `IControl` interface with an async `render()` method that returns an HTML string.

### Framework Setup

```typescript
const fw = new FrameworkBuilder()
    .addNavigator({ ... })
    .addRouter(router)
    .build()
```

The `FrameworkBuilder` configures the application with required components like navigator and router.