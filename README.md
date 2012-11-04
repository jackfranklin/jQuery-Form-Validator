##jQuery Form Builder

A little project to provide an easy way of validating and creating forms.


```html
<form>
  Username: <input type="text" name="username" />
  Real Name: <input type="text" name="realname" />
  <input type="submit" value="go" />
</form>
```


```javascript
var userForm = window.FormBuilder();
userForm.addField($("input[type='text']"));
console.log(userForm.field("username").attributes); //=> { name: "username" type: "text" }
console.log(userForm.field("username").html); //=> [ <input type="text" name="username"> ]
```


##Contributing

* Work on the __DEVELOP__ branch, not master.
* Write tests!

