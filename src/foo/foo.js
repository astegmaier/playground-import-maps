import { bar } from 'bar';

export const foo = 'this came from foo.js, but it was imported with the bare specifier "foo"';

export const barFromFoo = `foo imported bar and go this: ${bar}`;