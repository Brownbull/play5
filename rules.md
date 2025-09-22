# 1. Wasp Overview and Core Concepts

This document covers the fundamental concepts of the Wasp framework, the basic project structure, and deployment information.

## Background Information

### What is Wasp

- Wasp (Web Application SPecification language) is a declarative, statically typed, domain-specific language (DSL) for building modern, full-stack web applications.
- Unlike traditional frameworks that are sets of libraries, Wasp is a simple programming language that understands web app concepts and generates code for you.
- Wasp integrates with React (frontend), Node.js (backend), and Prisma (database ORM) to create full-stack web applications with minimal boilerplate.
- The Wasp compiler reads your declarative configuration in [main.wasp](mdc:main.wasp) and generates all the necessary code for a working web application.
- For the most up-to-date and comprehensive information, always refer to the [Wasp Docs](mdc:https:/wasp.sh/docs) -- https://wasp.sh/docs 

### Wasp Project Structure

- A Wasp project consists of a [main.wasp](mdc:main.wasp) (or `main.wasp.ts`) file in the root directory that defines the app's configuration.
- The [schema.prisma](mdc:schema.prisma) file in the root directory defines your database models.
- Your custom code lives in the `src/` directory (e.g. `src/features/`), which contains client-side and server-side code.
- Wasp generates additional code that connects everything together when you run your app.

### The main.wasp File

- The [main.wasp](mdc:main.wasp) file is the central configuration file that defines your application structure.
- It contains declarations for app settings, pages, routes, authentication, database entities, and operations (queries and actions).
- Example structure:
  ```wasp
  app myApp {
    wasp: {
      version: "^0.16.0" // Check @main.wasp for the actual version
    },
    title: "My App",
  }

  route HomeRoute { path: "/", to: HomePage }
  page HomePage {
    component: import { HomePage } from "@src/client/pages/HomePage.tsx" // Example import path
  }

  // Operations are defined here, see 3-database-operations.mdc
  query getTasks {
    fn: import { getTasks } from "@src/server/queries.js",
    entities: [Task]
  }
  ```

### Deployment

- Wasp applications can be deployed to various hosting providers.
- Wasp has a built-in one-command deployment to fly.io, e.g. `wasp deploy fly`. See the @Wasp CLI Deployment docs for more information. 

# 2. Project Conventions and Rules

This document outlines the specific conventions, file structures, and general rules for this Wasp project.

## Quick Reference

### Common Patterns

- Define app structure in [main.wasp](mdc:main.wasp) or `main.wasp.ts`.
- Define data models in [schema.prisma](mdc:schema.prisma).
- Group feature code in `src/features/{featureName}` directories.
- Group feature config definitions (e.g. routes, pages, operations, etc.) into sections within the Wasp config file ([main.wasp](mdc:main.wasp)) using the `//#region` directive:
  ```wasp
  // Example in @main.wasp
  //#region {FeatureName}
  // ... feature-specific declarations ...
  //#endregion
  ```
- Use Wasp operations (queries/actions) for client-server communication (See [3-database-operations.mdc](mdc:.claude/Rules/3-database-operations.mdc)).
- **Wasp Imports:** Import from `wasp/...` not `@wasp/...` in `.ts`/`.tsx` files.
- Document features in `ai/docs/` with:
  - One markdown file per feature (e.g. `ai/docs/{featureName}.md`).
  - Operations specifications and data models.
  - User workflows and business logic.
  - Update documentation when implementing feature changes.
- Reference the relevant `ai/docs/` files when writing or modifying feature code.

### Common Issues & Import Rules

- **Wasp Imports in `.ts`/`.tsx`:** Always use the `wasp/...` prefix.
  - ✅ `import { Task } from 'wasp/entities'`
  - ✅ `import type { GetTasks } from 'wasp/server/operations'`
  - ✅ `import { getTasks, useQuery } from 'wasp/client/operations'`
  - ❌ `import { ... } from '@wasp/...'`
  - ❌ `import { ... } from '@src/features/...'` (Use relative paths for non-Wasp imports within `src`)
  - If you see "Cannot find module 'wasp/...'": Double-check the import path prefix.
- **Wasp Config Imports in [main.wasp](mdc:main.wasp) :** Imports of your code *must* start with `@src/`.
  - ✅ `component: import { LoginPage } from "@src/features/auth/LoginPage.tsx"`
  - ❌ `component: import { LoginPage } from "../src/features/auth/LoginPage.tsx"`
  - ❌ `component: import { LoginPage } from "client/pages/auth/LoginPage.tsx"`
- **General Imports in `.ts`/`.tsx`:** Use relative paths for imports within the `src/` directory. Avoid using the `@src/` alias directly in `.ts`/`.tsx` files.
  - If you see "Cannot find module '@src/...'": Use a relative path instead.
- **Prisma Enum *Value* Imports:** Import directly from `@prisma/client`. See [3-database-operations.mdc](mdc:.claude/Rules/3-database-operations.mdc).
- **Wasp Actions Client-Side:** Call actions directly using `async/await`. Avoid `useAction` unless optimistic updates are needed. See [3-database-operations.mdc](mdc:.claude/Rules/3-database-operations.mdc)`.
  - ✅ `import { deleteTask } from 'wasp/client/operations'; await deleteTask({ taskId });`
- Root Component (`src/App.tsx` or similar):
  - Ensure the root component defined in @main.wasp (usually via `app.client.rootComponent`) renders the `<Outlet />` component from `react-router-dom` to display nested page content.
    ```tsx
    // Example Root Component
    import React from 'react';
    import { Outlet } from 'react-router-dom';
    import Header from './Header'; // Example shared component

    function App() {
      return (
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="container mx-auto p-4">
            {/* Outlet renders the content of the matched route/page */}
            <Outlet />
          </main>
        </div>
      );
    }
    export default App;
    ```

## Rules

### General Rules

- Always reference the Wasp config file [main.wasp](mdc:main.wasp) as your source of truth for the app's configuration and structure.
- Always reference the `ai/docs/` directory for information on the app's features and functionality when writing code.
- Group feature config definitions in [main.wasp](mdc:main.wasp) using `//#region` (as noted above).
- Group feature code into feature directories (e.g. `src/features/transactions`).
- Use the latest Wasp version, as defined in the [main.wasp](mdc:main.wasp) file.
- Combine Wasp operations (queries and actions) into an `operations.ts` file within the feature directory (e.g., `src/features/transactions/operations.ts`).
- Always use TypeScript for Wasp code (`.ts`/`.tsx`).
- Keep these rules files in `.claude/Rules/` updated with any new project conventions or changes in Wasp best practices. The original `.cursorrules` file may be kept for reference but these `.mdc` files are the primary source.

### Wasp Dependencies

- Avoid adding dependencies directly to the [main.wasp](mdc:main.wasp) config file.
- Install dependencies via `npm install` instead. This updates [package.json](mdc:package.json) and [package-lock.json](mdc:package-lock.json)

# 3. Database, Entities, and Operations

This document covers how Wasp interacts with the database using Prisma, defines Wasp Entities, and explains the rules for creating and using Wasp Operations (Queries and Actions).

## Wasp Database and Entities

- Wasp uses Prisma for database access, with models defined in [schema.prisma](mdc:schema.prisma).
- Prisma models defined in [schema.prisma](mdc:schema.prisma) automatically become Wasp Entities that can be used in operations.
- Wasp reads the [schema.prisma](mdc:schema.prisma) file to understand your data model and generate appropriate code (e.g., types in `wasp/entities`).
- Example Prisma model in [schema.prisma](mdc:schema.prisma) :
  ```prisma
  model Task {
    id          Int      @id @default(autoincrement())
    description String
    isDone      Boolean  @default(false)
    user        User     @relation(fields: [userId], references: [id])
    userId      Int
  }
  ```

## Wasp DB Schema Rules (@schema.prisma)

- Add database models directly to the [schema.prisma](mdc:schema.prisma) file, NOT to [main.wasp](mdc:main.wasp) as entities.
- Generally avoid adding `db.system` or `db.prisma` properties to the [main.wasp](mdc:main.wasp) config file; configure the database provider within [schema.prisma](mdc:schema.prisma) instead.
  ```prisma
  // Example in schema.prisma
  datasource db {
    provider = "postgresql" // or "sqlite"
    url      = env("DATABASE_URL")
  }
  ```
- Keep the [schema.prisma](mdc:schema.prisma) file in the root of the project.
- **Applying Changes:** After updating [schema.prisma](mdc:schema.prisma), run `wasp db migrate-dev` in the terminal to generate and apply SQL migrations.
- **Database Choice:** While 'sqlite' is the default, it lacks support for features like Prisma enums or PgBoss scheduled jobs. Use 'postgresql' for such cases. If using PostgreSQL locally, ensure it's running (e.g., via `wasp db start` if using Wasp's built-in Docker setup, or ensure your own instance is running).
- Define all model relationships (`@relation`) within [schema.prisma](mdc:schema.prisma).

## Wasp Operations (Queries & Actions)

- Operations are how Wasp handles client-server communication, defined in [main.wasp](mdc:main.wasp).
- **Queries:** Read operations (fetch data).
- **Actions:** Write operations (create, update, delete data).
- Operations automatically handle data fetching, caching (for queries), and updates.
- Operations reference Entities (defined in [schema.prisma](mdc:schema.prisma) ) to establish proper data access patterns and dependencies.
- Example definitions in [main.wasp](mdc:main.wasp):
  ```wasp
  query getTasks {
    // Points to the implementation function
    fn: import { getTasks } from "@src/features/tasks/operations.ts", // Convention: operations.ts
    // Grants access to the Task entity within the operation's context
    entities: [Task]
  }

  action createTask {
    fn: import { createTask } from "@src/features/tasks/operations.ts",
    entities: [Task] // Needs access to Task to create one
  }
  ```

## Wasp Operations Rules & Implementation

- **Operation File:** Implement query and action functions together in a single `operations.ts` file within the relevant feature directory (e.g., `src/features/tasks/operations.ts`).
- **Generated Types:** Wasp auto-generates TypeScript types for your operations based on their definitions in [main.wasp](mdc:main.wasp) and the functions' signatures.
  - Import operation types using `import type { MyQuery, MyAction } from 'wasp/server/operations';`
  - If types aren't updated after changing [main.wasp](mdc:main.wasp) or the function signature, restart the Wasp dev server (`wasp start`).
- **Entity Types:** Wasp generates types for your Prisma models from [schema.prisma](mdc:schema.prisma).
  - Import entity types using `import type { MyModel } from 'wasp/entities';`
- **Entity Access:** Ensure all Entities needed within an operation's logic are listed in its `entities: [...]` definition in [main.wasp](mdc:main.wasp). This makes `context.entities.YourModel` available.
- **Internal Communication:** Prioritize Wasp operations for client-server communication within the app. Use API Routes (see [6-advanced-troubleshooting.mdc](mdc:.claude/Rules/6-advanced-troubleshooting.mdc))  primarily for external integrations (webhooks, etc.).
- **Client-Side Query Usage:** Use Wasp's `useQuery` hook from `wasp/client/operations` to fetch data.
  - `import { useQuery } from 'wasp/client/operations';`
  - `const { data, isLoading, error } = useQuery(getQueryName, { queryArgs });`
- **Client-Side Action Usage:** Call actions *directly* using `async`/`await`. **Avoid** the `useAction` hook unless you specifically need optimistic UI updates (see [6-advanced-troubleshooting.mdc](mdc:.claude/Rules/6-advanced-troubleshooting.mdc)).
  - `import { myAction } from 'wasp/client/operations';`
  - `const result = await myAction({ actionArgs });`
- **Example Operation Implementation (`src/features/tasks/operations.ts`):
  ```typescript
  import { HttpError } from 'wasp/server'
  import type { GetTasks, CreateTask } from 'wasp/server/operations'
  import type { Task } from 'wasp/entities'

  // Type annotations come from Wasp based on main.wasp definitions
  export const getTasks: GetTasks<void, Task[]> = async (_args, context) => {
    if (!context.user) {
      throw new HttpError(401, 'Not authorized');
    }
    // Access entities via context
    return context.entities.Task.findMany({
      where: { userId: context.user.id }
    });
  }

  type CreateTaskInput = Pick<Task, 'description'>
  export const createTask: CreateTask<CreateTaskInput, Task> = async (args, context) => {
    if (!context.user) {
      throw new HttpError(401, 'Not authorized');
    }

    return context.entities.Task.create({
      data: {
        description: args.description,
        userId: context.user.id,
      }
    });
  }
  ```

## Prisma Enum Value Imports

- **Rule:** When you need to use Prisma enum members as *values* (e.g., `MyEnum.VALUE` in logic or comparisons) in your server or client code, import the enum directly from `@prisma/client`, not from `wasp/entities`.
  - ✅ `import { TransactionType } from '@prisma/client';` (Use as `TransactionType.EXPENSE`)
  - ❌ `import { TransactionType } from 'wasp/entities';` (This only imports the *type* for annotations, not the runtime *value*)

## Server-Side Error Handling

- Use `try/catch` blocks within operation functions.
- Throw `HttpError` from `wasp/server` for expected errors (e.g., unauthorized, not found, bad input) to send structured responses to the client.
- Log unexpected errors for debugging.
- Example:
  ```typescript
  import { HttpError } from 'wasp/server'
  import type { UpdateTask } from 'wasp/server/operations'
  import type { Task } from 'wasp/entities'

  export const updateTask: UpdateTask<{ id: number; data: Partial<Task> }, Task> = async (args, context) => {
    if (!context.user) {
      throw new HttpError(401, 'Not authorized');
    }

    try {
      const task = await context.entities.Task.findFirst({
        where: { id: args.id, userId: context.user.id },
      });

      if (!task) {
        throw new HttpError(404, 'Task not found');
      }

      return context.entities.Task.update({
        where: { id: args.id },
        data: args.data,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error; // Re-throw known HttpErrors
      }
      // Log unexpected errors
      console.error('Failed to update task:', error);
      // Throw a generic server error for unexpected issues
      throw new HttpError(500, 'Failed to update task due to an internal error.');
    }
  }
  ```
# 4. Authentication

This document details how authentication is configured and used within the Wasp application.

## Wasp Auth Setup (`@main.wasp`)

- Wasp provides built-in authentication with minimal configuration in [main.wasp](mdc:main.wasp).
- Auth can be configured with username/password, social providers (Google, GitHub, etc.), or verified email and password.
- Wasp generates all necessary auth routes, middleware, and UI components based on the configuration.
- Example auth configuration in [main.wasp](mdc:main.wasp):
  ```wasp
  app myApp {
    // ... other config
    auth: {
      // Links Wasp auth to your User model in @schema.prisma
      userEntity: User,
      methods: {
        // Enable username/password login
        usernameAndPassword: {},
        // Enable Google OAuth login
        // Requires setting GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars
        google: {},
        // Enable email/password login with verification
        email: {
          // Set up an email sender (Dummy prints to console)
          // See https://wasp-lang.com/docs/auth/email-auth#email-sending
          fromField: {
            name: "Budgeting Vibe",
            email: "noreply@budgetingvibe.com"
          },
          emailVerification: {
            clientRoute: EmailVerificationRoute
          },
          passwordReset: {
            clientRoute: PasswordResetRoute
          }
        }
      },
      // Route to redirect to if auth fails
      onAuthFailedRedirectTo: "/login",
      // Optional: Route after successful signup/login
      // onAuthSucceededRedirectTo: "/dashboard"
    }
    emailSender: {
      provider: Dummy // Use Dummy for local dev (prints emails to console)
      // provider: SMTP // For production, configure SMTP
    }
  }

  // Define the routes needed by email auth methods
  route EmailVerificationRoute { path: "/auth/verify-email/:token", to: EmailVerificationPage }
  page EmailVerificationPage { component: import { EmailVerification } from "@src/features/auth/EmailVerificationPage.tsx" }

  route PasswordResetRoute { path: "/auth/reset-password/:token", to: PasswordResetPage }
  page PasswordResetPage { component: import { PasswordReset } from "@src/features/auth/PasswordResetPage.tsx" }
  ```

- **Dummy Email Provider Note:** When `emailSender: { provider: Dummy }` is configured in [main.wasp](mdc:main.wasp), Wasp does not send actual emails. Instead, the content of verification/password reset emails, including the clickable link, will be printed directly to the server console where `wasp start` is running.

## Wasp Auth Rules

- **User Model ( [schema.prisma](mdc:schema.prisma) ):**
  - Wasp Auth methods handle essential identity fields (like `email`, `password hash`, `provider IDs`, `isVerified`) internally. These are stored in separate Prisma models managed by Wasp (`AuthProvider`, `AuthProviderData`).
  - Your Prisma `User` model (specified in [main.wasp](mdc:main.wasp) as `auth.userEntity`) typically **only needs the `id` field** for Wasp to link the auth identity.
    ```prisma
    // Minimal User model in @schema.prisma
    model User {
      id Int @id @default(autoincrement())
      // Add other *non-auth* related fields as needed
      // e.g., profile info, preferences, relations to other models
      // profileImageUrl String?
      // timeZone        String? @default("UTC")
    }
    ```
  - **Avoid adding** `email`, `emailVerified`, `password`, `username`, or provider-specific ID fields directly to *your* `User` model in [schema.prisma](mdc:schema.prisma) unless you have very specific customization needs that require overriding Wasp's default behavior and managing these fields manually.
  - If you need frequent access to an identity field like `email` or `username` for *any* user (not just the logged-in one), see the **Recommendation** in the "Wasp Auth User Fields" section below.

- **Auth Pages:**
  - When initially creating Auth pages (Login, Signup), use the pre-built components provided by Wasp for simplicity:
    - `import { LoginForm, SignupForm } from 'wasp/client/auth';`
    - These components work with the configured auth methods in [main.wasp](mdc:main.wasp).
    - You can customize their appearance or build completely custom forms if needed.

- **Protected Routes/Pages:**
  - Use the `useAuth` hook from `wasp/client/auth` to access the current user's data and check authentication status.
  - Redirect or show alternative content if the user is not authenticated.
  ```typescript
  import { useAuth } from 'wasp/client/auth';
  import { Redirect } from 'wasp/client/router'; // Or use Link

  const MyProtectedPage = () => {
    const { data: user, isLoading, error } = useAuth(); // Returns AuthUser | null

    if (isLoading) return <div>Loading...</div>;
    // If error, it likely means the auth session is invalid/expired
    if (error || !user) {
      // Redirect to login page defined in main.wasp (auth.onAuthFailedRedirectTo)
      // Or return <Redirect to="/login" />;
      return <div>Please log in to access this page.</div>;
    }

    // User is authenticated, render the page content
    // Use helpers like getEmail(user) or getUsername(user) if needed
    return <div>Welcome back!</div>; // Access user.id if needed
  };
  ```

## Wasp Auth User Fields (`AuthUser`)

- The `user` object returned by `useAuth()` hook on the client, or accessed via `context.user` in server operations/APIs, is an `AuthUser` object (type imported from `wasp/auth`).
- **Auth-specific fields** (email, username, verification status, provider IDs) live under the nested `identities` property based on the auth method used.
  - e.g., `user.identities.email?.email`
  - e.g., `user.identities.username?.username`
  - e.g., `user.identities.google?.providerUserId`
  - **Always check for `null` or `undefined`** before accessing these nested properties, as a user might not have used all configured auth methods.
- **Helpers:** Wasp provides helper functions from `wasp/auth` for easier access to common identity fields on the `AuthUser` object:
  - `import { getEmail, getUsername } from 'wasp/auth';`
  - `const email = getEmail(user); // Returns string | null`
  - `const username = getUsername(user); // Returns string | null`
- **Standard User Entities:** Remember that standard `User` entities fetched via `context.entities.User.findMany()` or similar in server code **DO NOT** automatically include these auth identity fields (`email`, `username`, etc.) by default. They only contain the fields defined directly in your [schema.prisma](mdc:schema.prisma) `User` model.
- **Recommendation:**
  - If you need *frequent* access to an identity field like `email` or `username` for *any* user (not just the currently logged-in one accessed via `context.user` or `useAuth`) and want to query it easily via `context.entities.User`, consider this approach:
    1.  **Add the field directly** to your `User` model in [schema.prisma](mdc:schema.prisma).
        ```prisma
        model User {
          id    Int     @id @default(autoincrement())
          email String? @unique // Add if needed frequently
          // other fields...
        }
        ```
    2.  **Ensure this field is populated correctly** when the user signs up or updates their profile. You might need a Wasp action to update the `User` model after signup or when an email is verified.
    3.  This makes the field (`email` in this example) a standard, queryable field on your `User` entity, accessible via `context.entities.User`, separate from the `AuthUser`'s identity structure.

- **Common Issue:** If auth isn't working, first verify the `auth` configuration in [main.wasp](mdc:main.wasp) is correct and matches your intent (correct `userEntity`, enabled `methods`, `onAuthFailedRedirectTo`). Ensure environment variables for social providers are set if applicable. Check the Wasp server logs for errors. 

# 5. Frontend (React) and Styling (TailwindCSS)

This document outlines conventions for building the user interface with React and styling it with Tailwind CSS.

## React Conventions

- **Imports:**
  - Use relative paths to import other React components within the `src/` directory.
    - ✅ `import { MyButton } from '../components/MyButton';`
    - ❌ `import { MyButton } from '@src/components/MyButton';`
  
- **State Management:**
  - Use standard React hooks (`useState`, `useEffect`, `useReducer`) for component-level state.
  - Use Wasp Queries (`useQuery`) for fetching and managing server state on the client.
  - Consider React Context (`createContext`, `useContext`) for global UI state that doesn't need server persistence (e.g., theme, modal visibility) but avoid overusing it for state that belongs in specific components or on the server.
- **Error Handling (Client-side):**
  - Use `try/catch` blocks with `async/await` when calling Wasp Actions.
  - The `useQuery` hook provides `error` objects for handling query errors.
  - Consider implementing a global React Error Boundary component at a high level in your component tree (e.g., within the root component) to catch rendering errors gracefully.
    - See [React Docs on Error Boundaries](mdc:https:/react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

## Shadcn/ui Components (`src/components`)

- This project utilizes components based on the [Shadcn/ui](mdc:https:/ui.shadcn.com) library, primarily located within the `src/components` directory and its subdirectories (e.g., `src/components/ui`).
- Many of these components follow patterns and styles inspired by common admin dashboard layouts built with Shadcn/ui.
- **Usage:** When building UI features, prefer using or adapting existing components from `src/components` to maintain visual consistency.
- **Customization:** Components are typically self-contained or rely on utilities (e.g., `cn` for merging Tailwind classes). Refer to the Shadcn/ui documentation for underlying principles if deeper customization is needed.
- **Adding New Components:** If adding new components inspired by Shadcn/ui, follow the existing structure and conventions within `src/components`.

## TailwindCSS Conventions

- **Primary Styling Method:** Use Tailwind CSS utility classes directly in your JSX for styling.
- **Avoid Inline Styles:** Generally avoid using the `style` prop unless absolutely necessary for dynamic styles that cannot be achieved with Tailwind classes.
- **Reusability:** For complex or frequently reused style combinations, consider:
  - Creating reusable React components that encapsulate the structure and styling.
  - If necessary, using `@apply` within a global CSS file (`src/client/index.css` or similar) to create custom reusable classes, but prefer component composition first.
    ```css
    /* Example in index.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    .btn-primary {
      @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300;
    }
    ```
- **Responsive Design:** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) to apply styles conditionally based on screen size.
  - ✅ `<div class="w-full md:w-1/2 lg:w-1/3">...</div>`
- **Configuration:** If you need to customize Tailwind (e.g., add custom colors, fonts, spacing), modify the `@tailwind.config.js` file in the project root. 

# 6. Advanced Features & Troubleshooting

This document covers advanced Wasp capabilities like Jobs, API Routes, and Middleware, along with performance optimization tips and common troubleshooting steps.

## Advanced Features ( [main.wasp](mdc:main.wasp) )

These features are configured in [main.wasp](mdc:main.wasp).

### Jobs and Workers

- Wasp supports background jobs, useful for tasks like sending emails, processing data, or scheduled operations.
- Jobs require a job executor like PgBoss (which requires PostgreSQL, see [3-database-operations.mdc](mdc:.claude/Rules/3-database-operations.mdc) ).
- Example Job definition in [main.wasp](mdc:main.wasp):
  ```wasp
  job emailSender {
    executor: PgBoss, // Requires PostgreSQL
    // Define the function that performs the job
    perform: {
      fn: import { sendEmail } from "@src/server/jobs/emailSender.js"
    },
    // Grant access to necessary entities
    entities: [User, EmailQueue]
  }
  ```
- Jobs can be scheduled or triggered programmatically from Wasp actions or other jobs.
- See [Wasp Jobs Documentation](mdc:https:/wasp-lang.com/docs/advanced/jobs).

### API Routes

- Define custom server API endpoints, often used for external integrations (webhooks, third-party services) where Wasp Operations are not suitable.
- Example API route definition in [main.wasp](mdc:main.wasp):
  ```wasp
  api stripeWebhook {
    // Implementation function in server code
    fn: import { handleStripeWebhook } from "@src/server/apis/stripe.js",
    // Define the HTTP method and path
    httpRoute: (POST, "/webhooks/stripe"),
    // Optional: Grant entity access
    entities: [User, Payment],
    // Optional: Apply middleware
    // middlewares: [checkStripeSignature]
    // Optional: Disable default auth check if webhook handles its own
    // auth: false
  }
  ```
- See [Wasp API Routes Documentation](mdc:https:/wasp-lang.com/docs/advanced/apis).

### Middleware

- Wasp supports custom middleware functions that can run before API route handlers or Page components.
- Useful for logging, custom authentication/authorization checks, request transformation, etc.
- Example Middleware definition in [main.wasp](mdc:main.wasp):
  ```wasp
  // Define the middleware itself
  middleware checkAdmin {
    fn: import { checkAdminMiddleware } from "@src/server/middleware/auth.js"
  }

  // Apply it to a page or API route
  page AdminDashboardPage {
    component: import { AdminDashboard } from "@src/features/admin/AdminDashboardPage.tsx",
    auth: true, // Ensure user is logged in first
    middlewares: [checkAdmin] // Apply custom admin check
  }

  api adminAction {
      fn: import { handleAdminAction } from "@src/server/apis/admin.js",
      httpRoute: (POST, "/api/admin/action"),
      auth: true,
      middlewares: [checkAdmin]
  }
  ```
- See [Wasp Middleware Documentation](mdc:https:/wasp-lang.com/docs/advanced/middleware).

## Performance Optimization

- **Operation Dependencies:** Use specific entity dependencies (`entities: [Task]`) in your Wasp operations ([main.wasp](mdc:main.wasp)) to ensure queries are automatically refetched only when relevant data changes.
- **Pagination:** For queries returning large lists of data, implement pagination logic in your server operation and corresponding UI controls on the client.
- **React Optimization:**
  - Use `React.memo` for components that re-render often with the same props.
  - Use `useMemo` to memoize expensive calculations within components.
  - Use `useCallback` to memoize functions passed down as props to child components (especially event handlers).
- **Optimistic UI Updates (Actions):**
  - For actions where perceived speed is critical (e.g., deleting an item, marking as complete), consider using Wasp's `useAction` hook (from `wasp/client/operations`) with `optimisticUpdates`.
  - This updates the client-side cache (affecting relevant `useQuery` results) *before* the action completes on the server, providing instant feedback.
  - **Use Sparingly:** Only implement optimistic updates where the action is highly likely to succeed and the instant feedback significantly improves UX. Remember to handle potential server-side failures gracefully (Wasp helps revert optimistic updates on error).
  - Example:
    ```typescript
    import { useAction, useQuery } from 'wasp/client/operations';
    import { deleteTask, getTasks } from 'wasp/client/operations'; // Assuming these exist
    import type { Task } from 'wasp/entities';

    function TaskList() {
      const { data: tasks } = useQuery(getTasks);

      // Use useAction when optimistic updates are needed
      const { execute: deleteAction, isExecuting } = useAction(deleteTask, {
        optimisticUpdates: [
          {
            // Specify the query to update optimistically
            getQuerySpecifier: getTasks,
            // Function to update the query cache
            updateQuery: (oldTasks, args) => {
              // args contains { taskId: number } passed to deleteAction
              return oldTasks.filter(task => task.id !== args.taskId);
            }
          }
        ]
      });

      const handleDelete = async (taskId: number) => {
        try {
          await deleteAction({ taskId });
        } catch (error) {
          console.error("Failed to delete task:", error);
          // Optionally show an error message to the user
        }
      };

      // ... render task list with delete buttons calling handleDelete ...
    }
    ```
  - See [Wasp Optimistic Updates Documentation](mdc:https:/wasp-lang.com/docs/advanced/optimistic-updates).

## Troubleshooting

- **Wasp Type/Import Errors:** If you encounter TypeScript errors related to missing Wasp imports (e.g., from `wasp/client/operations`, `wasp/entities`, `wasp/server`) or unexpected type mismatches after modifying [main.wasp](mdc:main.wasp) or [schema.prisma](mdc:schema.prisma) , **try restarting the Wasp development server** (stop `Ctrl+C` and run `wasp start` again) before further debugging. Wasp needs to regenerate code based on these changes.
- **Operations Not Working:**
  - Check that all required `entities` are listed in the operation's definition in [main.wasp](mdc:main.wasp).
  - Verify the import path (`fn: import { ... } from "@src/..."`) in [main.wasp](mdc:main.wasp) is correct.
  - Check for runtime errors in the Wasp server console where `wasp start` is running.
  - Ensure client-side calls match the expected arguments and types.
- **Auth Not Working:**
  - Verify the `auth` configuration in [main.wasp](mdc:main.wasp) (correct `userEntity`, `methods`, `onAuthFailedRedirectTo`).
  - Ensure `userEntity` in [main.wasp](mdc:main.wasp) matches the actual `User` model name in [schema.prisma](mdc:schema.prisma).
  - Check Wasp server logs for auth-related errors.
  - If using social auth, confirm environment variables (e.g., `GOOGLE_CLIENT_ID`) are correctly set (e.g., in a `.env.server` file) and loaded by Wasp.
- **Database Issues:**
  - Ensure your [schema.prisma](mdc:schema.prisma) syntax is correct.
  - Run `wasp db migrate-dev "Migration description"` after schema changes to apply them.
  - If using PostgreSQL, ensure the database server is running.
  - Check the `.env.server` file for the correct `DATABASE_URL`.
- **Build/Runtime Errors:**
  - Check import paths carefully (Wasp vs. relative vs. `@src/` rules, see [2-project-conventions.mdc](mdc:.claude/Rules/2-project-conventions.mdc) ).
  - Ensure all dependencies are installed (`npm install`).
  - Check the Wasp server console and the browser's developer console for specific error messages. 

  