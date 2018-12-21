#!/usr/bin/env node
'use strict'

const cliStyle = require('sywac-style-basic')
const chalk = cliStyle.chalk
const colors = {
  prod: 'cyan',
  dev: 'magenta',
  peer: 'blue',
  bundled: 'green',
  optional: 'yellow'
}

let opts, spinner
const cli = require('sywac')
  .preface(null, chalk.white.underline('List dependencies from package.json'))
  .positional('[dir]', {
    paramsDesc: 'Optional path to directory containing package.json'
  })
  .boolean('-d, --dev', {
    desc: 'Include devDependencies'
  })
  .boolean('-p, --peer', {
    desc: 'Include peerDependencies'
  })
  .boolean('-b, --bundled', {
    desc: 'Include bundledDependencies'
  })
  .boolean('-o, --optional', {
    desc: 'Include optionalDependencies'
  })
  .boolean('-a, --all', {
    desc: 'Include dependencies from all types'
  })
  .boolean('-x, --exclusive', {
    desc: 'Exclude production dependencies'
  })
  .boolean('-s, --sort', {
    desc: 'Sort list before printing'
  })
  .boolean('-v, --versions', {
    desc: 'Lookup installed and latest versions'
  })
  .boolean('-m, --major', {
    desc: 'Only deps behind by major version'
  })
  .boolean('-n, --minor', {
    desc: 'Only deps behind by minor version'
  })
  .boolean('-f, --patch', {
    desc: 'Only deps behind by patch version'
  })
  .boolean('-c, --command', {
    desc: 'Print commands to update to latest'
  })
  .boolean('-t, --terse', {
    desc: 'Print names/commands only, no color'
  })
  .help('-h, --help', {
    desc: 'Print this help content',
    implicitCommand: false
  })
  .version('-V, --version', {
    desc: 'Print cies program version',
    implicitCommand: false
  })
  .outputSettings({ maxWidth: 66 })
  .style(cliStyle)

module.exports = function run () {
  return cli
    .parseAndExit()
    .then(argv => {
      opts = argv
      if (opts.command) opts.versions = true // have to check versions in order to determine command
      if (!opts.terse && opts.versions) {
        spinner = require('ora')({ text: chalk.white('Loading versions'), color: 'green', spinner: 'arrow3' }).start()
      }
      return require('./index')(opts)
    })
    .then(deps => {
      let nameLen = 0
      let typeLen = 0
      let semvLen = 0
      let versLen = 0
      let lateLen = 0
      deps.forEach(d => {
        if (opts.terse && !opts.command) return console.log(d.name)
        nameLen = Math.max(nameLen, d.name.length)
        d.typeString = d.types.join(',')
        typeLen = Math.max(typeLen, d.typeString.length)
        semvLen = Math.max(semvLen, d.semver.length)
        if (d.version) versLen = Math.max(versLen, d.version.length)
        if (d.latest) lateLen = Math.max(lateLen, d.latest.length)
      })

      const dcolorMap = new Map([
        [/pre/, 'white'],
        [/major/, 'red'],
        [/minor/, 'yellow'],
        [/patch/, 'blue'],
        [/out/, 'cyan'],
        [/in/, 'magenta']
      ])
      const noop = x => x
      function dcolor (diff) {
        if (!diff) return chalk.green
        for (let [regex, color] of dcolorMap) {
          if (regex.test(diff)) return chalk[color]
        }
        return noop
      }

      let sv
      function semver () {
        if (!sv) sv = require('semver')
        return sv
      }

      let name, type, semv, versions, diffColor, needsUpdate, updateFlags
      deps.forEach(d => {
        if (!opts.terse) {
          name = chalk.white(d.name) + new Array(nameLen - d.name.length + 2).join(' ')
          type = d.types.map(type => chalk[colors[type]](type)).join(',') + new Array(typeLen - d.typeString.length + 2).join(' ')
          semv = d.semver
        }
        if (d.version) {
          versions = new Array(semvLen - d.semver.length + 2).join(' ') + chalk.inverse(d.version)
          diffColor = dcolor(d.diff)
          versions += new Array(versLen - d.version.length + 2).join(' ') + diffColor(d.latest)
          if (d.diff) {
            versions += new Array(lateLen - d.latest.length + 2).join(' ') + diffColor(d.diff)
            if (opts.command && d.diff !== 'in-range') {
              updateFlags = d.types.map(type => {
                switch (type) {
                  case 'prod':
                    return 'P'
                  case 'dev':
                    return 'D'
                  case 'optional':
                    return 'O'
                  case 'bundled':
                    return 'B'
                }
                return null
              }).filter(Boolean)
              if (updateFlags.length && semver().validRange(d.semver) === d.semver) updateFlags.push('E')
              if (updateFlags.length) {
                updateFlags = updateFlags.sort().join('')
                if (!needsUpdate) needsUpdate = {}
                // needsUpdate[updateFlags] = (needsUpdate[updateFlags] || []).concat(d.name + '@latest')
                needsUpdate[updateFlags] = (needsUpdate[updateFlags] || []).concat(d.name + (d.latest === 'no latest' ? '' : '@' + d.latest))
              }
            }
          }
        } else {
          versions = ''
        }
        if (spinner) spinner.stop()
        if (!opts.terse) console.log(name + type + semv + versions)
      })
      if (opts.command) {
        if (!opts.terse) console.log() // empty line
        if (!needsUpdate) console.log('Nothing to update :)')
        else {
          for (let [flags, pkgs] of Object.entries(needsUpdate)) {
            console.log(`npm i -${flags} ` + pkgs.join(' '))
          }
        }
      }
    })
    .catch(err => {
      if (spinner) spinner.stop()
      console.error(typeof err === 'string' ? chalk.red(err) : err)
      process.exitCode = 1
    })
}

if (require.main === module) module.exports()
