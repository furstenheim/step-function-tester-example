const TestRunner = require('step-functions-tester')
const {expect} = require('chai')
let testRunner
describe('Test example', function () {
  this.timeout('60s')
  after('Tear down', async function () {
    await testRunner.tearDown()
  })

  before('Set up test runner', async function () {
    testRunner = new TestRunner()
    await testRunner.setUp({ defaultSubnet: '240.15.2.0' })
  })
  afterEach('Clean up', async function () {
    await testRunner.cleanUp()
  })

  it('Sample test', async function () {
    const {callStubs, stepFunctionDefinition, stepFunctionInput, executions: expectedExecutions} = getTest()
    const { executions, stepFunctionExecution, stepFunctionHistory } = await testRunner.run(callStubs, stepFunctionDefinition, stepFunctionInput)
    expect(stepFunctionExecution.status).equals('SUCCEEDED')
    expect(executions).deep.equal(expectedExecutions)
  })
})


function getTest () {
  return {
    name: 'Test with parameters',
      callStubs: {
    MyFirstLambda: [{ result: { count: 3 } }],
      FinalLambda: [{ result: {} }]
  },
    stepFunctionDefinition: {
      StartAt: 'FirstStep',
        States: {
        FirstStep: {
          Type: 'Task',
            Resource: 'MyFirstLambda',
            ResultPath: '$.firstResult',
            Next: 'SecondStep',
            TimeoutSeconds: 10
        },
        SecondStep: {
          Type: 'Choice',
            Choices: [
            {
              Variable: '$.firstResult.count',
              NumericGreaterThan: 4,
              Next: 'Final'
            },
            {
              Variable: '$.firstResult.count',
              NumericLessThanEquals: 4,
              Next: 'Final'
            }
          ]
        },
        Final: {
          Type: 'Task',
            Resource: 'FinalLambda',
            Parameters: {
            'SomeEndParameters.$': '$.firstResult.count'
          },
          End: true
        }
      }
    },
    stepFunctionInput: {},
    executions: [
      {
        payload: {},
        functionName: 'MyFirstLambda'
      },
      {
        payload: {
          SomeEndParameters: 3
        },
        functionName: 'FinalLambda'
      }
    ]
  }
}
