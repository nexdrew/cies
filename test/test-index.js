'use strict'

const test = require('tap').test
const cies = require('../index')
const pkg = require('../package.json')

test('works without opts', t => {
  return cies().then(deps => {
    t.same(deps, [
      {
        name: 'chalk',
        semver: pkg.dependencies.chalk,
        types: ['prod']
      },
      {
        name: 'latest-version',
        semver: pkg.dependencies['latest-version'],
        types: ['prod']
      },
      {
        name: 'ora',
        semver: pkg.dependencies.ora,
        types: ['prod']
      },
      {
        name: 'semver',
        semver: pkg.dependencies.semver,
        types: ['prod']
      },
      {
        name: 'sywac',
        semver: pkg.dependencies.sywac,
        types: ['prod']
      }
    ])
  })
})
