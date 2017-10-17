'use strict'

const test = require('tap').test
const cies = require('../index')

test('works without opts', t => {
  return cies().then(deps => {
    t.same(deps, ['sywac'])
  })
})
