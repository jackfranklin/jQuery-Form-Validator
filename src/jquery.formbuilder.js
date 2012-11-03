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
        var validationMethod;
        if(validation.indexOf("(") > -1) {
          validationMethod = validations.split("(")[0];
          return validationMethods[validationMethod](field.html, extractParams(validation));
        } else {
          validationMethod = validation;
          return validationMethods[validationMethod](field.html)
        }
      } else { //multiple validations so need to loop or something
        for(var i = 0; i < vals.length; i++) {
          var currentVal = vals[i];
          var validationMethod = currentVal.split("(")[0];
          if(!validationMethods[validationMethod](field.html, extractParams(currentVal))) {
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

    var extractParams = function(validation) {
      //TODO must be a better way - regex to extract every thing within a bracket separated by a , - eg from (5, 4, 2) pull out [5,4,2]
      //this hacky solution only works for one parameter
      var params = validation.split("(");
      var param = params[1].split(")");
      return param[0];
    };

    //object that we store all the validations in - these are not passed to the API
    //these are mostly shamelessly stolen from the CodeIgniter form validation library
    var validationMethods = {
      min_length: function(obj, x) {
        return $(obj).val().length >= x;
      },
      max_length: function(obj, x) {
        return $(obj).val().length <= x;
      },
      required: function(obj) {
        return $(obj).val() != "";
      }
    }

    //TODO write method to let user write own validation methods


    //what we want to expose as the API
    return {
      init: init,
      generate: generate,
      field: field,
      validate: validate,
      addField: addField
    };
  })();

  window.FormBuilder = function(json) {
    return jFB.init(json);
  };

})(window);
