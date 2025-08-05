# Create Vite Starter

A CLI tool to quickly create a new Vite + React + TypeScript project with modern tooling and best practices pre-configured.

## Features

- ⚡️ Vite for blazing fast development
- ⚛️ React 19 with TypeScript
- 🎨 Tailwind CSS for styling
- 🔧 ESLint + TypeScript ESLint for code quality
- 🎭 Shadcn UI components
- 🌗 Dark/Light mode out of the box
- 📱 Responsive layouts with modern CSS
- 🎯 Absolute imports
- 🔄 Hot Module Replacement
- 📦 Optimized production build

## Quick Start

```bash
npx create-vite-starter-ts@latest my-app
cd my-app
npm run dev
```

## Usage

You can create a new project in two ways:

### Interactive

```bash
npx create-vite-starter-ts@latest
```

This will guide you through project creation with interactive prompts.

### Direct

```bash
npx create-vite-starter-ts@latest my-app
```

This will create a new project in the `my-app` directory.

## Options

During the interactive setup, you'll be asked:

- **Project location**: Where to create the project (default: current directory)
- **Git initialization**: Whether to initialize a Git repository
- **Dependencies installation**: Whether to install dependencies automatically

The tool automatically detects your preferred package manager (npm, yarn, pnpm, or bun) and uses it for installation.

## Project Structure

```
my-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── providers/
│   │   ├── routes/
│   │   ├── shared/
│   │   └── ui/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
├── .eslintrc.js
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## Dependencies

### Core

- React 19
- TypeScript
- Vite

### UI & Styling

- Tailwind CSS
- Shadcn UI
- Radix UI Primitives
- Lucide Icons

### Development Tools

- ESLint
- TypeScript ESLint

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Author

**HimanshuKumarDutt094**

- GitHub: [@HimanshuKumarDutt094](https://github.com/HimanshuKumarDutt094)
- Repository: [vite-starter](https://github.com/HimanshuKumarDutt094/vite-starter)

## Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

````

- Run the unit tests:

```bash
npm run test
````

- Build the library:

```bash
npm run build
```
