# Chromium Import Map Bug

This repository demonstrates a bug in import maps in Chromium-based browsers. It is a simplified version of a real-world issue that I hit when attempting to use import maps scopes to load two cloudpack-generated bundles on the same page.

## Repro Steps

1. Clone the repository
2. Run `npx http-server .`
3. Visit `http://localhost:8080` in a Chromium-based browser (e.g., Chrome, Edge) - you'll see `INCORRECT - Version 1`
4. Visit `http://localhost:8080` in a non-Chromium browser (e.g., Firefox) - you'll see `CORRECT - Version 2`

## Tweaks that fix the issue

1. Removing _either_ one of these lines from the import map:

    ```js
    "./__bundles__/asdfasdf/": {},
    "./__bundles__/qwerqwer/": {},
    ```

2. Renaming the `__bundles_` directory to something else, e.g., `packages`
3. Running the same code [on github pages](https://astegmaier.github.io/playground-import-maps/), which is deployed to a subfolder.
