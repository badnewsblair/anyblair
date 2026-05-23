import StyleDictionary from 'style-dictionary';
import { formattedVariables } from 'style-dictionary/utils';

/**
 * Tredegar Design System — Style Dictionary build.
 * Canonical source: tokens/*.json (W3C DTCG format).
 * Output: src/tokens.css (:root custom properties, semantic tokens reference primitives).
 */

// Custom name transform: same as name/kebab, but drops a trailing "default"
// segment so semantic groups read as --color-background, --color-border, etc.
// (rather than --color-background-default). Single-segment tokens like
// `border-default` are left intact.
StyleDictionary.registerTransform({
  name: 'name/tredegar',
  type: 'name',
  transform: (token) => {
    let path = [...token.path];
    if (path.length > 1 && path[path.length - 1] === 'default') {
      path = path.slice(0, -1);
    }
    return path.join('-');
  },
});

// Start from the built-in `css` transform group and swap kebab naming
// for our custom name transform. The css group already handles colors,
// dimensions, fontFamily, cubic-bezier, and the border composite shorthand.
const cssTransforms = StyleDictionary.hooks.transformGroups['css'].map((t) =>
  t === 'name/kebab' ? 'name/tredegar' : t
);

// Dark theme format: emit the overridden tokens under both an explicit
// [data-theme="dark"] selector (manual toggle) and a prefers-color-scheme
// block scoped to :root:not([data-theme="light"]) (OS default, unless the
// visitor has explicitly chosen light).
StyleDictionary.registerFormat({
  name: 'css/dark-theme',
  format: ({ dictionary, options }) => {
    const vars = formattedVariables({
      format: 'css',
      dictionary,
      outputReferences: options.outputReferences,
      usesDtcg: true,
    });
    return (
      '/**\n * Tredegar Design System — dark theme (generated).\n' +
      ' * Do NOT edit by hand. Source: tokens/semantic.dark.json\n' +
      ' * Rebuild with: npm run tokens\n */\n\n' +
      `[data-theme="dark"] {\n${vars}\n}\n\n` +
      '@media (prefers-color-scheme: dark) {\n' +
      `  :root:not([data-theme="light"]) {\n${vars}\n  }\n}\n`
    );
  },
});

const sd = new StyleDictionary({
  // The light :root must NOT include the dark override file, or token paths collide.
  source: ['tokens/primitives.json', 'tokens/semantic.json'],
  log: { verbosity: 'verbose' },
  platforms: {
    css: {
      transforms: cssTransforms,
      buildPath: 'src/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            fileHeader: () => [
              'Tredegar Design System — generated tokens (light / default).',
              'Do NOT edit by hand. Source: tokens/primitives.json + semantic.json',
              'Rebuild with: npm run tokens',
            ],
          },
        },
      ],
    },
  },
});

// Dark theme has its own dictionary: primitives (for reference resolution) plus
// the dark semantic overrides, filtered so only the overrides are written out.
const sdDark = new StyleDictionary({
  source: ['tokens/primitives.json', 'tokens/semantic.dark.json'],
  log: { verbosity: 'verbose' },
  platforms: {
    cssDark: {
      transforms: cssTransforms,
      buildPath: 'src/',
      files: [
        {
          destination: 'tokens.dark.css',
          format: 'css/dark-theme',
          filter: (token) => token.filePath.endsWith('semantic.dark.json'),
          options: { outputReferences: true },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
await sdDark.buildAllPlatforms();
