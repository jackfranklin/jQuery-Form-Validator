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
    if(!this.length) { return this; }
    $.each(this[0].attributes, function(index, attr) {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  };
})(jQuery);

(function(window) {
  var JFV = function() {
    this.VERSION = "0.6.0";
    // store all our fields
    this.formFields = {};

    // object to store pending validations
    this.pendingValidations = {};

    // init method - fields can be passed in on init
    this.init = function(fields) {
      if(fields) { this.addFields(fields); }
      return this;
    };

    //adds an individual field to the list
    this.addField = function(field) {
      var attrs = $(field).getAttributes();
      this.formFields[attrs.name] = {
        html: $(field),
        attributes: attrs
      };
    };

    // loops over a jQ set, adding all fields to the form
    this.addFields = function(fields) {
      for(var i = 0; i < fields.length; i++) {
        this.addField(fields[i]);
      }
    };

    //returns the object for a form element, based off its name attribute
    this.field = function(name) {
      return this.formFields[name];
    };

    // clears out the form fields
    this.clearFields = function() {
      this.formFields = {};
    };

    //validates a field against validation method(s)
    //validateField("username", { max_length: 6, required: true })
    this.validateField = function(name, validations) {

      var field = this.formFields[name];
      var fieldType = field.html.attr("type");
      var fieldValue;
      if(field.html) {
        // deal with other field types
        // TODO: deal with more than just text and checkboxes
        if(fieldType !== "text") {
          if(fieldType === "checkbox" || fieldType === "radio") {
            fieldValue = field.html.is(":checked");
          }
        } else {
          fieldValue = field.html.val();
        }
      }

      //if we dont have a field then just exit out of this one
      if (!field) { return false; }

      //store the validation error messages
      var errorMessages = [];

      // method to run all the validations on the value
      for(var validation in validations) {
        var method = this.getValidationMethod(validation);
        var params = validations[validation];

        if(!method) { throw new Error("Validation method " + validation + " does not exist"); }

        if(!method.fn(fieldValue, params, field.html)) {
          errorMessages.push(this.replacePlaceholdersInMessage(method.message, { name: name, params: params }));
        }
      }

      return { valid: !(errorMessages.length), field: field, messages: errorMessages };
    };

    // replaces placeholders in a validation message with the actual data
    this.replacePlaceholdersInMessage = function(message, data) {
      // substitute %F for the field name
      message = message.replace(/%F/g, data.name);

      var dataParams = data.params;
      // if it is an array of multiple params, we loop through and replace each
      if( Object.prototype.toString.call(dataParams) === '[object Array]' ) {
        //array of multiple parameters
        var dataParamsLen = dataParams.length;
        for(var i = 0; i < dataParamsLen; i++) {
          // substitute %ARGS[0], %ARGS[1], etc with the actual parameter
          message = message.replace(new RegExp('%ARGS\\['+i+'\\]', "g"), data.params[i]);
        }
      } else {
        //just one so substitute %ARG[0] for it
        message = message.replace(/%ARG/g, dataParams);
      }
      return message;
    };

    // method to return pending validations
    this.getPendingValidations = function() {
      return this.pendingValidations;
    };

    //method for stacking validations
    this.addValidation = function(fieldName, validations) {
      if(this.pendingValidations[fieldName]) {
        //some already exist, so loop through and apply the new ones onto the existing object
        for(var newValidation in validations) {
          this.pendingValidations[fieldName][newValidation] = validations[newValidation];
        }
      } else {
        this.pendingValidations[fieldName] = validations;
      }
    };

    //method for clearing pending validations
    this.clearPendingValidations = function() { this.pendingValidations = {}; };

    //method for running validations
    this.runValidations = function(clearAfter) {
      //ensure it's boolean true or false
      clearAfter = !!clearAfter;

      // will form part of the response
      var fields = {};
      var isValid = true;

      for(var field in this.pendingValidations) {
        //validate the field
        var resp = this.validateField(field, this.pendingValidations[field]);
        fields[field] = { field: resp.field, messages: resp.messages, valid: resp.valid, html: resp.field.html };
      }
      if(clearAfter) { this.clearPendingValidations(); }
      var allErrors = this.getAllErrors(fields);
      return { valid: !allErrors.length, fields: fields, messages: this.getAllErrors(fields) };
    };

    /*fields object looks like:
     * var fields = {
     *    username: {
     *      field: [ jQuery obj],
     *      messages: [ array of error messages ],
     *      valid: true/false // if that field passed its validations
     *      }
     *    }
     */
    this.getAllErrors = function(fieldsObj) {
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

    //TODO: use add_validation method rather than directly adding them here?
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

    // adds a new validation method
    this.addValidationMethod = function(name, obj) {
      this.validationMethods[name] = obj;
    };

    this.getValidationMethod = function(name) {
      return this.validationMethods[name];
    };
  };

  // expose globally
  window.FormValidator = function(fields) {
    return new JFV().init(fields);
  };

  // support AMD like RequireJS
  if(typeof define === 'function') {
    define([], function() {
      return window.FormValidator;
    });
  }

})(this);


