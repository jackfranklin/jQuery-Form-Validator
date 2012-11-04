## jQuery Form Validator

I got bored of using other people's validators that didn't work just as I wanted.

So I created one.

This is _not_ a jQuery plugin, but does depend on jQuery.

## Demo

There's a demo included in the `demo/` folder.

The basic idea goes, that you have a HTML form:

```html
<form>
  Username: <input type="text" name="username" />
  Short Name: <input type="text" name="shortname" />
  <input type="submit" value="go" />
</form>
```

And you set up your validator and add some validations:

```javascript
var userForm = window.FormValidator();
//add the fields of your form to the builder
userForm.addFields($("input[type='text']"));
```

Then when the form is submitted, see if those validations pass or not:

```
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
```

You can add your own validation methods too:

```javascript
.addValidationMethod("exact_length", function(obj, x) {
  return $(obj).val().length == x[0];
}, "Field %F has to be %ARG characters");
```

These are further documented below.


Once a field is added, you can also get at its attributes and the DOM element (not something you'll do much, but might come in handy):

```javascript
console.log(userForm.field("username").attributes); //=> { name: "username" type: "text" }
console.log(userForm.field("username").html); //=> [ <input type="text" name="username"> ]
```

## Documentation

If anything's not clear, the best place to look is the tests. Every public method is tested in there.


## Tests

The project is tested with Jasmine - there's tests in `test`. Load up `SpecRunner.html` in your browser to see the green passes.

If you make a pull request, please write tests for it :)

## Todo

- Integrate into Grunt.JS
- Add more validation methods
- Add NodeJS support
- Add AMD support

## Changelist

__4th Nov__
- first release!
