# Native web components

`<wc-diff-viewer>` renders a standard Git unified diff as a GitHub-style
changed-files review: file navigation, status and mode metadata, hunk headers,
old/new line gutters, unified or split view, responsive fallback, search, copy,
and safe path-based syntax highlighting.

## Minimal consumer

```html
<wc-diff-viewer id="review"></wc-diff-viewer>
<script type="module">
  import './dist/share.js';
  const patch = `diff --git a/app.ts b/app.ts
--- a/app.ts
+++ b/app.ts
@@ -1 +1 @@
-export const answer = 41;
+export const answer = 42;`;
  document.querySelector('#review').diffText = patch;
</script>
```

The element accepts `diffText` for a unified patch and also retains
`oldText`/`newText` for direct text comparisons. Optional properties and
attributes are `language="auto"`, `view="unified" | "split"`, `wrap`, `title`,
`old-label`, `new-label`, and `path`. An explicit language wins; otherwise the
file basename and extension choose a controlled highlighter, with plaintext as
the safe fallback.

## Development

```sh
pnpm install
pnpm validate
pnpm dev
```

The no-bundler fixture is at `/examples/consumer/index.html` after `pnpm build`.
The public package is MIT licensed and publishes the generated ES module,
IIFE, and type declarations under `dist/`.

## Benchmark

The repository is validated against a local capsule corpus of twenty mature,
high-star open-source repositories and discussion-heavy pull requests. The
corpus includes additions, deletions, renames, binary/generated files,
no-newline markers, small reviews, and large multi-language reviews. It is
kept outside the public package repository; run the corpus gate with:

```sh
DIFF_BENCHMARK_ROOT=/path/to/capsule/research/benchmark pnpm vitest run tests/benchmark-fixtures.test.ts
```

Use the generated `dist/share.js` for module consumers or
`dist/share.iife.js` for a plain script tag.
