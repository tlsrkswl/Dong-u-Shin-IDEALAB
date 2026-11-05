# PDF.js browser distribution

Vendored from the official `pdfjs-dist@6.4.299` npm package. `version.json` records the registry URL and npm SHA-512 integrity. npm verified the package during installation. The Apache-2.0 license and bundled font/decoder notices are included.

The viewer imports the minified browser build and worker, with local CMaps, standard fonts, WebAssembly decoders and ICC profiles. `text-layer.css` is the base `.textLayer` rule from the package's `web/pdf_viewer.css`. No package installation, build or external CDN is required to use the deployed site.

To reproduce the source distribution in a temporary directory:

```sh
npm install --prefix /tmp/idealab-pdf-viewer --cache /tmp/idealab-npm-cache --ignore-scripts --omit=optional --no-audit --no-fund pdfjs-dist@6.4.299
```

Copy `build/pdf.min.mjs`, `build/pdf.worker.min.mjs`, `cmaps/`, `standard_fonts/`, `wasm/`, `iccs/`, and `LICENSE`. Preserve package integrity checks when updating the distribution and verify the existing presentation renders correctly, including Korean text.
