var _ = require('lodash')

module.exports = function (testModules, helper) {
  return [
    actionForHelper(helper.beforeAll, 'global beforeAll', null, helper.file),
    actionsForTestModules(testModules, helper),
    actionForHelper(helper.afterAll, 'global afterAll', null, helper.file)
  ]
}

var actionsForTestModules = function (testModules, helper) {
  return _.map(testModules, function (testModule) {
    return [
      actionForHelper(testModule.beforeAll, 'module beforeAll', null, testModule.file),
      actionsForTestFunctions(testModule, helper),
      actionForHelper(testModule.afterAll, 'module afterAll', null, testModule.file)
    ]
  })
}

var actionsForTestFunctions = function (testModule, helper) {
  return _.map(testModule.tests, function (test) {
    return [
      actionForHelper(helper.beforeEach, 'global beforeEach', test.context, helper.file),
      actionForHelper(testModule.beforeEach, 'module beforeEach', test.context, testModule.file),
      actionForTest(test),
      actionForHelper(helper.afterEach, 'global afterEach', test.context, helper.file),
      actionForHelper(testModule.afterEach, 'module afterEach', test.context, testModule.file)
    ]
  })
}

var actionForHelper = function (helperFunc, desc, context, file) {
  var action = {
    description: 'test hook: ' + desc + (file ? ' defined in `' + file + '`' : ''),
    callable: helperFunc.bind(context || {}),
    successHandler: function (log) {},
    failureHandler: function (log) {},
    errorHandler: function (log, e) {
      if (e) {
        log(' An error occurred in ' + action.description)
        log('  ---')
        log('  message: ' + e.message || e.toString())
        log('  stacktrace:', e.stack)
        log('  ...')
      }
    }
  }

  return action
}

var actionForTest = function (test) {
  var action = {
    description: test.description,
    callable: test.testFunction.bind(test.context),
    successHandler: function (log) {
      log('ok ' + action.description)
    },
    failureHandler: function (log) {
      log('not ok ' + action.description)
    },
    errorHandler: function (log, e) {
      if (e) {
        log('  ---')
        log('  message: ' + e.message || e.toString())
        log('  stacktrace:', e.stack)
        log('  ...')
      }
    }
  }

  return action
}
