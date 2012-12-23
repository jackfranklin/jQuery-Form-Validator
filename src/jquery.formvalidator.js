/*
 * jQuery Form Validator
 * Written by Jack Franklin
 *
 * https://github.com/jackfranklin/jQuery-Form-Validator
*/

// jQuery Form Validator. [Usage Documentation on Github](https://github.com/jackfranklin/jQuery-Form-Validator)


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
  // the JFV class
  var JFV = function() {
    this.VERSION = "0.6.0";

    // Stores all the form fields that are added to the JFV
    this.formFields = {};

    // Object to store pending validations that have yet to be run
    this.pendingValidations = {};

    // This is called automatically when you run `window.FormValidator();`
    // You can pass in fields that will be added to the JFV instance for you;
    // For example: `window.formValidator($("input"))`;
    this.init = function(fields) {
      if(fields) { this.addFields(fields); }
      return this;
    };

    // Add an individual field to the JFV object
    this.addField = function(field) {
      var attrs = $(field).getAttributes();
      this.formFields[attrs.name] = {
        html: $(field),
        attributes: attrs
      };
    };

    // Loops over the given jQ set, adding all fields to the form
    this.addFields = function(fields) {
      for(var i = 0; i < fields.length; i++) {
        this.addField(fields[i]);
      }
    };

    // Returns the object for a form element, based off its name attribute
    this.field = function(name) {
      return this.formFields[name];
    };

    // Clears out all the fields the JFV validator knows about.
    // Useful if you need to completely clear all the fields
    this.clearFields = function() {
      this.formFields = {};
    };

    // Validates a field against validation method(s). For example:
    // `validateField("username", { max_length: 6, required: true });`
    this.validateField = function(name, validations) {
      var field = this.formFields[name];
      var fieldType = field.html.attr("type");
      var fieldValue;
      // make sure we have `fieldValue` set to the right value.
      // For checkboxes and radio buttons, val() isn't the way to do things.

      // TODO: deal with all types, and make this more robust
      if(field.html) {
        if(fieldType !== "text") {
          if(fieldType === "checkbox" || fieldType === "radio") {
            fieldValue = field.html.is(":checked");
          }
        } else {
          fieldValue = field.html.val();
        }
      }

      // If we don't have a field, just return false here
      if (!field) { return false; }

      // Store any error messages we get from the validations
      var errorMessages = [];

      // Runs the field value against every validation passed in
      for(var validation in validations) {
        var method = this.getValidationMethod(validation);
        var params = validations[validation];

        if(!method) { throw new Error("Validation method " + validation + " does not exist"); }

        // If it doesn't pass, store the error message, otherwise do nothing.
        if(!method.fn(fieldValue, params, field.html)) {
          errorMessages.push(this.replacePlaceholdersInMessage(method.message, { name: name, params: params }));
        }
      }

      // return the final validation object.
      return { valid: !(errorMessages.length), field: field, messages: errorMessages };
    };

    // Replaces placeholders in a validation message with the actual data.
    // `data` contains the field name and the fields parameters
    this.replacePlaceholdersInMessage = function(message, data) {
      // substitute %F for the field name
      message = message.replace(/%F/g, data.name);

      var dataParams = data.params;
      // if it is an array of multiple params, we loop through and replace each
      if( Object.prototype.toString.call(dataParams) === '[object Array]' ) {
        var dataParamsLen = dataParams.length;
        for(var i = 0; i < dataParamsLen; i++) {
          // Substitute %ARGS[0], %ARGS[1], etc with the actual parameter
          message = message.replace(new RegExp('%ARGS\\['+i+'\\]', "g"), data.params[i]);
        }
      } else {
        // Just one parameter so substitute %ARG[0] for it
        message = message.replace(/%ARG/g, dataParams);
      }
      return message;
    };

    // Method to return pending validations
    this.getPendingValidations = function() {
      return this.pendingValidations;
    };

    // Method for stacking validations, that is, adding methods without running them.
    // Useful for programatically adding validation methods before running them all
    this.addValidation = function(fieldName, validations) {
      if(this.pendingValidations[fieldName]) {
        // Some already exist, so loop through and apply the new ones onto the existing object
        for(var newValidation in validations) {
          this.pendingValidations[fieldName][newValidation] = validations[newValidation];
        }
      } else {
        this.pendingValidations[fieldName] = validations;
      }
    };

    // Method for clearing pending validations
    this.clearPendingValidations = function() { this.pendingValidations = {}; };

    // Method for running all the pending validations
    this.runValidations = function(clearAfter) {
      //ensure it's boolean true or false
      clearAfter = !!clearAfter;

      // Will form part of the response
      var fields = {};

      // Loop through every field, and run the validations on it.
      for(var field in this.pendingValidations) {
        var resp = this.validateField(field, this.pendingValidations[field]);
        // Store the response for this field to the fields object.
        fields[field] = { field: resp.field, messages: resp.messages, valid: resp.valid, html: resp.field.html };
      }
      if(clearAfter) { this.clearPendingValidations(); }
      // `getAllErrors` loops through the error messages for each individual field,
      //  and concatenates them all into one large array
      var allErrors = this.getAllErrors(fields);
      return { valid: !allErrors.length, fields: fields, messages: this.getAllErrors(fields) };
    };

    // Loops through the error messages for each individual field,
    // and concatenates them all into one large array
    this.getAllErrors = function(fieldsObj) {
      /*fields object looks like:
       * var fields = {
       *    username: {
       *      field: [ jQuery obj],
       *      messages: [ array of error messages ],
       *      valid: true/false // if that field passed its validations
       *      }
       *    }
       */
      var allErrors = [];
      for(var field in fieldsObj) {
        allErrors = allErrors.concat(fieldsObj[field].messages);
      }
      return allErrors;
    };

    /**
     * object that we store all the validations in
     * validation methods are passed in three things: value, argument(s), object
     * value = the value of the field
     * argument(s) = the arguments of the method. Is an array if it's more than one, or just a string/int/boolean for just one
     * object = jQuery ref to field
    **/

    //TODO: use `add_validation` method rather than directly adding them here?
    this.validationMethods = {
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
          return (val !== "" && !!val);
        }
      },
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

    // Adds a new validation method
    // This also will override an existing method, if you want to change how a method works
    this.addValidationMethod = function(name, obj) {
      this.validationMethods[name] = obj;
    };

    // Grab a validation method object, if you want to alter it and then save it back.
    this.getValidationMethod = function(name) {
      return this.validationMethods[name];
    };
  };

  // Expose globally.
  window.FormValidator = function(fields) {
    return new JFV().init(fields);
  };

  // Support AMD libraries, such as RequireJS
  if(typeof define === 'function') {
    define([], function() {
      return window.FormValidator;
    });
  }

})(this);


