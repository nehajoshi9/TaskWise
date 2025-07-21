<<<<<<< HEAD
# TaskWise

**TaskWise** is a full-stack productivity app for managing tasks and notes, featuring a modern web app (Next.js), a mobile app (React Native/Expo), and a Convex backend with AI-powered features.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 📝 **Task Management**: Create, edit, delete, and organize tasks by category, priority, and tags.
- ⏰ **Focus Mode**: Pomodoro-style timer to help you focus on one task at a time.
- 🏷️ **Notes**: Add, edit, and delete notes with rich text support.
- 🔍 **Filtering**: Filter tasks by category, tag, and status.
- ✅ **Mark as Complete**: Easily mark tasks as complete/incomplete.
- 🔄 **Sync**: Real-time sync across web and mobile.
- 🤖 **AI Integration**: (Optional) Use OpenAI for smart suggestions and summaries.
- 🔒 **Authentication**: Secure login and user management.
- 🌐 **Cross-Platform**: Web (Next.js) and Mobile (Expo/React Native).

---

## Project Structure

```
narbhacks-main/
  apps/
    native/      # React Native (Expo) mobile app
    web/         # Next.js web app
  packages/
    backend/     # Convex backend (database, API, AI)
  ...
```

- **apps/web**: Next.js 15 web app (TypeScript, Tailwind CSS)
- **apps/native**: Expo React Native app (TypeScript)
- **packages/backend**: Convex backend (TypeScript, OpenAI integration)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile)
- [Convex CLI](https://docs.convex.dev/cli/install) (for backend)

### 1. Clone the Repo

```sh
git clone https://github.com/nehajoshi9/TaskWise.git
cd TaskWise
pnpm install
```

### 2. Set Up Environment Variables

- Copy `.env.example` to `.env.local` in each app and fill in your keys (Convex, Clerk, OpenAI, etc).

### 3. Start the Backend

```sh
cd packages/backend
npx convex dev
```

### 4. Start the Web App

```sh
cd apps/web
pnpm dev
# or
npm run dev
```

### 5. Start the Mobile App

```sh
cd apps/native
npx expo start
```

---

## Development

- **Web**: Next.js 15, TypeScript, Tailwind CSS
- **Mobile**: Expo, React Native, TypeScript
- **Backend**: Convex (TypeScript), OpenAI integration

### Useful Commands

- `pnpm install` — Install all dependencies
- `npx convex dev` — Start Convex backend (in `packages/backend`)
- `pnpm dev` — Start all apps (if you have a monorepo runner)
- `npx expo start` — Start Expo for mobile

---

## Tech Stack

- **Frontend**: Next.js, React Native, Expo, Tailwind CSS
- **Backend**: Convex (serverless DB & API)
- **AI**: OpenAI API (optional)
- **Auth**: Clerk.dev (or your provider)
- **Monorepo**: pnpm, TurboRepo

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

**Questions?**  
Open an issue or contact [@nehajoshi9](https://github.com/nehajoshi9) on GitHub.
=======
# TaskWise

**TaskWise** is a full-stack productivity app for managing tasks, featuring a modern web app (Next.js), a mobile app (React Native/Expo), and a Convex backend with AI-powered features.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Task Management**: Create, edit, delete, and organize tasks by category, priority, and tags.
- **Focus Mode**: Pomodoro-style timer to help you focus on one task at a time.
- **Notes**: Add, edit, and delete notes with rich text support.
- **Filtering**: Filter tasks by category, tag, and status.
- **Mark as Complete**: Easily mark tasks as complete/incomplete.
- **Sync**: Real-time sync across web and mobile.
- **AI Integration**: (Optional) Use OpenAI for smart suggestions and summaries.
- **Authentication**: Secure login and user management.
- **Cross-Platform**: Web (Next.js) and Mobile (Expo/React Native).

---

## Project Structure

```
narbhacks-main/
  apps/
    native/      # React Native (Expo) mobile app
    web/         # Next.js web app
  packages/
    backend/     # Convex backend (database, API, AI)
  ...
```

- **apps/web**: Next.js 15 web app (TypeScript, Tailwind CSS)
- **apps/native**: Expo React Native app (TypeScript)
- **packages/backend**: Convex backend (TypeScript, OpenAI integration)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile)
- [Convex CLI](https://docs.convex.dev/cli/install) (for backend)

### 1. Clone the Repo

```sh
git clone https://github.com/nehajoshi9/TaskWise.git
cd TaskWise
pnpm install
```

### 2. Set Up Environment Variables

- Copy `.env.example` to `.env.local` in each app and fill in your keys (Convex, Clerk, OpenAI, etc).

### 3. Start the Backend

```sh
cd packages/backend
npx convex dev
```

### 4. Start the Web App

```sh
cd apps/web
pnpm dev
# or
npm run dev
```

### 5. Start the Mobile App

```sh
cd apps/native
npx expo start
```

---

## Development

- **Web**: Next.js 15, TypeScript, Tailwind CSS
- **Mobile**: Expo, React Native, TypeScript
- **Backend**: Convex (TypeScript), OpenAI integration

### Useful Commands

- `pnpm install` — Install all dependencies
- `npx convex dev` — Start Convex backend (in `packages/backend`)
- `pnpm dev` — Start all apps (if you have a monorepo runner)
- `npx expo start` — Start Expo for mobile

---

## Tech Stack

- **Frontend**: Next.js, React Native, Expo, Tailwind CSS
- **Backend**: Convex (serverless DB & API)
- **AI**: OpenAI API (optional)
- **Auth**: Clerk.dev (or your provider)
- **Monorepo**: pnpm, TurboRepo

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

**Questions?**  
Open an issue or contact [@nehajoshi9](https://github.com/nehajoshi9) on GitHub.
>>>>>>> 3a0644916523d6817cdcfcb1f00a36a953a77b4a
