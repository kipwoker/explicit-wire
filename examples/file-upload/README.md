# File Upload Example

A drag-and-drop file upload interface demonstrating event handling and loading states in explicit-wire.

## What It Does

Provides a file upload interface where users can:
- Drag and drop files onto a drop zone
- Click a button to select files via file picker
- See upload progress with a progress bar
- View a list of uploaded files with their sizes

The upload is emulated (no actual server) with simulated delay to demonstrate loading states.

## What It Demonstrates

- **Event Handling with `on()`**: Subscribing to DOM events on specific element IDs
- **Custom Loading States**: Implementing `ILoading` interface for progress feedback
- **ViewManager Integration**: Re-rendering the view after state changes
- **Drag and Drop Behavior**: Creating reusable behavior modules for drag-n-drop
- **DOM Event Logging**: Using `logDomEvents` option for debugging

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

4. Drag files onto the drop zone or click "Choose Files" to upload

## Project Structure

```
file-upload/
├── src/
│   ├── behaviors/
│   │   └── drag-n-drop.ts      # Reusable drag-and-drop behavior
│   ├── controls/
│   │   └── file-upload.ts      # Main file upload control
│   ├── interactions/
│   │   └── upload-loading.ts   # Custom loading implementation
│   ├── main.ts                 # App entry point
│   └── styles.css              # Styling
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Event Subscription

```typescript
on('click', 'upload-btn', async () => {
    // Handle click on element with id="upload-btn"
})
```

The `on()` function subscribes to events on elements by ID. The handler is automatically registered when the element appears and unregistered when removed.

### Custom Loading State

```typescript
export function createUploadLoading(dropZoneId: string): ILoading {
    return {
        start: async () => { /* Show loading UI */ },
        stop: async () => { /* Hide loading UI */ },
        updateProgress: async (percent: number) => { /* Update progress bar */ },
        inProgress: false
    }
}
```

The `ILoading` interface provides hooks for managing loading UI during async operations.

### Drag and Drop Behavior

```typescript
dragNDrop({
    id: 'drop-zone',
    onDrop: async (files: FileList) => {
        await this.emulateUpload(files)
    }
})
```

Behaviors encapsulate reusable DOM interaction patterns that can be attached to any element.