# DPWH Project Delay Study

This is the website for our CMSC 170 project. It shows the dataset, the three models we compared, and how often each one caught a delay or raised a false alarm. The results include a comparison table, confusion matrices, and a chart of flags per 100 projects. See the [main README](../README.md) for the Python experiments.

## Run locally

With Node.js 24 installed, run these commands from the repository root.

```bash
cd website
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Build the site

From `website/`, run `npm run build` to write the production files to `dist/`. Run `npm run preview` to check the build locally. The site uses `/comparative-ml-study/` as its GitHub Pages base path.
