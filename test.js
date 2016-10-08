var test = require("nrtv-test")(require)

function greet(name) {
  alert("hi, "+name)
}

// test.only("pass a string that evaluates to the function")

test.using(
  "raw arguments",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall(greet).withArgs(
        "string",
        functionCall.raw("event")
      )

    expect(call.evalable()).to.equal("greet(\"string\", event)")

    done()
  }
)
    
test.using(
  "arguments can be functions",

  ["./"],
  function(expect, done, functionCall) {

    var takesACallback = functionCall(
      function callIt(callback) {
        callback()
      }
    )

    var wit = takesACallback
    .withArgs(function() {
      alert("shabooya")
    })

    expect(wit.evalable()).to.match(/shabooya/)

    done()
  }
)


test.using(
  "arguments can be objects",

  ["./"],
  function(expect, done, functionCall) {

    var boundFunction = functionCall("program")

    var source = boundFunction.withArgs({a: 2, b: "hello", c: [1,"hi"]}).evalable()

    expect(source).to.contain("\"a\":2")

    done()
  }
)


test.using(
  "arguments can be undefined",

  ["./"],
  function(expect, done, functionCall) {

    var boundFunction = functionCall(greet)

    var source = boundFunction.withArgs(undefined, {}).evalable()

    expect(source).to.contain("undefined, {}")

    done()
  }
)



test.using(
  "pass a string that evaluates to the function",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("some.thing.weird")

    expect(call.evalable()).to.equal("some.thing.weird()")

    done()
  }
)


test.using(
  "method calls",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall(greet).methodCall("toString").withArgs(5)

    expect(call.evalable()).to.equal("greet.toString(5)")

    done()
  }
)



test.using(
  "bind methods to their instance",
  ["./"],
  function(expect, done, functionCall) {

    var singleton = functionCall(function program() {})
    singleton.isGenerator = true

    var source = singleton.methodCall("getProperty").withArgs(true).callable()

    expect(source).to.equal("program.getProperty.bind(program, true)")

    done()
  }
)