/**
 * jQuery Form Builder
 * Written by Jack Franklin and Ben Everard
 *
 * https://github.com/jackfranklin/jquery-form-builder
 **/

(function(window) {
  var jFB = {

    init: function(json) {
      try {
        JSON.parse(json)
      } catch (e) {
        throw new Error("JSON is not valid");
        return false;
      }
      return this;
    }


  };

  window.FormBuilder = function(json) {
    return jFB.init(json);
  };

})(window);
