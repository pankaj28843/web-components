# Native web components

This is a private-use TypeScript library for small, portable custom elements.
The first component is `<wc-diff-viewer>`, a rich plain-text diff viewer that
ships as a minified `dist/share.js` bundle and an IIFE bundle for projects that
do not use a build tool.

## Development

```sh
pnpm install
pnpm validate
pnpm dev
```

Open the Vite demo at `http://127.0.0.1:5173/`. The no-bundler fixture is at
`/examples/consumer/index.html` after `pnpm build`.

## Consumer API

```html
<script src="./dist/share.iife.js"></script>
<wc-diff-viewer language="typescript"></wc-diff-viewer>
<script>
  const viewer = document.querySelector('wc-diff-viewer');
  viewer.oldText = 'const answer = 41;';
  viewer.newText = 'const answer = 42;';
  viewer.view = 'split';
  viewer.wrap = true;
</script>
```

The element exposes `oldText`, `newText`, `diffText`, `language`, `view`, and
`wrap` properties. `diffText` accepts a unified patch and is normalized into
the same line model as the old/new text path. The bundle registers the element
idempotently as `wc-diff-viewer` and exports the model helpers for module
consumers.

Highlighting is intentionally limited to JavaScript, TypeScript, JSON, CSS,
HTML/XML, Markdown, and a plain-text fallback. Caller text is never used as
trusted template markup; plain text is escaped and the controlled highlighter
is the only source of syntax markup.

## Release shape

- `dist/share.js`: minified ES module bundle.
- `dist/share.iife.js`: minified plain-script bundle.
- `dist/types/`: generated declarations and declaration maps.
- `examples/consumer/index.html`: no-bundler consumer fixture.

The repository is MIT licensed. The package remains private-use (`private:
true`) so it is not accidentally published to npm.
