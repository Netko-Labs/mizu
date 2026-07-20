/// <reference types="vite/client" />

// wterm ships its stylesheet under a package subpath (not a `.css` file the
// bundler wildcard matches), so declare the side-effect module explicitly.
declare module '@wterm/react/css'
