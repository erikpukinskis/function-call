**FunctionCall** allows you to build JavaScript strings that do stuff. It's convenient for creating an onclick handler:

```javascript
var functionCall = require("function-call")

var build = functionCall("buildTemple").withArgs({height: "30 cubits"})

build.evalable() // 'buildTemple({"height":"30 cubits"})'
```

You can also keep tacking more arguments on to a function call. Arguments can be literals or other function calls:

```javascript
var moveIn = functionCall("moveIn").withArgs("Tuesday")

build.withArgs(moveIn).evalable() // 'buildTemple({"height":"30 cubits"}, moveIn.bind(null, "Tuesday"))'
```

If you want to pass the call to another function as a callback, use callable() instead of evalable():

```javascript
build.callable() // 'buildTemple.bind(null, {"height":"30 cubits"})'
```

## Singletons and methods

If you want to reference an object or its methods:

```javascript
var me = functionCall("me").singleton()

me.methodCall("getName").withArgs("formal").evalable() // me.getName("formal")
```

## These bindings are getting out of hand, what do I do?

FunctionCall works great if you are mostly just passing literals to functions, but if you are calling functions and callbacks with serious dependencies, [browser-bridge](https://github.com/erikpukinskis/browser-bridge) can help.

It allows you to bake dependencies into a function definition so your functionCalls stay sane:

```javascript
var bridge = require("browser-bridge")

var a = bridge.defineFunction(function a() {})

var c = bridge.defineFunction(function b(x) { x })

var c = bridge.defineFunction(
  [a, b.withArgs(4000), {some: "data"}],
  function(a, b, data, moar) {
    a()
    b()
    return data.some + moar
  }
)
```

This will pre-bind a, b, b's args, and your data into a reference called c, so that you get a nice clear function call:

```javascript
c.withArgs("goats").evalable() // `c("goats")`
```

## Why?

Many JavaScript frameworks don't actually put onclick handlers in the DOM, which means it's difficult to see what happens when a button is pushed. 

Even if you can figure out what the event handler is, it often plumbs straight into framework internals.

FunctionCall allows you to put human-readable, irrefutable JavaScript strings into your HTML so that you can see exactly what's going on and debug problems.