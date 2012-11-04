/*! jQuery Form Validator - v0.4.0 - 2012-11-04
* https://github.com/jackfranklin/jQuery-Form-Validator
* Copyright (c) 2012 Jack Franklin; */

/** getAttributes plugin
 * from: http://stackoverflow.com/questions/2048720/get-all-attributes-from-a-html-element-with-javascript-jquery
 **/
(function($) {
  $.fn.getAttributes = function() {
    var attributes = {};
    if(!this.length) { return this; }
    $.each(this[0].attributes, function(index, attr) {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  };
})(jQuery);

(function(window) {
  var jFV = (function() {
    var VERSION = 0.4;


    // lets fields be passed in on init

    var init = function(fields) {
      if(fields) { addFields(fields); }
      return this;
    };
    // store all fields in an object
    var formFields = {};

    var addField = function(field) {
      var attrs = $(field).getAttributes();
      formFields[attrs.name] = {
        html: $(field),
        attributes: attrs
      };
    };

    var addFields = function(fields) {
      for(var i = 0; i < fields.length; i++) {
        addField(fields[i]);
      }
    };

    //returns the object for a form element, based off its name attribute
    var field = function(name) {
      return formFields[name];
    };


    //validates a field against validation method(s)
    //validateField("username", { max_length: 6, required: true })
    var validateField = function(name, validations) {
      var field = formFields[name];
      var fieldValue = field.html.val();
      if (!field) { return false; } //if we dont have a field then just exit out of this one

      var errorMessages = [];
      for(var validation in validations) {
        var method = validationMethods[validation];
        var params = validations[validation];
        if(!method) { throw new Error("Validation method " + validation + " does not exist"); }
        if(!method.fn(fieldValue, params, field.html)) {
          errorMessages.push(replacePlaceholdersInMessage(method.message, { name: name, params: params }));
        }
      }
      return { valid: (errorMessages.length < 1), messages: errorMessages };
    };



    var replacePlaceholdersInMessage = function(message, data) {
      message = message.replace(/%F/g, data.name);
      var dataParams = data.params;
      // if it is an array of multiple params, we loop through and replace each
      if( Object.prototype.toString.call(dataParams) === '[object Array]' ) {
        //array of multiple parameters
        var dataParamsLen = dataParams.length;
        for(var i = 0; i < dataParamsLen; i++) {
          message = message.replace(new RegExp('%ARGS\\['+i+'\\]', "g"), data.params[i]);
        }
      } else {
        //just one so replace it
        message = message.replace(/%ARG/g, dataParams);
      }
      return message;
    };


    // object to store pending validations
    var pendingValidations = {};

    // method to return pending validations
    var getPendingValidations = function() {
      return pendingValidations;
    };

    //method for stacking validations
    var addValidation = function(fieldName, validations) {
      if(pendingValidations[fieldName]) {
        //some already exist, so loop through and apply the new ones onto the existing object
        for(var newValidation in validations) {
          pendingValidations[fieldName][newValidation] = validations[newValidation];
        }
      } else {
        pendingValidations[fieldName] = validations;
      }
    };


    //method for clearing pending validations
    var clearPendingValidations = function() { pendingValidations = {}; };


    //method for running validations
    var runValidations = function(clearAfter) {
      //ensure it's boolean true or false
      clearAfter = !!clearAfter || false;

      var response = { valid: true, messages: [] };

      for(var field in pendingValidations) {
        //validate the field
        var resp = validateField(field, pendingValidations[field]);
        var respMessagesLen = resp.messages.length;
        if(respMessagesLen) {
          for(var i = 0; i < respMessagesLen; i++) {
            response.messages.push(resp.messages[i]);
          }
        }
        if(!resp.valid) { response.valid = false; }
      }

      if(clearAfter) { clearPendingValidations(); }

      return response;
    };

    //object that we store all the validations in - this object is not exposed publically
    //validation methods are passed in three things: value, argument(s), object
    //value = the value of the field
    //argument(s) = the arguments of the method. Is an array if it's more than one, or just a string/int/boolean for just one
    //object = jQuery ref to field

    var validationMethods = {
      // takes just one argument, which is the integer denoting min length
      min_length: {
        message: "Field %F must be at least length %ARG",
        fn: function(val, arg) {
          return val.length >= arg;
        }
      },
      max_length: {
        message: "Field %F must be a maximum of %ARG characters",
        fn: function(val, arg) {
          return val.length <= arg;
        }
      },
      required: {
        message: "Field %F is required",
        fn: function(val) {
          return val !== "";
        }
      },
      //this takes two arguments, the min and max length, so the arguments here are an array.
      length_between: {
        message: "Field %F must be a minimum of %ARGS[0] characters and a maximum of %ARGS[1]",
        fn: function(val, args) {
          var len = val.length;
          return (len >= args[0] && args[1] >= len);
        }
      },
      matches: {
        message: "Field %F must match %ARG",
        fn: function(val, arg) {
          return val === arg;
        }
      }
    };

    //TODO: don't like having both of these - just get rid of one and keep the other?
    var addValidationMethod = function(name, fn, message) {
      validationMethods[name] = { fn: fn, message: message };
    };
    var saveValidationMethod = function(name, obj) {
      validationMethods[name] = obj;
    };

    var getValidationMethod = function(name) {
      return validationMethods[name];
    };



    //what we want to expose as the API
    return {
      VERSION: VERSION,
      init: init,
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
      getPendingValidations: getPendingValidations
    };
  })();

  window.FormValidator = function(fields) {
    return jFV.init(fields);
  };

})(window);
