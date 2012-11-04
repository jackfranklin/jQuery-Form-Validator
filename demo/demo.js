$(function() {
  var userForm = window.FormValidator();

  //add the fields of your form to the builder
  userForm.addFields($("input[type='text']"));

  //add your validations
  userForm.addValidation("username", "min_length(6)|required");
  userForm.addValidation("shortname", "max_length(5)");

  $("form").on("submit", function(e) {
    $("ul").html("");
    e.preventDefault();
    //now run your validations
    var validationResult = userForm.runValidations();
    if(validationResult.valid) {
      $("h3").text("form validated!");
    } else {
      $("h3").text("Errors");
      for(var i = 0; i < validationResult.messages.length; i++) {
        var newLi = $("<li />", {
          text: validationResult.messages[i]
        }).appendTo("ul");
      }
    }
  });

});
