const esbuild = require('esbuild')
const fs = require('fs-extra');

// remove old dist dir
fs.removeSync("./dist")

// build src
esbuild.build({
  entryPoints: ["index.js"],
  outbase: '.',
  outdir: './dist',

  platform: "node",
  target: ["node12"],
  format: "cjs",

  external: ['fsevents'],

  bundle: true,
  minify: false,
  sourcemap: "external",

  logLevel: "silent",

  plugins: [
    {
      name: "__dirname-replace-plugin",
      setup(build) {
        const fs = require('fs-extra')
        const path = require('path')
        
        const replacer = (args) => () => (
          `{process.cwd()}/${path.relative(process.cwd(), path.dirname(args.path))}`
        )

        build.onLoad({ filter: /\.js$/, }, async (args) => {
          const source = await fs.promises.readFile(args.path, 'utf8')
          const contents = source.replace(/\{__dirname\}/gm, replacer(args))
          return { contents }
        })
      }
    },
  ]
}).then(() => {
  console.log(`build succeeded`);
}).catch(() => {
})

// copy static files
for (const file of [
  "package.json",
  "README.md",
]) {
  fs.copySync(`./${file}`, `./dist/${file}`)
}
