var runTest = require("run-test")(require)

runTest(
  "null arguments are OK",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("isNull").withArgs(null)

    expect(call.evalable()).to.equal("isNull(null)")

    done()
  }
)


runTest(
  "typed arrays",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("add").withArgs(new Float32Array([1,2,3]))

    expect(call.evalable()).to.equal("add(new Float32Array([1,2,3]))")

    done()
  }
)

runTest(
  "objects with typed arrays in their attributes",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("add").withArgs({
      color: new Float32Array([1,2,3,4])
    })

    expect(call.evalable()).to.equal("add({\"color\": new Float32Array([1,2,3,4])})")

    done()
  }
)


runTest(
  "currying arguments",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("add").withArgs(1).withArgs(2)

    expect(call.evalable()).to.equal("add(1, 2)")

    done()
  }
)


runTest(
  "raw arguments",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("greet").withArgs(
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
  "arguments can other function calls",

  ["./"],
  function(expect, done, functionCall) {

    var takesACallback = functionCall("callIt")

    var wit = takesACallback
    .withArgs(functionCall("shabooya"))

    expect(wit.evalable()).to.equal("callIt(shabooya)")

    done()
  }
)


runTest(
  "arguments can be objects",

  ["./"],
  function(expect, done, functionCall) {

    var boundFunction = functionCall("program")

    var source = boundFunction.withArgs({a: 2, b: "hello", c: [1,"hi"]}).evalable()

    expect(source).to.contain("\"a\": 2")

    done()
  }
)


runTest(
  "arguments can be undefined",

  ["./"],
  function(expect, done, functionCall) {

    var boundFunction = functionCall("something")

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
    var call = functionCall("greet").methodCall("toString").withArgs(5)

    expect(call.evalable()).to.equal("greet().toString(5)")

    done()
  }
)



runTest(
  "bind methods to their instance if call is flagged as a singleton",
  ["./"],
  function(expect, done, functionCall) {

    var singleton = functionCall("program").singleton()

    var source = singleton.methodCall("getProperty").withArgs(true).callable()

    expect(source).to.equal("program.getProperty.bind(program, true)")

    done()
  }
)



runTest(
  "bind methods to their instance when used used as a dependency",
  ["."],
  function(expect, done, functionCall) {
    var methodCall = functionCall("myInstance").singleton().methodCall("myMethod")

    expect(methodCall.callable()).to.equal(
      "myInstance.myMethod.bind(myInstance)")

    done()
  }
)



runTest(
  "don't bind functions to themselves",
  ["./"],
  function(expect, done, functionCall) {
    var source = functionCall("foo").withArgs(true).callable()

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
  "passing function calls as calls to other functions",
  ["./"],
  function(expect, done, functionCall) {

    var program = functionCall("program").asCall()

    expect(program.callable()).to.equal("functionCall(\"program\")")

    done()
  }
)




runTest(
  "singletons can be passed as calls",
  ["./"],
  function(expect, done, functionCall) {

    var otherBinding = functionCall("foo")

    var program = functionCall("program").singleton().asCall()

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

    expect(consumer.withArgs({func: someFunctionCall}).evalable()).to.equal("consumer({\"func\": foo})")

    done()
  }
)



runTest(
  "can pass arrays as arguments",
  ["./"],
  function(expect, done, functionCall) {
    var call = functionCall("add").withArgs([1,2,3])

    expect(call.evalable()).to.equal("add([1,2,3])")

    done()
  }
)




