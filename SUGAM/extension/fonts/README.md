# Bundled fonts

These fonts ship inside the extension so SUGAM works offline and never asks a font server about the pages people read.
All are licensed under the SIL Open Font License 1.1 (https://openfontlicense.org). Files are WOFF2 subsets taken from the
[Fontsource](https://fontsource.org) packages (same names and versions as the upstream projects). The licence texts are in `LICENSES.txt`.

| File | Family | Covers | Upstream |
| :--- | :--- | :--- | :--- |
| `lexend-*.woff2` | Lexend | Latin | https://github.com/googlefonts/lexend |
| `atkinson-hyperlegible-*.woff2` | Atkinson Hyperlegible | Latin | https://github.com/googlefonts/atkinson-hyperlegible |
| `opendyslexic-*.woff2` | OpenDyslexic | Latin | https://opendyslexic.org |
| `noto-sans-devanagari-*.woff2` | Noto Sans Devanagari | Hindi, rupee sign | https://github.com/notofonts/devanagari |
| `noto-sans-odia-*.woff2` | Noto Sans Odia | Odia | https://github.com/notofonts/oriya |

`-400` is regular weight and `-700` is bold. The `@font-face` rules are in `content/content.css`.
