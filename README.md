# Chromium Import Map Bug

This repository demonstrates a bug in import maps in Chromium-based browsers. It is a simplified version of a real-world issue that I hit when attempting to use import maps scopes to load two cloudpack-generated bundles on the same page.

## Repro Steps

1. Clone the repository
2. Run `npx http-server .`
3. Visit `http://localhost:8080` in a Chromium-based browser (e.g., Chrome, Edge) - you'll see `INCORRECT - Version 1`
4. Visit `http://localhost:8080` in a non-Chromium browser (e.g., Firefox) - you'll see `CORRECT - Version 2`

## Description

The project contains the following import map:

```json
{
    "scopes": {
        "./__bundles__/asdfasdf/": {}, // <-- this is unused, and should be ignored, but it somehow causes things to blow up.
        "./__bundles__/qwerqwer/": {}, // <-- same for this line
        "./__bundles__/foo/": {
        "bar": "./__bundles__/bar/version2/index.js"
        },
        "./__bundles__/": {
        "bar": "./__bundles__/bar/version1/index.js"
        }
    }
}
```

The expected behavior is that when `bar` is imported from `foo`, we get version 2 instead of version 1. But in Chromium, it gives version 1 instead. Firefox works fine.

## Tweaks that fix the issue

Surprisingly, the tweaks to the import map below (which at first glance look irrelevant to the semantic meaning of the `importmap`) will make the problem go away. Although they would work to fix this simplified example, in the real application, the importmaps are generated automatically by [cloudpack](https://github.com/microsoft/cloudpack), and the lines analogous to `./__bundles__/asdfasdf/` are essential to the functionality of the application.

1. Removing _either_ one of these lines from the import map:

    ```js
    "./__bundles__/asdfasdf/": {},
    "./__bundles__/qwerqwer/": {},
    ```

2. Renaming the `__bundles_` directory to something else, e.g., `packages`
3. Running the same code [on github pages](https://astegmaier.github.io/playground-import-maps/), which is deployed to a subfolder.

## Tweaks that do _not_ fix the issue

Changing the order of the extra import map scopes (i.e. moving `"./__bundles__/asdfasdf/": {}` or `"./__bundles__/qwerqwer/": {}`) to other locations in the map does _not_ fix the issue, which suggests it may have a different root cause than [Issue 406357273: Is not used the most specific scope path when multiple scopes match the referrer URL in import map](https://issues.chromium.org/issues/406357273)

## Possible root cause

I suspect that the problem is in the way that the [sort and normalize scope keys](https://html.spec.whatwg.org/multipage/webappapis.html#sorting-and-normalizing-scopes) spec is implemented. That spec notes that:

> In the above two algorithms, sorting keys and scopes in descending order has the effect of putting "foo/bar/" before "foo/". This in turn gives "foo/bar/" a higher priority than "foo/" during module specifier resolution.

In other words, the sorting algorithm is what determines scope priority, which is not correct in this case.

In looks like chromium's implementation of this algorithm is in [/third_party/blink/renderer/core/script/import_map.cc:242-323](https://chromium.googlesource.com/chromium/src/+blame/refs/heads/main/third_party/blink/renderer/core/script/import_map.cc#242) (i.e. everything that builds the `normalized_scopes_map`)
