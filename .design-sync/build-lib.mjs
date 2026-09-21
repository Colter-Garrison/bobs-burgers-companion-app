// Packages the app's components as a library for the Claude Design sync
// (the sync consumes a built package: JS entry + .d.ts tree + stylesheet).
// The app itself has no library build, so this mirrors what Expo does for
// web: react-native -> react-native-web, NativeWind's jsx runtime (className
// -> DOM classes), Tailwind compiled from global.css. Expo Router is swapped
// for lib/expo-router-stub.tsx, since designs have no navigator.
//
// Output (gitignored): .design-sync/.cache/pkg/{package.json,dist/}
// Run from the repo root: node .design-sync/build-lib.mjs
// Needs the converter deps installed in .ds-sync/ (esbuild).
import { execFileSync } from 'node:child_process'
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

const ROOT = process.cwd()
const HERE = resolve(ROOT, '.design-sync')
const PKG = join(HERE, '.cache/pkg')
const DIST = join(PKG, 'dist')
const require = createRequire(join(ROOT, '.ds-sync/package.json'))
const esbuild = require('esbuild')

rmSync(PKG, { recursive: true, force: true })
mkdirSync(join(DIST, 'fonts'), { recursive: true })

// 1. JS: the components, bundled for the web. Only react/react-dom stay
// external - the sync's own bundler maps those to window.React/ReactDOM.
const stub = join(HERE, 'lib/expo-router-stub.tsx')

// The splash art is opaque PNG photos (4 MB); every design loads this bundle,
// so the library build embeds JPEG copies (~0.75 MB). App assets untouched.
// macOS sips only - elsewhere the PNGs are embedded as-is.
const jpegCopy = (png) => {
	const jpg = join(
		HERE,
		'.cache/images',
		png
			.split('/')
			.pop()
			.replace(/\.png$/, '.jpg'),
	)
	mkdirSync(dirname(jpg), { recursive: true })
	try {
		execFileSync(
			'sips',
			['-s', 'format', 'jpeg', '-s', 'formatOptions', '80', png, '--out', jpg],
			{ stdio: 'ignore' },
		)
		return jpg
	} catch {
		return png
	}
}
const iconsOnlyMci = join(HERE, '.cache/vector-icons-mci.js')
writeFileSync(
	iconsOnlyMci,
	"export { default as MaterialCommunityIcons } from '@expo/vector-icons/MaterialCommunityIcons'\n",
)
await esbuild
	.build({
		entryPoints: [join(HERE, 'lib/entry.tsx')],
		outfile: join(DIST, 'index.cjs'),
		bundle: true,
		// CommonJS, not ESM: several deps are CJS and call require('react');
	// with React external, ESM output turns those into runtime requires the
	// browser can't run. The sync's bundler resolves plain requires fine.
	format: 'cjs',
		platform: 'browser',
		jsx: 'automatic',
		jsxImportSource: 'nativewind',
		external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
		nodePaths: [join(ROOT, 'node_modules')],
		alias: { 'react-native': 'react-native-web' },
		// Exact-name swaps (esbuild's alias matches by prefix, which would also
		// catch the shim's own '@expo/vector-icons/MaterialCommunityIcons').
		plugins: [
			{
				name: 'exact-swaps',
				setup(build) {
					const swaps = {
						'expo-router': stub,
						'expo-router/drawer': stub,
						'expo-router/react-navigation': stub,
						// The package root imports every icon family's font; the app
						// only uses MaterialCommunityIcons.
						'@expo/vector-icons': iconsOnlyMci,
					}
					build.onResolve({ filter: /assets\/images\/.*\.png$/ }, (args) => ({
						path: jpegCopy(resolve(args.resolveDir, args.path)),
					}))
					build.onResolve(
						{
							filter:
								/^(expo-router(\/drawer|\/react-navigation)?|@expo\/vector-icons)$/,
						},
						(args) => ({ path: swaps[args.path] }),
					)
				},
			},
		],
		resolveExtensions: [
			'.web.tsx',
			'.web.ts',
			'.web.jsx',
			'.web.js',
			'.tsx',
			'.ts',
			'.jsx',
			'.js',
			'.mjs',
			'.json',
		],
		mainFields: ['browser', 'module', 'main'],
		loader: {
			'.js': 'jsx',
			'.ttf': 'dataurl',
			'.png': 'dataurl',
			'.jpg': 'dataurl',
		},
		define: {
			__DEV__: 'false',
			'process.env.NODE_ENV': '"production"',
			'process.env.EXPO_OS': '"web"',
			global: 'globalThis',
		},
		logLevel: 'warning',
		metafile: true,
	})
	.then((r) => {
		writeFileSync(
			join(HERE, '.cache/lib-meta.json'),
			JSON.stringify(r.metafile),
		)
	})

// 2. CSS: Tailwind with the app's own config, scanning the components and
// the authored previews, plus @font-face for the app's fonts.
const twConfig = join(HERE, '.cache/tailwind.config.cjs')
writeFileSync(
	twConfig,
	`const base = require(${JSON.stringify(join(ROOT, 'tailwind.config.js'))})
module.exports = { ...base, content: ${JSON.stringify([
		join(ROOT, 'components/**/*.{ts,tsx}'),
		join(HERE, 'previews/**/*.tsx'),
	])} }
`,
)
execFileSync(
	join(ROOT, 'node_modules/.bin/tailwindcss'),
	[
		'-c',
		twConfig,
		'-i',
		join(ROOT, 'global.css'),
		'-o',
		join(DIST, 'tailwind.css'),
	],
	{ stdio: ['ignore', 'ignore', 'inherit'] },
)
const fonts = ['Chewy', 'BobsBurgers', 'BobsBurgers2']
for (const f of fonts) {
	cpSync(join(ROOT, `assets/fonts/${f}.ttf`), join(DIST, `fonts/${f}.ttf`))
}
writeFileSync(
	join(DIST, 'styles.css'),
	fonts
		.map(
			(f) =>
				`@font-face{font-family:"${f}";src:url("./fonts/${f}.ttf") format("truetype");font-display:block}`,
		)
		.join('\n') +
		'\n' +
		readFileSync(join(DIST, 'tailwind.css'), 'utf8'),
)
rmSync(join(DIST, 'tailwind.css'))

// 3. Types: declarations from the real sources (the stub is runtime-only).
const tsconfig = join(HERE, '.cache/tsconfig.lib.json')
writeFileSync(
	tsconfig,
	JSON.stringify({
		extends: join(ROOT, 'tsconfig.json'),
		compilerOptions: {
			noEmit: false,
			declaration: true,
			emitDeclarationOnly: true,
			rootDir: ROOT,
			outDir: join(DIST, 'types'),
		},
		include: [
			join(HERE, 'lib/entry.tsx'),
			join(ROOT, 'nativewind-env.d.ts'),
			join(ROOT, '.expo/types/**/*.ts'),
		],
		exclude: [],
	}),
)
execFileSync(join(ROOT, 'node_modules/.bin/tsc'), ['-p', tsconfig], {
	stdio: 'inherit',
})
const typesEntry = 'dist/types/.design-sync/lib/entry.d.ts'
if (!existsSync(join(PKG, typesEntry))) {
	throw new Error(`declarations missing: ${typesEntry}`)
}

writeFileSync(
	join(PKG, 'package.json'),
	JSON.stringify(
		{
			name: 'bobs-burgers-components',
			version: JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
				.version,
			private: true,
			main: 'dist/index.cjs',
			types: typesEntry,
			style: 'dist/styles.css',
		},
		null,
		2,
	) + '\n',
)
console.log(`built ${dirname(typesEntry)} + dist/index.cjs + dist/styles.css`)
