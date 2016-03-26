var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-function-call",
  function() {

    function BoundFunc(func, identifier, dependencies, args) {
      this.binding = {
        __BrowserBridgeBinding: true,
        func: func,
        identifier: identifier || (func && func.name),
        dependencies: dependencies || [],
        args: args || [],
      }
      return this
    }

    BoundFunc.prototype.withArgs =
      function() {
        var args = Array.prototype.slice.call(arguments)

        return new BoundFunc(
          this.binding.func,
          this.binding.identifier,
          this.binding.dependencies,
          [].concat(this.binding.args, args)
        )
      }

    BoundFunc.prototype.source =
      function() {
        var source = this.binding.func.toString()

        if (this.isGenerator) {

          if (this.binding.dependencies.length > 0) {

            var callArgs = "null, "+this.argumentString()

          } else {
            var callArgs = ""
          }

          source = "var "+this.binding.identifier+" = ("+source+").call("+callArgs+")"
        } else {
          source = source.replace(
            /^function[^(]*\(/,
            "function "+this.binding.identifier+"("
          )

          var firstDependency = this.binding.dependencies[0]

          var hasCollective = firstDependency &&firstDependency.__dependencyType == "browser collective"

          if (hasCollective) {
            source = "var "+this.binding.identifier+" = ("+source+").bind(null,"+JSON.stringify(firstDependency.attributes)+")"
          }
        }

        return source
      }

    // Gives you a string that when evaled on the client, would cause the function to be called with the args:

    BoundFunc.prototype.callable =
      function() {
        if (this.isGenerator) {
          return this.binding.identifier
        }

        var arguments = this.argumentString()

        if (arguments.length < 1) {
          return this.binding.identifier
        }

        return this.binding.identifier+".bind(null,"+arguments+")"
      }

    BoundFunc.prototype.argumentString = function() {

        var deps = []

        for(var i=0; i<this.binding.dependencies.length; i++) {

          var dep = this.binding.dependencies[i]

          var isCollective = dep.__dependencyType == "browser collective"

          if (isCollective) {
            if (i>0) {
              throw new Error("You can only use a collective as the first dependency of a browser function. (I know, annoying.) You have library.collective("+JSON.stringify(dep.attributes)+") as the "+i+ "th argument to "+this.binding.key)
            }
          } else {
            if (typeof dep.callable != "function") {
              throw new Error("You passed "+JSON.stringify(dep)+" as a dependency to "+this.key+" but it needs to either be a collective or a function or have a .callable() method.")
            }

            deps.push(dep.callable())
          }
        }

        for(var i=0; i<this.binding.args.length; i++) {

          var arg = this.binding.args[i]

          var isBinding = arg && arg.binding && arg.binding.__BrowserBridgeBinding

          var isFunction = typeof arg == "function"

          var rawCode = arg && arg.__nrtvFunctionCallRawCode

          if (typeof arg == "undefined") {
            var source = "undefined"
          } else if (arg === null) {
            source = "null"
          } else if (isBinding) {
            source = arg.callable()
          } else if (isFunction) {
            source = arg.toString()
          } else if (rawCode) {
            source = rawCode
          } else {
            source = JSON.stringify(arg)
          }

          deps.push(source)
        }

        return deps.length ? deps.join(",") : ""
    }

    BoundFunc.prototype.evalable =
      function() {
        return this.binding.identifier+"("+this.argumentString()+")"
      }

    // Gives you a JSON object that, if sent to the client, causes the function to be called with the args:

    // Rename to ajaxResponse? #todo

    BoundFunc.prototype.ajaxResponse =
      function() {
        return {
          evalable: this.evalable()
        }
      }

    function functionCall() {
      var args = arguments
      function Baked() {
        BoundFunc.apply(this, args)
      }
      Baked.prototype = BoundFunc.prototype
      var instance = new Baked
      return instance
    }

    functionCall.raw = function(code) {
      return {
        __nrtvFunctionCallRawCode: code
      }
    }

    return functionCall
  }
)


