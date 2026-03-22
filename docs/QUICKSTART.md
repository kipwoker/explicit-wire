# Quick Start Tutorial

This tutorial walks you through creating a minimal "Hello World" application using explicit-wire.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Step 1: Clone or copy the hello-world example

The easiest way to get started is to copy the existing [hello-world example](../examples/hello-world):

```bash
cp -r examples/hello-world my-explicit-wire-app
cd my-explicit-wire-app
```

Or create the project structure manually by following the steps below.

## Step 2: Install dependencies

```bash
npm install
```

## Step 3: Understand the project structure

The hello-world example contains the following key files:

```
examples/hello-world/
├── index.html          # Entry HTML file
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite development server config
└── src/
    ├── main.ts         # Application entry point
    └── controls/
        └── hello-world.ts  # Hello World control
```

Refer to each file in the example for the complete implementation.

## Step 4: Key concepts

### Creating a Control

A control implements the `IControl` interface and defines how to render UI. See [examples/hello-world/src/controls/hello-world.ts](../examples/hello-world/src/controls/hello-world.ts):

```typescript
import { IControl } from 'explicit-wire'

export class HelloWorld implements IControl {
    async render(): Promise<string> {
        return `<h1>Hello World!</h1>`
    }
}
```

### Application entry point

The main entry point sets up the framework with a router and navigator. See [examples/hello-world/src/main.ts](../examples/hello-world/src/main.ts) for the complete setup.

Key parts:
- Create a `Router` instance
- Create a `FrameworkBuilder` with navigator and router
- Define routes that return controls
- Call `router.resolve()` on DOM ready

## Step 5: Run the application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3007`. You should see "Hello World!" displayed on the page.

---

## Next Steps

- Explore the [examples](../examples) to learn more advanced concepts
- Check out the [README](../README.md) for core concepts and architecture