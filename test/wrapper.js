#!/usr/bin/env node
'use strict'

const mockery = require('mockery')

mockery.enable()
mockery.warnOnUnregistered(false)
mockery.registerMock('latest-version', name => {
  switch (name) {
    case '@nexdrew/slugid':
      return Promise.resolve('2.0.2')
    case 'chai':
      return Promise.resolve('3.5.0')
    case 'cliui':
      return Promise.resolve('3.4.0')
    case 'find-up':
      return Promise.resolve('2.1.0')
    case 'fs-vacuum':
      return Promise.resolve()
  }
  return Promise.resolve('9.9.9')
})

require('../cli')()
