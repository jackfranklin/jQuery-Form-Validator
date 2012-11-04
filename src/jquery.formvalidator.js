/**
 * jQuery Form Validator
 * Written by Jack Franklin
 *
 * https://github.com/jackfranklin/jQuery-Form-Validator
 **/


/** getAttributes plugin
 * from: http://stackoverflow.com/questions/2048720/get-all-attributes-from-a-html-element-with-javascript-jquery
 **/
(function($) {
  $.fn.getAttributes = function() {
    var attributes = {};
    if(!this.length) return this;
    $.each(this[0].attributes, function(index, attr) {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }
})(jQuery);

(function(window) {
  var jFV = (function() {
    var VERSION = 0.1;


    //store each field in this array - quicker to store them all rather than keep grabbing JSON
    var formFields = {};

    var addField = function(field) {
      var attrs = $(field).getAttributes();
      formFields[attrs.name] = {
        html: $(field),
        attributes: attrs
      }
      return this;
    }

    var addFields = function(fields) {
      for(var i = 0; i < fields.length; i++) {
        addField(fields[i]);
      };
    }

    //returns the object for a form element, based off its name attribute
    var field = function(name) {
      return formFields[name];
    };


    //validates a field against validation method(s)
    //validateField("username", "max_length(6)|required")
    var validateField = function(name, validations) {
      var field = formFields[name];
      if (!field) return false //if we dont have a field then just exist out of this one
      var vals = splitValidations(validations);
      var errorMessages = [];
      for(var i = 0; i < vals.length; i++) {
        var currentValidation = vals[i];
        var mp = extractMethodAndParams(currentValidation);
        if(!validationMethods[mp.method]) throw new Error("Validation method " + mp.method + " does not exist");
        if(!validationMethods[mp.method].fn(field.html, mp.params)) {
          errorMessages.push(replacePlaceholdersInMessage(validationMethods[mp.method].message, { name: name, params: mp.params }));

        }
      };
      return { valid: !!(errorMessages < 1), messages: errorMessages };
    };


    var replacePlaceholdersInMessage = function(message, data) {
      message = message.replace("%F", data.name);
      var dataParamsLen = data.params.length;
      if(dataParamsLen > 1) {
        for(var i = 0; i < dataParamsLen; i++) {
          message = message.replace("%ARGS[" + i + "]", data.params[i]);
        }
      } else {
        message = message.replace("%ARG", data.params[0]);
      }
      return message;
    };


    var splitValidations = function(validations) {
      if(validations.indexOf("|") > -1) {
        return validations.split("|");
      } else {
        return [validations];
      }
    };

    // returns an object, with two keys
    // method: method name (string)
    // params: arguments (array)
    var extractMethodAndParams = function(validation) {
      var grabParamsRegex = /([a-zA-Z_]+)\(?([^\)]*)\)*/;
      var match = grabParamsRegex.exec(validation);
      // first match group is the method name, second is the params
      return { method: match[1], params: match[2].split(",") };
    };

    // object to store pending validations
    var pendingValidations = {};
    //method for stacking validations
    var addValidation = function(fieldName, validations) {
      if(pendingValidations[fieldName]) {
        pendingValidations[fieldName] += "|" + validations;
      } else {
        pendingValidations[fieldName] = validations;
      }
    };
    //method for clearing pending validations
    var clearPendingValidations = function() { pendingValidations = {} };
    //method for running validations
    var runValidations = function() {
      var response = { valid: true, messages: [] };
      for(field in pendingValidations) {
        var resp = validateField(field, pendingValidations[field]);
        var respMessagesLen = resp.messages.length;
        if(respMessagesLen) {
          for(var i = 0; i < respMessagesLen; i++) {
            response.messages.push(resp.messages[i]);
          }
        }
        if(!resp.valid) response.valid = false;
      }
      return response;
    };

    //object that we store all the validations in - these are not passed to the API
    //these are mostly shamelessly stolen from the CodeIgniter form validation library
    var validationMethods = {
      min_length: {
        message: "Field %F must be at least length %ARG",
        fn: function(obj, args) {
          return $(obj).val().length >= args[0];
        },
      },
      max_length: {
        message: "Field %F must be a maximum of %ARG characters",
        fn: function(obj, args) {
          return $(obj).val().length <= args[0];
        }
      },
      required: {
        message: "Field %F is required",
        fn: function(obj) {
          return $(obj).val() != "";
        }
      },
      length_between: {
        message: "Field %F must be a minimum of %ARGS[0] characters and a maximum of %ARGS[1]",
        fn: function(obj, args) {
          var len = $(obj).val().length;
          return (len >= args[0] && args[1] >= len);
        }
      },
      matches: {
        message: "Field %F must match %ARG",
        fn: function(obj, args) {
          return $(obj).val() == args[0];
        }
      }
    };

    var addValidationMethod = function(name, fn, message) {
      validationMethods[name] = { fn: fn, message: message };
    };

    var getValidationMethod = function(name) {
      return validationMethods[name];
    };

    var saveValidationMethod = function(name, obj) {
      validationMethods[name] = obj;
    };


    //what we want to expose as the API
    return {
      VERSION: VERSION,
      field: field,
      addField: addField,
      addFields: addFields,
      validateField: validateField,
      addValidationMethod: addValidationMethod,
      getValidationMethod: getValidationMethod,
      saveValidationMethod: saveValidationMethod,
      addValidation: addValidation,
      runValidations: runValidations,
      clearPendingValidations: clearPendingValidations,
    };
  })();

  window.FormValidator = function() {
    return jFV;
  };

})(window);
