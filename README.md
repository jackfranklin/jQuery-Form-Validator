## jQuery Form Validator

## Version 0.3

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

//now add some validations
userForm.addValidation("username", "min_length(6)|required");
userForm.addValidation("shortname", "max_length(5)");
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

### Getting started

Create a new variable to store your form in:

```javascript
var signUpForm = FormValidator();
```

Then call methods on `signUpForm`:

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

You can combine the adding of fields with the initial step. For example, instead of:

```javascript
var signupForm = FormValidator();
signupForm.addFields(foo);
```

You can do:

```javascript
var signupForm = FormValidator(foo);
```

### Adding and Running Validations

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
Clears all pending validations so none remain. Note that currently, this is __never__ done automatically for you. Pending validations survive even once `runValidations` has been called.

#### `runValidations(clearAfter)` returns `Object`
Runs all pending validations, returning a response object that's identical to `validateField`. Unlike `validateField`, this runs all pending validations on the _entire form_, across _all fields_.

If you pass in an argument of `true`, it clears the pending validations object completely.

The response is like so:

```javascript
{
  valid: true,
  messages: []
}
```

#### `getPendingValidations` returns `Object`
Returns the pending validations as a key-value object, with the key being the field name, and the value being the validation string. Sample response:

```javascript
{
  username: "min_length(4)|required",
  email: "max_length(20)"
}
```

Not used particularly often.


### Validation Methods

Right now only a few validation methods exist out of the box. They are:

* `min_length(x)` the value must have at least x characters
* `max_length(x)` the value can have up to x characters
* `required` the value cannot be blank
* `length_between(x,y)` value must have at least x characters but no more than y
* `matches(str)` value must match str exactly.

There are more to come, but until then, if you end up writing some, please post them on Github and I'll happily pull them in.

There's also methods to add validations.

#### `addValidationMethod(name, fn, message)`
`name` is the name you'll refer to when adding validations to a field.

`fn` is the function that's run to test the validation. It's passed three arguments:
- the value of the field you're validating against
- an array of parameters it was called with
- a jQuery object containing the field

It's unlikely you'll ever use the third parameter, but it's there if you need it. A validation method just needs to return true or false.

For example, the `min_length` validation function looks like so:

```javascript
function(val, args) {
  return val.length >= args[0];
},
```

Notice how I don't even bother referencing the 3rd argument, as I wont need it. Usually just the field's value is all you'll need.

Even if the validation only takes one argument, the args argument is _always_ an array.

`message` is the error message that is returned if the validation fails. This is just a string, but it has a couple of placeholders. `%F` is used to show where the field name will go in the string.

If your validation method takes one parameter, use `%ARG` in the message string as a placeholder as to where that will go. For example, here's the `min_length` message:

```
Field %F must be at least length %ARG"
```

If your validation method takes >1 arguments, refer to the arguments as `%ARGS[0]`, `%ARGS[1]` and so on. For example, here's the `length_between` message:

```
Field %F must be a minimum of %ARGS[0] characters and a maximum of %ARGS[1]
```

Here's an example of how I'd add an `exact_length` validator:

```javascript
addValidationMethod("exact_length", function(val, args) {
  return val.length == args[0];
}, "Field %F has to be %ARG characters");
```

Which could then be used as `"exact_length(6)"`.

### Changing Validation Messages
It's likely that you might want to change the built in messages that come out of the box. You can do this through two methods:

#### `getValidationMethod(name)` returns `Object`
Returns an object that represents a validator. Example:

`getValidationMethod("matches")`

Returns:

```javascript
{
  message: "Field %F must match %ARG",
  fn: function(val, args) {
    return val == args[0];
  }
}
```

#### `saveValidationMethod(name, obj)`

Pass in the validation name and an object to save it:

```javascript
var new_matches = {
  message: "Field %F must equal %ARG",
  fn: function(val, args) {
    return val == args[0];
  }
}

saveValidationMethod("matches", new_matches);
```

And that's it! A good place to start is `demo/demo.js`, which has a plain example to get you going in the right direction.

## Tests

The project is tested with Jasmine - there's tests in `test`. Load up `SpecRunner.html` in your browser to see the green passes.

If you make a pull request, please write tests for it :)

## Todo

- Integrate into Grunt.JS
- Add more validation methods
- Add NodeJS support
- Add AMD support
- test and document cross-browser support

## Changelist

__Version 0.3__
-rewrote the validation methods so they are passed in three arguments: `value, args, obj`. Realised most methods will only care about the field value, so pass that in directly rather than just the object to streamline the validation methods. Object is passed in as 3rd argument if it is needed.

__Version 0.2__
- ability to add fields through the `FormValidator` method.
- `runValidations` takes optional argument which, if set to true, will clear pending validations once run.
- added `getPendingValidations` method.

__Version 0.1__
- first release!
