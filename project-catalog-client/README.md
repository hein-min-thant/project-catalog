# Vite & HeroUI Template

This is a template for creating applications using Vite and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/frontio-ai/vite-template)

## Technologies Used

- [Vite](https://vitejs.dev/guide/)
- [HeroUI](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)

## How to Use

To clone the project, run the following command:

```bash
git clone https://github.com/frontio-ai/vite-template.git
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/frontio-ai/vite-template/blob/main/LICENSE).

```
project-catalog-client
├─ .npmrc
├─ eslint.config.mjs
├─ favicon.ico
├─ index.html
├─ LICENSE
├─ package.json
├─ postcss.config.js
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ App.tsx
│  ├─ assets
│  │  └─ fonts
│  │     ├─ Geist-VariableFont_wght.ttf
│  │     └─ GeistMono-VariableFont_wght.ttf
│  ├─ components
│  │  ├─ icons.tsx
│  │  ├─ navbar.tsx
│  │  ├─ primitives.ts
│  │  └─ theme-switch.tsx
│  ├─ config
│  │  └─ site.ts
│  ├─ layouts
│  │  └─ default.tsx
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ about.tsx
│  │  ├─ blog.tsx
│  │  ├─ docs.tsx
│  │  ├─ index.tsx
│  │  └─ pricing.tsx
│  ├─ provider.tsx
│  ├─ styles
│  │  └─ globals.css
│  ├─ types
│  │  └─ index.ts
│  └─ vite-env.d.ts
├─ tailwind.config.js
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts

```