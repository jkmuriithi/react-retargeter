# react-retargeter

A React PWA which demonstrates content-aware image resizing in real time.

## Built With

-   Platform
    -   [NodeJS 16](https://nodejs.org/en/)
-   Languages
    -   [TypeScript](https://www.typescriptlang.org/)
-   Frontend
    -   Client-Side Framework: [React](https://beta.reactjs.org/)
    -   Development Framework: [Vite](https://vitejs.dev/) w/ [Vite PWA](https://vite-plugin-pwa.netlify.app/)
    -   Design System: [React Bootstrap](https://react-bootstrap.github.io/) w/ [Bootswatch Flatly](https://bootswatch.com/flatly/)
    -   Icons: [React Icons - Bootstrap](https://react-icons.github.io/react-icons)
-   Web APIs
    -   [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
    -   [Resize Observer](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API)

## Running Locally

Make sure you have [pnpm](https://pnpm.io/installation) installed before
beginning local development.

```bash
# Clone the repo
git clone https://github.com/jkmuriithi/react-retargeter.git
cd react-retargeter

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Check out the project's `package.json` for a full list of available NPM scripts.

**Note:** The app's service worker may throw some configuration errors when you
first launch the development server. These should disappear if you kill the
server and restart it.
