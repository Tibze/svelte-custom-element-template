const svelte = require('rollup-plugin-svelte')
const sveltePreprocess = require('svelte-preprocess')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const css = require('rollup-plugin-css-only')
const replace = require('@rollup/plugin-replace')
const livereload = require('rollup-plugin-livereload')
const terser = require('rollup-plugin-terser').terser
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const packageJson = require('../package.json')

const appPath = path.resolve(__dirname, '../')
const production = !process.env.ROLLUP_WATCH
const buildPath = 'dist'
const sourcePath = 'src'
const entryPoint = `${appPath}/src/index.svelte`
const entryPointRegexp = /index\.svelte$/
const moduleName = packageJson.name
// Replace special characters for allowing scoped packages like "@scope/package"
const displayModuleName = moduleName.replace('@', '').replace('/', '-')
const moduleVersion = packageJson.version

// Used for package.json "main" property
const moduleFile = `${buildPath}/${displayModuleName}.js`

const bundleName = `${displayModuleName}.${moduleVersion}.js`

const outputOptions = {
    sourcemap: true,
    format: 'iife',
    name: 'App',
    file: `${buildPath}/${bundleName}`,
}

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--serve'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

/*export default {
    input: 'src/index.svelte',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: `public/build/wc/${name}-${version}.js`
    },
    plugins: [
        svelte({
            compilerOptions: {
                customElement: true,
                // enable run-time checks when not in production
                dev: !production
            }
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: 'bundle.css' }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs(),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};*/
async function buildWebComponent({ minify }) {
    // 1. Create a bundle
    const bundle = await rollup.rollup({
        input: entryPoint,
        plugins: [
            svelte({
                compilerOptions: {
                    dev: true,

                    // all nested child elements are built as normal svelte components
                    customElement: false,
                },
                emitCss: true,
                exclude: entryPointRegexp,
                preprocess: sveltePreprocess(),
            }),
            svelte({
                compilerOptions: {
                    // enable run-time checks when not in production
                    dev: true,

                    // we're generating a -- Web Component -- from index.svelte
                    customElement: true,
                },
                emitCss: false,
                include: entryPointRegexp,
                preprocess: sveltePreprocess(),
            }),

            // HACK! Inject nested CSS into custom element shadow root
            css({
                output(nestedCSS, styleNodes, bundle) {
                    const code = bundle[bundleName].code
                    const escapedCssChunk = nestedCSS
                        .replace(/\n/g, '')
                        .replace(/[\\"']/g, '\\$&')
                        .replace(/\u0000/g, '\\0')

                    const matches = code.match(
                        minify
                            ? /.shadowRoot.innerHTML='<style>(.*)<\/style>'/
                            : /.shadowRoot.innerHTML = "<style>(.*)<\/style>"/,
                    )

                    if (matches && matches[1]) {
                        const style = matches[1]
                        bundle[bundleName].code = code.replace(
                            style,
                            `${style}${escapedCssChunk}`,
                        )
                    } else {
                        throw new Error(
                            "Couldn't shadowRoot <style> tag for injecting styles",
                        )
                    }
                },
            }),

            // HACK! Fix svelte/transitions in web components

            // Use shadow root instead of document for transition style injecting
            replace({
                '.ownerDocument': '.getRootNode()',
                delimiters: ['', ''],
            }),

            // Append styles to shadow root
            replace({
                '.head.appendChild': '.appendChild',
                delimiters: ['', ''],
            }),

            // END HACK

            json(),

            // If you have external dependencies installed from
            // npm, you'll most likely need these plugins. In
            // some cases you'll need additional configuration -
            // consult the documentation for details:
            // https://github.com/rollup/plugins/tree/master/packages/commonjs
            nodeResolve({
                browser: true,
                dedupe: ['svelte'],
            }),

            commonjs(),

            // transpile to ES2015+
            babel({
                extensions: ['.js', '.mjs', '.html', '.svelte'],
                babelHelpers: 'runtime',
            }),

            // Watch the `public` directory and refresh the
            // browser on changes when not in production
            livereload(sourcePath),

            // If we're building for production (npm run build
            // instead of npm run dev), minify
            // minify && terser(),
        ],
    })

    // 2. Generate output specific code in-memory
    // you can call this function multiple times on the same bundle object
    const { output } = await bundle.generate(outputOptions)
    const { code, map } = output[0]

    // 3. Write bundles into files
    const fileName = minify
        ? `${outputOptions.file.replace('.js', '.min.js')}`
        : outputOptions.file

    // Normal bundle
    fs.writeFile(fileName, code, err => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
    })

    // Only create .map.js when code is minified
    if (minify) {
        fs.writeFile(fileName.replace('.js', '.js.map'), map.toString(), err => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
        })
    }

    // Generic bundle for using as module entry point
    if (!minify) {
        fs.writeFile(moduleFile, code, err => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
        })
    }
}

async function main() {
    try {
        shell.mkdir('-p', buildPath)

        // builds readable bundle of the web component
        await buildWebComponent({ minify: false })

        // builds minified bundle with sourcemap
        await buildWebComponent({ minify: true })
    } catch (ex) {
        console.error(ex)
        process.exit(1)
    }
}

main()
