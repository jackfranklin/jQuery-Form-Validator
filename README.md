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

```javascript
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

### Dealing with Fields

#### `addField(field)`
Adds a field to the form validator, that you can then validate against. Argument can either be any valid CSS selector (any that you would pass into jQuery), or a jQuery object. If the jQuery object has multiple elements, only the first will be saved. Field is added to the internal fields object, which are index by the field's `name` attribute.

#### `addFields(fields)`
Same as `addField`, but handles multiple elements passed in. Either pass in an array of CSS selectors, or a jQuery object.

#### `field(name)` returns `Object`
Pass in a string which is the name of the field, and you get an object back representing it. Rarely useful. Response:

```javascript
{
  html: [ <input type="text" name="foobar" /> ],
  attributes: {
    type: "text",
    name: "foobar"
  }
}
```

### Validation Methods

#### `validateField(name, validations)` returns `Object`
Takes the field name and a string of validations, and runs them, returning the response. For example:

```javascript
validateField("username", "min_length(5)|required");
//returns
{
  valid: true, //if the validations passed or failed
  messages: [] //any error messages that were returned
}
```

#### `addValidation(name, validations)`
Works identically to `validateField` with one key exception. It adds a validation but _doesn't_ run it. You can also add multiple validations in two different ways. Either:

```javascript
addValidation("username", "min_length(5)|required");
```

or

```javascript
addValidation("username", "min_length(5)");
addValidation("username", "required");
```

#### `clearPendingValidations()`
Clears all pending validations so none remain.

#### `runValidations` returns `Object`
Runs all pending validations, returning a response object that's identical to `validateField`. Unlike `validateField`, this runs all pending validations on the _entire form_, across _all fields_.
{
  valid: true,
  messages: []
}






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
