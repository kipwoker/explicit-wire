# Form Submission Example

A user management CRUD application demonstrating form handling, routing, and navigation in explicit-wire.

## What It Does

A complete user management interface where users can:
- View a list of users with their names and ages
- Create new users via a form
- Edit existing users
- Navigate between views using URL routing

Data is persisted in localStorage with simulated network delays to demonstrate loading states.

## What It Demonstrates

- **Router Plugin**: URL-based navigation with route parameters (`/edit/:id`)
- **Form Submission with `onSubmit()`**: Automatic form handling with loading states
- **Navigation**: Programmatic navigation between views using `Navigator`
- **Error Fallback**: Graceful error handling with custom fallback controls
- **Repository Pattern**: Separating data access from UI logic

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

4. Use the interface to create, view, and edit users

## Project Structure

```
form-submission/
├── src/
│   ├── controls/
│   │   ├── error-fallback.ts   # Error display control
│   │   ├── user-form.ts        # Create/edit user form
│   │   └── user-list.ts        # User list display
│   ├── interactions/
│   │   ├── form-loading.ts     # Form submission loading state
│   │   └── page-loading.ts     # Page transition loading
│   ├── repositories/
│   │   └── user-repository.ts  # Data access layer (localStorage)
│   ├── main.ts                 # App entry point with routes
│   └── styles.css              # Styling
├── index.html
├── package.json
└── tsconfig.json
```

## Key Concepts

### Router Configuration

```typescript
export const goToUserList = router.on<void>({
    alias: '/',
    handler: async () => {
        return { type: 'replace-control', control: new UserList() }
    }
})

export const goToEditUser = router.on<{ id: string }>({
    alias: '/edit/:id',
    handler: async (params) => {
        return { type: 'replace-control', control: new UserForm({ id: params.id }) }
    }
})
```

Routes are defined with aliases (URL patterns) and handlers that return controls to render.

### Form Submission

```typescript
onSubmit(formId, createFormLoading(formId), async (data: any) => {
    // data contains all form field values by name
    if (!data.name || data.name.trim() === '') {
        throw new Error('Name is required')
    }
    await userRepository.create({ name: data.name, age: parseInt(data.age) })
    await goToUserList()
})
```

The `onSubmit()` plugin automatically handles form submission, providing form data and managing loading states.

### Error Fallback

```typescript
const fw = new FrameworkBuilder()
    .addNavigator({
        replacer: (control: IControl) => ({
            anchorId: appId,
            loadingFactory: async () => createPageLoading(appId),
            entryPointFactory: async () => control,
            fallbackFactory: async (error: any) => new ErrorFallback({ error })
        })
    })
```

The `fallbackFactory` creates a control to display when errors occur during view rendering.

### Navigation

```typescript
// Navigate programmatically
await goToUserList()

// Or use Navigator directly
const navigator = getContext<Navigator>('navigator')
await navigator.navigate('/', 'hard')
```

Navigation can be done via router handlers or the Navigator directly.