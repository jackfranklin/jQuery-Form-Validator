$(function() {
  var userForm = window.FormValidator($("input[type='text']"));

  //add your validations
  userForm.addValidation("username", {
    min_length: 6,
    required: true
  });
  userForm.addValidation("shortname", { max_length: 5 });

  $("form").on("submit", function(e) {
    $("ul").html("");
    e.preventDefault();

    //now run your validations
    var validationResult = userForm.runValidations();
    if(validationResult.valid) {
      $("h3").text("form validated!");
    } else {
      $("h3").text("All Errors:");
      for(var i = 0; i < validationResult.messages.length; i++) {
        var newLi = $("<li />", {
          text: validationResult.messages[i]
        }).appendTo("ul");
      }

      // or you can do errors on a field by field basis
      for(var field in validationResult.fields) {
        var fieldObj = validationResult.fields[field];
        if(!fieldObj.valid) {
          var errorSpan = $("<span />", {
            "class" : "error",
            "text" : fieldObj.messages.join(", ")
          });
          console.log(fieldObj);
          fieldObj.html.after(errorSpan);
        }
      }
    }
  });

});
