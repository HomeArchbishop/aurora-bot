import fs from 'fs'
import path from 'path'
import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

const buildDir = path.join(__dirname, '..', 'build')

if (fs.existsSync(buildDir)) {
  console.log('Existing build folder found. Deleting...')
  fs.rmSync(buildDir, { recursive: true, force: true })
}

console.log('Creating build folder...')
fs.mkdirSync(buildDir)

console.log('Building bundle...')

const inputOptions = {
  input: 'src/index.ts',
  plugins: [
    resolve({
      resolveOnly: ['aurorax'],
    }),
    commonjs(),
    typescript(),
    json(),
  ],
}

const outputOptionsList = [
  {
    output: {
      file: path.join(buildDir, 'src/index.js'),
      format: 'esm',
    },
  },
]

await rollupBuild()

async function rollupBuild () {
  let bundle
  try {
    bundle = await rollup(inputOptions)
    for (const outputOptions of outputOptionsList) {
      await bundle.write(outputOptions.output)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
  await bundle?.close()
}

console.log('Building package.json...')

const thisPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')))
const auroraxPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../node_modules/aurorax/package.json')))
thisPackageJson.dependencies = auroraxPackageJson.dependencies
thisPackageJson.devDependencies = auroraxPackageJson.devDependencies
fs.writeFileSync(path.join(buildDir, 'package.json'), JSON.stringify(thisPackageJson, null, 2))

console.log('Building .env...')
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8')
const envLines = env.split('\n')
envLines.unshift(`VERSION=${thisPackageJson.version}`)
envLines.unshift(`BUILD_TIME=${new Date().toISOString()}`)
fs.writeFileSync(path.join(buildDir, '.env'), envLines.join('\n'))

console.log('Building build-info...')
const buildInfo = [
  `VERSION=${thisPackageJson.version}`,
  `BUILD_TIME=${new Date().toISOString()}`,
]
fs.writeFileSync(path.join(buildDir, 'build-info'), buildInfo.join('\n'))

console.log(`Built successfully to ${buildDir}. Version: ${thisPackageJson.version}. Build time: ${new Date().toISOString()}.`)
