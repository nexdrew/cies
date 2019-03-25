'use strict'

const test = require('tap').test
const cp = require('child_process')
const path = require('path')
const chalk = require('sywac-style-basic').chalk
const pkg = require('../package.json')

const parentPath = path.resolve(__dirname, '..')
const cliPath = path.join(parentPath, 'cli.js')
const wrapperPath = path.resolve(__dirname, 'wrapper.js')

function cli (args, useWrapper) {
  return new Promise((resolve, reject) => {
    cp.execFile(useWrapper ? wrapperPath : cliPath, args ? args.split(/\s/) : [], {
      encoding: 'utf8',
      env: Object.assign({}, process.env)
    }, (err, stdout, stderr) => {
      if (err) return reject(err)
      resolve({ stdout, stderr })
    })
  })
}

function withLineFeeds (array) {
  return array.concat('').join('\n')
}

test('default includes dependencies', t => {
  return cli().then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white latest-version}    {cyan prod} ${pkg.dependencies['latest-version']}`,
      chalk`{white ora}               {cyan prod} ${pkg.dependencies.ora}`,
      chalk`{white semver}            {cyan prod} ${pkg.dependencies.semver}`,
      chalk`{white sywac}             {cyan prod} ${pkg.dependencies.sywac}`,
      chalk`{white sywac-style-basic} {cyan prod} ${pkg.dependencies['sywac-style-basic']}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--dev includes dependencies and devDependencies', t => {
  return cli(`${parentPath} --dev`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white latest-version}    {cyan prod} ${pkg.dependencies['latest-version']}`,
      chalk`{white ora}               {cyan prod} ${pkg.dependencies.ora}`,
      chalk`{white semver}            {cyan prod} ${pkg.dependencies.semver}`,
      chalk`{white sywac}             {cyan prod} ${pkg.dependencies.sywac}`,
      chalk`{white sywac-style-basic} {cyan prod} ${pkg.dependencies['sywac-style-basic']}`,
      chalk`{white coveralls}         {magenta dev}  ${pkg.devDependencies.coveralls}`,
      chalk`{white mockery}           {magenta dev}  ${pkg.devDependencies.mockery}`,
      chalk`{white standard}          {magenta dev}  ${pkg.devDependencies.standard}`,
      chalk`{white standard-version}  {magenta dev}  ${pkg.devDependencies['standard-version']}`,
      chalk`{white tap}               {magenta dev}  ${pkg.devDependencies.tap}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--all includes everything defined', t => {
  return cli(`${parentPath} --all`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white latest-version}    {cyan prod} ${pkg.dependencies['latest-version']}`,
      chalk`{white ora}               {cyan prod} ${pkg.dependencies.ora}`,
      chalk`{white semver}            {cyan prod} ${pkg.dependencies.semver}`,
      chalk`{white sywac}             {cyan prod} ${pkg.dependencies.sywac}`,
      chalk`{white sywac-style-basic} {cyan prod} ${pkg.dependencies['sywac-style-basic']}`,
      chalk`{white coveralls}         {magenta dev}  ${pkg.devDependencies.coveralls}`,
      chalk`{white mockery}           {magenta dev}  ${pkg.devDependencies.mockery}`,
      chalk`{white standard}          {magenta dev}  ${pkg.devDependencies.standard}`,
      chalk`{white standard-version}  {magenta dev}  ${pkg.devDependencies['standard-version']}`,
      chalk`{white tap}               {magenta dev}  ${pkg.devDependencies.tap}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--sort sorts list', t => {
  return cli(`${parentPath} --all --sort`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white coveralls}         {magenta dev}  ${pkg.devDependencies.coveralls}`,
      chalk`{white latest-version}    {cyan prod} ${pkg.dependencies['latest-version']}`,
      chalk`{white mockery}           {magenta dev}  ${pkg.devDependencies.mockery}`,
      chalk`{white ora}               {cyan prod} ${pkg.dependencies.ora}`,
      chalk`{white semver}            {cyan prod} ${pkg.dependencies.semver}`,
      chalk`{white standard}          {magenta dev}  ${pkg.devDependencies.standard}`,
      chalk`{white standard-version}  {magenta dev}  ${pkg.devDependencies['standard-version']}`,
      chalk`{white sywac}             {cyan prod} ${pkg.dependencies.sywac}`,
      chalk`{white sywac-style-basic} {cyan prod} ${pkg.dependencies['sywac-style-basic']}`,
      chalk`{white tap}               {magenta dev}  ${pkg.devDependencies.tap}`
    ]))
    t.notOk(r.stderr)
  })
})

test('--terse prints uncolored names only', t => {
  return cli(`${parentPath} --all --terse`).then(r => {
    t.equal(r.stdout, withLineFeeds(['latest-version', 'ora', 'semver', 'sywac', 'sywac-style-basic', 'coveralls', 'mockery', 'standard', 'standard-version', 'tap']))
    t.notOk(r.stderr)
  })
})

test('fails if no package.json file', t => {
  return Promise.all([
    cli('dne').catch(err => {
      t.equal(err.code, 1)
      t.includes(err.message, `File ${path.join('dne', 'package.json')} does not exist :(`)
    }),
    cli('dne -v').catch(err => {
      t.equal(err.code, 1)
      t.includes(err.message, `File ${path.join('dne', 'package.json')} does not exist :(`)
    })
  ])
})

test('fails if package.json invalid json', t => {
  return cli(path.resolve(__dirname, 'invalid-json')).catch(err => {
    t.equal(err.code, 1)
    t.includes(err.message, 'Unexpected token')
  })
})

test('fails if package.json is a directory ¯\\_(ツ)_/¯', t => {
  return cli(path.resolve(__dirname)).catch(err => {
    t.equal(err.code, 1)
    t.includes(err.message, 'EISDIR')
  })
})

test('prints nothing if no dependencies', t => {
  return cli(path.resolve(__dirname, 'empty')).then(r => {
    t.equal(r.stdout, '')
    t.notOk(r.stderr)
  })
})

test('supports all dependency types', t => {
  return cli(`${path.resolve(__dirname, 'all')} -dpbos`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid}     {cyan prod}         ^2.0.0`,
      chalk`{white chai}                {magenta dev}          ^3.4.1`,
      chalk`{white chalk}               {magenta dev}          ^1.1.3`,
      chalk`{white cliui}               {cyan prod},{green bundled} ^3.2.0`,
      chalk`{white decamelize}          {cyan prod}         1.1.1`,
      chalk`{white dezalgo}             {green bundled}      unknown`,
      chalk`{white find-up}             {cyan prod},{magenta dev}     ^2.1.0`,
      chalk`{white fs-vacuum}           {green bundled}      unknown`,
      chalk`{white react}               {blue peer}         ^16.0.0`,
      chalk`{white react-dom}           {blue peer}         ^16.0.0`,
      chalk`{white react-router}        {yellow optional}     ^1.0.2`,
      chalk`{white redux-simple-router} {yellow optional}     ^1.0.1`,
      chalk`{white which}               {magenta dev}          ^1.2.9`,
      chalk`{white write-file-atomic}   {green bundled}      unknown`
    ]))
    t.notOk(r.stderr)
  })
})

test('-v looks up installed versions', t => {
  return cli(`${path.resolve(__dirname, 'all')} -asv`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid}     {cyan prod}         ^2.0.0  {inverse 2.0.1}         {blue 2.0.2}     {blue patch}`,
      chalk`{white chai}                {magenta dev}          ^3.4.1  {inverse not installed} {magenta 3.5.0}     {magenta in-range}`,
      chalk`{white chalk}               {magenta dev}          ^1.1.3  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white cliui}               {cyan prod},{green bundled} ^3.2.0  {inverse 3.3.0}         {yellow 3.4.0}     {yellow minor}`,
      chalk`{white decamelize}          {cyan prod}         1.1.1   {inverse 1.1.1}         {red 9.9.9}     {red major}`,
      chalk`{white dezalgo}             {green bundled}      unknown {inverse not installed} 9.9.9     ¯\\_(ツ)_/¯`,
      chalk`{white find-up}             {cyan prod},{magenta dev}     ^2.1.0  {inverse 2.1.0}         {green 2.1.0}`,
      chalk`{white fs-vacuum}           {green bundled}      unknown {inverse not installed} no latest ¯\\_(ツ)_/¯`,
      chalk`{white react}               {blue peer}         ^16.0.0 {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white react-dom}           {blue peer}         ^16.0.0 {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white react-router}        {yellow optional}     ^1.0.2  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white redux-simple-router} {yellow optional}     ^1.0.1  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white which}               {magenta dev}          ^1.2.9  {inverse not installed} {cyan 9.9.9}     {cyan out-of-range}`,
      chalk`{white write-file-atomic}   {green bundled}      unknown {inverse not installed} 9.9.9     ¯\\_(ツ)_/¯`
    ]))
    t.equal(r.stderr, chalk`- {white Loading versions}\n`)
  })
})

test('-m filters to deps requiring major bump', t => {
  return cli(`${path.resolve(__dirname, 'all')} -m`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white decamelize} {cyan prod} 1.1.1 {inverse 1.1.1} {red 9.9.9} {red major}`
    ]))
  })
})

test('-n filters to deps requiring minor bump', t => {
  return cli(`${path.resolve(__dirname, 'all')} -n`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white cliui} {cyan prod} ^3.2.0 {inverse 3.3.0} {yellow 3.4.0} {yellow minor}`
    ]))
  })
})

test('-f filters to deps requiring patch bump', t => {
  return cli(`${path.resolve(__dirname, 'all')} -f`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid} {cyan prod} ^2.0.0 {inverse 2.0.1} {blue 2.0.2} {blue patch}`
    ]))
  })
})

test('-c includes commands to update deps', t => {
  return cli(`${path.resolve(__dirname, 'all')} -c`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white @nexdrew/slugid} {cyan prod} ^2.0.0 {inverse 2.0.1} {blue 2.0.2} {blue patch}`,
      chalk`{white cliui}           {cyan prod} ^3.2.0 {inverse 3.3.0} {yellow 3.4.0} {yellow minor}`,
      chalk`{white decamelize}      {cyan prod} 1.1.1  {inverse 1.1.1} {red 9.9.9} {red major}`,
      chalk`{white find-up}         {cyan prod} ^2.1.0 {inverse 2.1.0} {green 2.1.0}`,
      '',
      'npm i -P @nexdrew/slugid@2.0.2 cliui@3.4.0',
      'npm i -EP decamelize@9.9.9'
    ]))
  })
})

test('-ct includes only commands to update deps', t => {
  return cli(`${path.resolve(__dirname, 'all')} -cat`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      'npm i -P @nexdrew/slugid@2.0.2',
      'npm i -BP cliui@3.4.0',
      'npm i -EP decamelize@9.9.9',
      'npm i -D chalk@9.9.9 which@9.9.9',
      'npm i -B dezalgo@9.9.9 fs-vacuum write-file-atomic@9.9.9',
      'npm i -O react-router@9.9.9 redux-simple-router@9.9.9'
    ]))
  })
})

test('-c tells you if there\'s nothing to update', t => {
  return cli(`${path.resolve(__dirname, 'all')} -cptx`, true).then(r => {
    t.equal(r.stdout, withLineFeeds([
      'Nothing to update :)'
    ]))
  })
})

test('supports alt bundleDependencies', t => {
  return cli(`${path.resolve(__dirname, 'bundle-alt')} -xb`).then(r => {
    t.equal(r.stdout, withLineFeeds([
      chalk`{white abbrev}     {green bundled} unknown`,
      chalk`{white ansi-regex} {green bundled} unknown`,
      chalk`{white ansicolors} {green bundled} unknown`,
      chalk`{white aproba}     {green bundled} unknown`
    ]))
    t.notOk(r.stderr)
  })
})
