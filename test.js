var runTest = require("run-test")(require)

function greet(name) {
  alert("hi, "+name)
}


runTest(
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


runTest(
  "arguments can be function calls",

  ["./"],
  function(expect, done, functionCall) {

    var shabooya = functionCall("shabooya")

    var withArg = functionCall("foo").withArgs(shabooya)

    expect(withArg.evalable()).to.equal("foo(shabooya)")

    done()
  }
)


runTest(
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


runTest(
  "arguments can be objects",

  ["./"],
  function(expect, done, functionCall) {

    var boundFunction = functionCall("program")

    var source = boundFunction.withArgs({a: 2, b: "hello", c: [1,"hi"]}).evalable()

    expect(source).to.contain("\"a\":2")

    done()
  }
)


runTest(
  "arguments can be undefined",

  ["./"],
  function(expect, done, functionCall) {

    var boundFunction = functionCall(greet)

    var source = boundFunction.withArgs(undefined, {}).evalable()

    expect(source).to.contain("undefined, {}")

    done()
  }
)



runTest(
  "pass a string that evaluates to the function",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("some.thing.weird")

    expect(call.evalable()).to.equal("some.thing.weird()")

    done()
  }
)


runTest(
  "method calls",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall(greet).methodCall("toString").withArgs(5)

    expect(call.evalable()).to.equal("greet().toString(5)")

    done()
  }
)



runTest(
  "bind methods to their instance if it's a generator",
  ["./"],
  function(expect, done, functionCall) {

    var singleton = functionCall(function program() {}).singleton()

    var source = singleton.methodCall("getProperty").withArgs(true).callable()

    expect(source).to.equal("program.getProperty.bind(program, true)")

    done()
  }
)



runTest(
  "don't bind functions to themselves",
  ["./"],
  function(expect, done, functionCall) {
    var source = functionCall(
      function foo() {}
    ).withArgs(true).callable()

    expect(source).to.equal("foo.bind(null, true)")

    done()
  }
)



runTest(
  "don't bind chained functions to instances way back in the chain",
  ["./"],
  function(expect, done, functionCall) {
    var source = functionCall("library.get(\"foo\")").withArgs(true).callable()

    expect(source).to.equal("library.get(\"foo\").bind(null, true)")

    done()
  }
)



runTest(
  "bind deep methods",
  ["./"],
  function(expect, done, functionCall) {
    var source = functionCall("library").singleton().methodCall("get").withArgs("foo").methodCall("sass").withArgs(false).callable()

    expect(source).to.equal("library.get(\"foo\").sass.bind(library.get(\"foo\"), false)")

    done()
  }
)



runTest(
  "keeping bindings as bindings",
  ["./"],
  function(expect, done, functionCall) {

    var program = functionCall(function program() {}).asBinding()

    expect(program.callable()).to.equal("functionCall(\"program\")")

    done()
  }
)




runTest(
  "singletons don't drag along dependencies",
  ["./"],
  function(expect, done, functionCall) {

    var otherBinding = functionCall(function foo() {})

    var program = functionCall("program", [otherBinding]).singleton().asBinding()

    expect(program.callable()).to.equal("functionCall(\"program\").singleton()")

    done()
  }
)


runTest(
  "function calls can be object attributes",
  ["./"],
  function(expect, done, functionCall) {

    var someFunctionCall = functionCall("foo")

    var consumer = functionCall("consumer")

    expect(consumer.withArgs({func: someFunctionCall}).evalable()).to.equal("consumer({\"func\":foo})")

    done()
  }
)






