if (require) {
  module.exports = require("module-library")(require).export("function-call", generator)
} else {
  var functionCall = generator()
}

function generator() {

  function FunctionCall(identifier, args) {

    if (typeof identifier != "string") {
      throw new Error("FunctionCall constructor takes an identifier as the first parameter")
    } else if (typeof args != "undefined" && !Array.isArray(args)) {
      throw new Error("Second argument to FunctionCall constructor should be an array, or omitted")
    }

    this.identifier = identifier
    this.args = args||[]
    this.__isFunctionCallBinding = true
    
    return this
  }

  FunctionCall.prototype.methodCall = function(methodName) {
    var identifier = (this.isGenerator ? this.callable() : this.evalable())+"."+methodName
    return new FunctionCall(identifier)
  }

  FunctionCall.prototype.asBinding =
    function() {
      console.log("⚡⚡⚡ WARNING ⚡⚡⚡ functionCall.asBinding() is deprecated, use .asCall()")
      return this.asCall()
    }

  FunctionCall.prototype.asCall = function() {
      return new BoundBinding(this)
    }

  function BoundBinding(call) {
    this.call = call
    this.__isFunctionCallBinding = true
    this.__isBoundBinding = true
  }


  BoundBinding.prototype.callable = function() {
    var binding = this.call

    var source = "functionCall(\""+binding.identifier+"\")"
    var anyArgs = binding.args.length > 0
    var anyDepsOrArgs = binding.args.length > 0

    if (binding.isGenerator) {
      if (anyArgs) {
        source += "("+binding.args.map(toCallable).join(", ")+")"
      }
      source += ".singleton()"
    } else {
      if (anyDepsOrArgs) {
        source += ".withArgs("+binding.argumentString()+")"
      }
    }

    return source
  }

  function clone(binding) {
    return new FunctionCall(
      binding.identifier,
      [].concat(binding.args)
    )
  }

  FunctionCall.prototype.withArgs =
    function() {
      var args = Array.prototype.slice.call(arguments)

      var newCall = clone(this)

      newCall.args = newCall.args.concat(args)

      return newCall
    }

  FunctionCall.prototype.singleton = function() {
    var singleton = clone(this)
    singleton.isGenerator = true
    return singleton
  }

  // Gives you a string that when evaled on the client, would cause the function to be called with the args:

  FunctionCall.prototype.callable =
    function() {

      if (this.isGenerator) {
        return this.identifier
      }

      var arguments = this.argumentString()

      if (arguments.length < 1) {
        return this.identifier
      }


      var pattern = /(.+)[.]([a-zA-Z0-9_-]+)$/

      var method = this.identifier.match(pattern)

      if (method) {
        var scope = method[1]
      } else {
        var scope = "null"
      }

      return this.identifier
        +".bind("
        +scope
        +", "
        +arguments
        +")"
    }

  FunctionCall.prototype.argumentString = function(options) {
    return argumentString(this.args, options)
  }

  functionCall.argumentString = argumentString

  function argumentString(args, options) {

      var expandJson = !!(options && options.expand)

      var deps = []

      args.forEach(
        function(arg) {
          deps.push(toCallable(arg, expandJson))
        }
      )

      return deps.length ? deps.join(", ") : ""
  }

  function toCallable(arg, expandJson) {
  
    var isBinding = arg && arg.__isFunctionCallBinding
    var isFunction = typeof arg == "function"
    var isRawCode = arg && typeof arg.__nrtvFunctionCallRawCode == "string"
    var isObject = !isBinding && !isRawCode && typeof arg == "object"

    if (typeof arg == "undefined") {
      var source = "undefined"
    } else if (arg === null) {
      source = "null"
    } else if (isBinding) {
      source = arg.callable()
    } else if (isFunction) {
      source = arg.toString()
    } else if (isRawCode) {
      source = arg.__nrtvFunctionCallRawCode
    } else if (isObject) {
      source = objectToSource(arg, expandJson)
    } else {
      source = JSON.stringify(arg, null, expandJson ? 2 : null)
    }

    return source
  }

  function objectToSource(arg, expandJson) {

    var keyPairStrings = Object.keys(arg).map(toPairString)

    function toPairString(key) {
      var value = arg[key]

      if (value && value.__isFunctionCallBinding) {
        var valueString = toCallable(value, expandJson)
      } else {
        var valueString = JSON.stringify(value, null, expandJson ? 2 : null)
      }

      return JSON.stringify(key)+": "+valueString
    }

    var keyPairSource = keyPairStrings.join(expandJson ? ",\n  " : ", ")

    if (expandJson) {
      keyPairSource += "\n"
    }

    var openBracket = "{"+(expandJson ? "\n  " : "")
    var closeBracket = "}"

    return openBracket+keyPairSource+closeBracket
  }


  FunctionCall.prototype.evalable =
    function(options) {
      return this.identifier+"("+this.argumentString(options)+")"
    }

  // Gives you a JSON object that, if sent to the client, causes the function to be called with the args:

  // Rename to ajaxResponse? #todo

  FunctionCall.prototype.ajaxResponse =
    function() {
      return {
        evalable: this.evalable()
      }
    }

  function functionCall() {

    for(var i=0; i<arguments.length; i++) {
      var arg = arguments[i]
      if (typeof arg == "function") {
        throw new Error("Don't pass functions to functionCall, just pass a string identifier")
      } else if (typeof arg == "string") {
        var identifier = arg
      } else if (Array.isArray(arg)) {
        throw new Error("Can't pass dependencies to functionCall any more. Use yourCall.withArgs()")
      }
    }

    return new FunctionCall(identifier)
  }

  functionCall.raw = function(code) {
    return {
      __nrtvFunctionCallRawCode: code
    }
  }

  functionCall.defineOn = function(bridge) {
    var binding = bridge.remember("function-call")
    if (binding) { return binding }

    bridge.claimIdentifier("functionCall")
    binding = bridge.defineSingleton("functionCall", generator)

    bridge.see("function-call", binding)
    return binding
  }

  return functionCall
}

