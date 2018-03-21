'use strict'

const test = require('tap').test
const cies = require('../index')

test('works without opts', t => {
  return cies().then(deps => {
    t.same(deps, [
      {
        name: 'chalk',
        semver: '^2.3.2',
        types: ['prod']
      },
      {
        name: 'latest-version',
        semver: '^3.1.0',
        types: ['prod']
      },
      {
        name: 'ora',
        semver: '^2.0.0',
        types: ['prod']
      },
      {
        name: 'semver',
        semver: '^5.5.0',
        types: ['prod']
      },
      {
        name: 'sywac',
        semver: '^1.2.0',
        types: ['prod']
      }
    ])
  })
})
