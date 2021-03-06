## jQuery Form Validator

I got bored of using other people's validators that didn't work just as I wanted.

So I created one.

This is _not_ a jQuery plugin, but does depend on jQuery.

## Demo

There's a demo included in the `demo/` folder. If you're not sure on the documentation, you should look at the demo first. It contains a pretty solid example on how to use the library. All the main methods are also covered in the tests, so between this document, the demo and the tests, you should be set. Any problems, raise an issue or tweet @Jack_Franklin.

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
var userForm = window.FormValidator($("input[type='text']"));

//add your validations
userForm.addValidation("username", {
  min_length: 6,
  required: true
});
userForm.addValidation("shortname", { max_length: 5 });
```

Then when the form is submitted, see if those validations pass or not:

```javascript
var validationResult = userForm.runValidations();
if(validationResult.valid) {
  $("h3").text("form validated!");
} else {
  //you might just want to loop through all errors from all fields and display them:
  $("h3").text("All Errors:");
  for(var i = 0; i < validationResult.messages.length; i++) {
    var newLi = $("<li />", {
      text: validationResult.messages[i]
    }).appendTo("ul");
  }

  //or loop through the errors for each field, and add them just after the field in a span tag:
  for(var field in validationResult.fields) {
    var fieldObj = validationResult.fields[field];
    if(!fieldObj.valid) {
      var errorSpan = $("<span />", {
        "class" : "error",
        "text" : fieldObj.messages.join(", ")
      });
      fieldObj.html.after(errorSpan);
    }
  }
}
```

You can add your own validation methods too:

```javascript
.addValidationMethod("exact_length", function(val, arg) {
  return val.length == arg;
}, "Field %F has to be %ARG characters");
```

These are further documented below.


Once a field is added, you can also get at its attributes and a jQuery object containing the element (not particularly useful but may come in handy).

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
Takes the field name and an object of validations, and runs them, returning the response. For example:

```javascript
validateField("username", {
  min_length: 5,
  required: true
});

//returns
{
  valid: true, //if the validations passed or failed
  messages: [] //any error messages that were returned
}
```

#### `addValidation(name, validations)`
Works identically to `validateField` with one key exception. It adds a validation but _doesn't_ run it. You can also add multiple validations in two different ways. Either:

```javascript
addValidation("username", {
  min_length: 5,
  required: true
});
```

or

```javascript
addValidation("username", { min_length: 5 });
addValidation("username", { required: true });
```

The first is preferred but the second may be useful if you need to programatically add validations at different times.

#### `clearPendingValidations()`
Clears all pending validations so none remain.

#### `runValidations(clearAfter)` returns `Object`

__New in 0.6:__ returns a more complex object with each field's messages individually, along with the field's jQuery object.

Runs all pending validations, returning a response object.

If you pass in an argument of `true`, it clears the pending validations object completely.

The response is like so:

```javascript
{
  valid: true, //boolean true or false, if the entire validation set was valid
  messages: [], //array of error messages of all fields combined
  fields: {
    username: {
      field: { //the same object you would get from calling yourForm.field("username")
        html: [ <input type="text" name="username" /> ],
        attributes: {
          type: "text",
          name: "username"
        }
      },
      messages: [], //error messages for just that field
      valid: true, //boolean true/false for if THAT field was valid or not
      html: [ <input type="text" name="username" />] //jQuery object for that field. A shortcut to the html property of the field object
    }
  }
}
```

#### `getPendingValidations` returns `Object`
Returns the pending validations as a key-value object, with the key being the field name, and the value being the validation string. Sample response:

```javascript
{
  username: {
    min_length: 4,
    required: true
  },
  email: {
    max_length: 20
  }
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

#### `addValidationMethod(name, obj)`

Pass in the validation name and an object of properties.

```javascript
var new_matches = {
  message: "Field %F must equal %ARG",
  fn: function(val, arg) {
    return val == arg;
  }
}
addValidationMethod('matches', new_matches);
```

`name` is the name you'll refer to when adding validations to a field.
`obj` should contain two fields:
`fn` is the function that's run to test the validation. It's passed three arguments:
- the value of the field you're validating against
- the parameter(s) it's called with
- a jQuery object containing the field
It's unlikely you'll ever use the third parameter, but it's there if you need it. A validation method just needs to return true or false.

`message` is the method's error message. These contain placeholders, which are documented below.

For example, the `min_length` validation function looks like so:

```javascript
function(val, arg) {
  return val.length >= arg;
},
```

Because I know `min_length` will only take one argument, I can just reference the variable passed in. Validation methods are only passed in an array of arguments if they take more than one. If they only take one, that one value is passed in. Compare the above to the `length_inbetween` validator:

```javascript
length_between: {
  message: "Field %F must be a minimum of %ARGS[0] characters and a maximum of %ARGS[1]",
  fn: function(val, args) {
    var len = val.length;
    return (len >= args[0] && args[1] >= len);
  }
}
```

Notice how I don't even bother referencing the 3rd argument, as I wont need it. Usually just the field's value is all you'll need.

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
addValidationMethod("exact_length", {
  fn: function(val, arg) {
    return val.length == arg;
  },
  message: "Field %F has to be %ARG characters"
});
```

Which could then be used as `{ exact_length: 6 }`

### Changing Validation Messages
It's likely that you might want to change the built in messages that come out of the box. You can do this through two methods:

#### `getValidationMethod(name)` returns `Object`
Returns an object that represents a validator. Example:

`getValidationMethod("matches")`

Returns:

```javascript
{
  message: "Field %F must match %ARG",
  fn: function(val, arg) {
    return val == arg;
  }
}
```

#### `addValidationMethod(name, obj)`

Pass in the validation name and an object to save it:

```javascript
var new_matches = {
  message: "Field %F must equal %ARG",
  fn: function(val, arg) {
    return val == arg;
  }
}

saveValidationMethod("matches", new_matches);
```

And that's it! A good place to start is `demo/demo.js`, which has a plain example to get you going in the right direction.

## Contributing

This project uses Grunt JS for testing, linting and deploying.

Install Grunt JS: `npm install -g grunt`

Then clone and cd into this repository and run `npm install`.

Now you should be able to run `grunt` to lint, test, concatenate and minify.

Tests are written in Jasmine and can be tested with `grunt jasmine`.

You can run linting with `grunt lint`.

Run lints and tests with `grunt test`.

If you make a pull request, please write tests for it :)

#### Contributors

- @jackfranklin
- @joshstrange

## Todo

- Add NodeJS support
- test and document cross-browser support

## Changelog

__Version 0.9.2__
- added `fields()` method, which returns the fields object of a JFV instance.

__Version 0.9.1__
- add methods to `JFV.prototype`, not just to the `JFV` object.

__Version 0.9__
- support AMD libraries like RequireJS.
- switch to using proper semantic versioning (from this point on)
- generated a Docco build file (see `docs/`).
- rewrote library as a JS class (public API usage hasn't changed)
- support validating checkboxes as well as text fields

__Version 0.6__
- changed the response object to return each field and its error messages indidividually - thanks @joshstrange for the initial idea and some of the code.

__Version 0.5__
- Fixed a typo in the README - thanks @joshstrange
- use Regex to replace within messages - thanks @joshstrange
- Integrated into Grunt JS (see section on Contributing)

__Version 0.4__
- made it onto Hacker News!
- thanks to a suggestion on there, ditched using strings for validations and switched to JS objects, which make much more sense. So, instead of:

```javascript
addValidation("username", "min_length(5)|required");
```

It's now:

```javascript
addValidation("username", { min_length: 5, required: true });
```

A few things have changed as a by-product of this - please do read the docs carefully. Any questions please ask away!

__Version 0.3__
- rewrote the validation methods so they are passed in three arguments: `value, args, obj`. Realised most methods will only care about the field value, so pass that in directly rather than just the object to streamline the validation methods. Object is passed in as 3rd argument if it is needed.

__Version 0.2__
- ability to add fields through the `FormValidator` method.
- `runValidations` takes optional argument which, if set to true, will clear pending validations once run.
- added `getPendingValidations` method.

__Version 0.1__
- first release!
