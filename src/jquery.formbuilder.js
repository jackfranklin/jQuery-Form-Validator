/**
 * jQuery Form Builder
 * Written by Jack Franklin
 *
 * https://github.com/jackfranklin/jquery-form-builder
 **/


/**
 * sample JSON structure
 * var json = {
 *  "fields" : [
 *    {
 *      "name": "username",
 *      "type": "text",
 *      "validations": "min_length(5)"
 *    }
 *  ]
 *}
 *
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
  var jFB = (function() {

    //store the form's JSON
    var formJson;

    //store each field in this array - quicker to store them all rather than keep grabbing JSON
    var formFields = {};

    var init = function(json) {
      try {
        formJson = JSON.parse(json)
      } catch (e) {
        throw new Error("JSON is not valid");
        return false;
      }
      return this;
    }

    var generate = function() {
      var jsonItems = formJson.fields;
      var jsonItemsLen = jsonItems.length;
      //loop through all the fields
      for(var i = 0; i < jsonItemsLen; i++) {
        var attributes = jsonItems[i];
        //now we have all the attributes, we can make an element out of this
        //store the element type (as in the HTML element)
        var fieldElement = attributes.element;
        //then delete it so the attributes object doesn't contain the HTML element
        delete attributes.element;
        //set up the formField object
        formFields[attributes.name] = {
          //give them a reference to the actual HTML
          html: $(document.createElement(fieldElement)).attr(attributes),
          //and all the attributes
          attributes: attributes
        };
      };
      return this;
    }

    var addField = function(field) {
      var attrs = $(field).getAttributes();
      formFields[attrs.name] = {
        html: $(field),
        attributes: attrs
      }
      return this;
    }

    //returns the object for a form element, based off its name attribute
    var field = function(name) {
      return formFields[name];
    };


    //TODO: only manages validations with just one parameter
    var validate = function(name, validations) {
      var field = formFields[name];
      if (!field) return false //if we dont have a field then just exist out of this one
      var vals = splitValidations(validations);
      //only one validation, no need to loop
      if(vals.length === 1) {
        //grab the validation which will be the first one
        var validation = vals[0];
        //to grab the method, split at a bracket and grab the bit before it
        // if it's got a bracket, split it to get at the method name
        if(validation.indexOf("(") > -1) {
          var mp = extractMethodAndParams(validation);
          return validationMethods[mp.method](field.html, mp.params);
        } else {
          // doesnt have a bracket so just pass it right through
          return validationMethods[validation](field.html)
        }
      } else { //multiple validations so need to loop
        for(var i = 0; i < vals.length; i++) {
          var currentVal = vals[i];
          var mp = extractMethodAndParams(currentVal);
          if(!validationMethods[mp.method](field.html, mp.params)) {
            return false;
          }
        };
        //get to end of the loop, all must have passed, return true
        return true;
      }

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
      var grabParamsRegex = /(.+)\((.+)\)/;
      var match = grabParamsRegex.exec(validation);
      // first match group is the method name, second is the params
      return { method: match[1], params: match[2].split(",") };
    };

    //object that we store all the validations in - these are not passed to the API
    //these are mostly shamelessly stolen from the CodeIgniter form validation library
    var validationMethods = {
      min_length: function(obj, x) {
        return $(obj).val().length >= x[0];
      },
      max_length: function(obj, x) {
        return $(obj).val().length <= x[0];
      },
      required: function(obj) {
        return $(obj).val() != "";
      }
    };

    //TODO write method to let user write own validation methods
    var addValidationMethod = function(name, fn) {
      validationMethods[name] = fn;
    };


    //what we want to expose as the API
    return {
      init: init,
      generate: generate,
      field: field,
      validate: validate,
      addField: addField,
      addValidationMethod: addValidationMethod
    };
  })();

  window.FormBuilder = function(json) {
    return jFB.init(json);
  };

})(window);
