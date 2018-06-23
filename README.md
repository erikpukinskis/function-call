**Function-call** allows you to build JavaScript strings that do stuff. It's convenient for creating an onclick handler:

```javascript
var functionCall = require("function-call")

var build = functionCall("buildTemple").withArgs({height: "30 cubits"})
build.evalable()

// returns 'buildTemple({"height":"30 cubits"})'
```

You can also keep tacking more arguments on to a function call. Arguments can be literals or other function calls:

```javascript
var moveIn = functionCall("moveIn").withArgs("Tuesday")
build.withArgs(moveIn).evalable()

// returns 'buildTemple({"height":"30 cubits"}, moveIn.bind(null, "Tuesday"))'
```

## Singletons and methods

If you want to reference an object or its methods:

```javascript
var me = functionCall("me").singleton()
me.methodCall("getName").withArgs("formal").evalable()

// returns 'me.getName("formal")'
```

## These bindings are getting out of hand, what do I do?

FunctionCall works great if you are mostly just passing literals to pure(ish) functions, but if you are calling functions and callbacks with serious dependencies, [browser-bridge](https://github.com/erikpukinskis/browser-bridge) can help.

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
c.withArgs("goats").evalable()

// returns 'c("goats")'
```

When you eval that, `a` will be called, `b` will be called with 4000, and you'll get "datagoats" back.

## Using bindings in the browser

Sometimes you want to use a bridge function again in response to a javascript event or something. Use .asBinding() to get a binding of the binding, so to speak.

```javascript
var sayHi = bridge.defineFunction(function(name) {
  alert("wuzzup "+name)
})

bridge.defineFunction(
  [sayHi.asBinding()],
  function(sayHi) {
    var name = askTheSpiritsBeyond.whoAmi()
    someElement.onclick = sayHi.withArgs(name).evalable()
  }
)
```

## Globals and other manual references

To reference `window` or `event` or similar as an argument:

```javascript
var js = functionCall("myFunc").withArgs(functionCall.raw("window").evalable()
```

The `raw` function is also available on the calls themselves:

```javascript
var add = functionCall("add")
el.onclick = add.withArgs(add.raw("event")).evalable()
```

## Passing unbound function calls as references

If you want to pass the function call object itself as an argument, and not the function it references, you can use the `.asCall` method:

```javascript
function addDay(chooseDay, dateString) {
  var chooseButton = document.createElement("button")
  chooseButton.setAttribute(
    "onclick",
    chooseDay.withArgs(dateString).evalable()
  )
}

var addButton = document.createElement("button")
addButton.setAttribute(
  "onclick", functionCall("chooseDay").asCall()
)
```

## Why?

Many JavaScript frameworks don't actually put onclick handlers in the DOM, which means it's difficult to see what happens when a button is pushed. 

Even if you can figure out what the event handler is, it often plumbs straight into framework internals.

FunctionCall allows you to put human-readable, irrefutable JavaScript strings into your HTML so that you can see exactly what's going on and debug problems.
