/**
 * jQuery Form Builder
 * Written by Jack Franklin and Ben Everard
 * requires jQuery
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
      jsonItems = formJson.fields;
      //loop through all the fields
      for(var i = 0; i < jsonItems.length; i++) {
        var value = jsonItems[i];
        //now we have all the attributes, we can make an element out of this
        var fieldElement = value.element;
        delete value.element;
        formFields[value.name] = {
          html: $(fieldElement).attr(value),
          attributes: value
        };
      };
    }

    var fields = function(name) {
      return formFields[name];
    };



    //object that we store all the validations in - these are not passed to the API
    //written this just as an idea of how they work - this doesn't actually do anything yet
    var validations = {
      min_length: function(obj, x) {
        return $(obj).val().length > x;
      }
    }


    //what we want to expose as the API
    return {
      init: init,
      generate: generate,
      fields: fields
    };
  })();

  window.FormBuilder = function(json) {
    return jFB.init(json);
  };

})(window);
