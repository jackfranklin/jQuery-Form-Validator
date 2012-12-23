describe("jQuery Form Validator", function() {
  it("sets up the global FormValidator object and returns it", function() {
    expect(window.FormValidator()).toBeTruthy()
  });

  describe("adding HTML elements", function() {
    it("can set up fields passed into it when initialised", function() {
      var formField = $("<input/>", {
        type: "text",
        name: "email",
        "class": "emailField"
      });
      var form = window.FormValidator(formField);
      expect(form.field("email")).toBeDefined();
      expect(form.field("email").attributes["class"]).toEqual("emailField");
    });
    it("can parse a new form field from given HTML object", function() {
      var formField = $("<input/>", {
        type: "text",
        name: "email",
        "class": "emailField"
      });
      var form = FormValidator();
      form.addField(formField)
      expect(form.field("email")).toBeDefined();
      expect(form.field("email").attributes["class"]).toEqual("emailField");
    });
    it("can manage multiple fields at once", function() {
      var formField1 = $("<input/>", {
        type: "text",
        name: "username",
        "class": "userField"
      });
      var formField2 = $("<input/>", {
        type: "text",
        name: "email",
        "class": "emailField"
      });
      var form = FormValidator();
      var fields = formField1.add(formField2);
      form.addFields(fields);
      expect(form.field("email")).toBeDefined();
      expect(form.field("username").attributes.type).toEqual("text");
    });
  });

  describe("validation", function() {
    var validationTest;
    beforeEach(function() {
      var field = $("<input/>", {
        type: "text",
        name: "username",
        "class": "userField"
      });
      validationTest = FormValidator(field);
    });

    describe("min_length", function() {
      it("returns true for fields that are of the minimum length", function() {
        $(validationTest.field("username").html).val("jackfranklin");
        var resp = validationTest.validateField("username", { min_length: 5 });
        expect(resp.valid).toEqual(true);
      });

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.field("username").html).val("j");
        var resp = validationTest.validateField("username", { min_length: 5 });
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be at least length 5");
      });

    });

    describe("max_length", function() {
      it("returns true for values under the max length", function() {
        $(validationTest.field("username").html).val("jackf");
        expect(validationTest.validateField("username", { max_length: 6 }).valid).toEqual(true);
      });

      it("returns false for fields over the max length", function() {
        $(validationTest.field("username").html).val("jackf");
        var resp = validationTest.validateField("username", { max_length: 4 });
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 4 characters");
      });
    });

    describe("required", function() {
      it("returns true if the field is not empty", function() {
        $(validationTest.field("username").html).val("jackf");
        expect(validationTest.validateField("username", { required: true }).valid).toEqual(true);
        $(validationTest.field("username").html).val("0");
        expect(validationTest.validateField("username", { required: true }).valid).toEqual(true);
      });
      it("returns false if the field is empty", function() {
        $(validationTest.field("username").html).val("");
        var resp = validationTest.validateField("username", { required: true });
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username is required");
      });
    });

    describe("length_between", function() {
      it("returns true if the length is between the two values", function() {
        $(validationTest.field("username").html).val("jackf");
        expect(validationTest.validateField("username", { length_between: [4, 6] }).valid).toEqual(true)
      });

      it("returns false if length is not inside the values", function() {
        $(validationTest.field("username").html).val("jackfranklin");
        var resp = validationTest.validateField("username", { length_between: [4, 6] });
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a minimum of 4 characters and a maximum of 6");
      });
    });

    describe("matches", function() {
      it("returns true if the data matches", function() {
        $(validationTest.field("username").html).val("jackf");
        expect(validationTest.validateField("username", { matches: "jackf" }).valid).toEqual(true)
      });

      it("returns false if the data doesn't match", function() {
        $(validationTest.field("username").html).val("jackfranklin");
        var resp = validationTest.validateField("username", { matches: "jack" });
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must match jack");
      });
    });

    describe("throws an error if validation method does not exist", function() {
      it("throws an error", function() {
        expect(function() {
          validationTest.validateField("username", { blahblah: true });
        }).toThrow(new Error("Validation method blahblah does not exist"));
      });
    });


    describe("multiple validations", function() {
      it("returns true for a field that passes both min & max length validations", function() {
        $(validationTest.field("username").html).val("jackf");
        var resp = validationTest.validateField("username", {
          min_length: 4,
          max_length: 7
        });
        expect(resp.valid).toEqual(true);
      });
      it("returns false if one of the validations fails", function() {
        $(validationTest.field("username").html).val("jackfranklin");
        var resp = validationTest.validateField("username", {
          min_length: 4,
          max_length: 7
        });
        expect(resp.messages.length).toEqual(1);
        expect(resp.valid).toEqual(false);
      });

      it("returns multiple error messages when multiple validations fail", function() {
        $(validationTest.field("username").html).val("jackfranklin");
        var resp = validationTest.validateField("username", {
          max_length: 5,
          matches: "jackf"
        });
        expect(resp.messages.length).toEqual(2);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 5 characters");
        expect(resp.messages[1]).toEqual("Field username must match jackf");
      });
    });

    describe("user can add their own validations", function() {
      it("lets the user add a validation which then works", function() {

        validationTest.addValidationMethod("exact_length", {
          fn: function(val, arg) {
            return val.length === arg;
          },
          message: "Field %F has to be %ARG characters"
        });
        $(validationTest.field("username").html).val("jackf");
        expect(validationTest.validateField("username", { exact_length: 5 }).valid).toEqual(true);

        $(validationTest.field("username").html).val("jackfranklin");
        var resp = validationTest.validateField("username", { exact_length: 5 });
        expect(resp.messages[0]).toEqual("Field username has to be 5 characters");
      });

      it("allows users to edit the error messages of validations", function() {
        var min_length = validationTest.getValidationMethod("min_length");
        min_length.message = "Field %F has to be at least %ARG characters";
        validationTest.addValidationMethod("min_length", min_length);
        $(validationTest.field("username").html).val("jack");
        expect(validationTest.validateField("username", { min_length: 5 }).messages[0]).toEqual("Field username has to be at least 5 characters");

      });
    });



    describe("validations can be added and run at a later time", function() {
      beforeEach(function() {
        validationTest.clearPendingValidations();
      });


      it("adds validations to a list", function() {
        validationTest.addValidation("username", { min_length: 5 });
        validationTest.addValidation("email", { required: true });
        var formField = $("<input/>", {
          type: "text",
          name: "email",
          "class": "emailField"
        });
        validationTest.addField(formField);

        $(validationTest.field("username").html).val("jackf");

        var validationResp = validationTest.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.fields["email"].messages.length).toEqual(1);
        expect(validationResp.fields["email"].messages[0]).toEqual("Field email is required");
        expect(validationResp.fields["email"].valid).toEqual(false);
      });

      it("returns an allMessages property that has messages for all fields", function() {
        var formField = $("<input/>", {
          type: "text",
          name: "email",
          "class": "emailField"
        });
        validationTest.addField(formField);
        validationTest.addValidation("username", { min_length: 5 });
        validationTest.addValidation("email", { min_length: 6 });

        validationTest.field("username").html.val("jack");
        validationTest.field("email").html.val("jack");

        var validationResp = validationTest.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(2);
        expect(validationResp.fields.email.messages.length).toEqual(1);
        expect(validationResp.fields.username.valid).toEqual(false);
      });
      it("can add validations for same field multiple times", function() {
        validationTest.addValidationMethod("exact_length", {
          fn: function(val, arg) {
            return val.length === arg;
          },
          message: "Field %F has to be %ARG characters"
        });
        validationTest.addValidation("username", { exact_length: 5 });
        validationTest.addValidation("username", { matches: "jackf" });

        // check that its valid
        validationTest.field("username").html.val("jackf");
        var validationResp = validationTest.runValidations();
        expect(validationResp.valid).toEqual(true);

        //now check its invalid if both fail
        $(validationTest.field("username").html).val("jackfranklin");
        validationResp = validationTest.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.fields["username"].messages.length).toEqual(2);

        //now check its invalid if just one fails
        $(validationTest.field("username").html).val("jackd");
        validationResp = validationTest.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.fields["username"].messages.length).toEqual(1);
        expect(validationResp.fields["username"].valid).toEqual(false);

      });

      it("provides a method to access pending validations", function() {
        validationTest.addValidation("username", { exact_length: 5 });
        validationTest.addValidation("email", { required: true });
        var pending = validationTest.getPendingValidations();
        expect(pending.username.exact_length).toEqual(5);
        expect(pending.email.required).toEqual(true);
      });

      it("lets runValidations be given a flag to clear pending validations", function() {
        validationTest.addValidationMethod("exact_length", {
          fn: function(val, arg) {
            return val.length === arg;
          },
          message: "Field %F has to be %ARG characters"
        });
        validationTest.addValidation("username", { exact_length: 5 });
        validationTest.addValidation("username", { matches: "jackf" });
        $(validationTest.field("username").html).val("jackf");
        var validationResp = validationTest.runValidations();

        //now check pending validations still exist
        var pending = validationTest.getPendingValidations();
        expect(pending.username.exact_length).toEqual(5);

        //run again with flag
        validationTest.runValidations(true);
        //now check pending validations are empty
        var pending = validationTest.getPendingValidations();
        expect(pending.username).not.toBeDefined();
      });
    });
  });
  describe("validating checkboxes", function() {
    var form;
    beforeEach(function() {
      var field = $("<input />", {
        type: "checkbox",
        name: "yesno"
      });
      form = FormValidator(field);
    });

    it("passes required validation when checked", function(){
      form.field("yesno").html.prop("checked", true);
      var resp = form.validateField("yesno", { required: true });
      expect(resp.valid).toEqual(true);
    });

    it("fails required validation when checked", function(){
      form.field("yesno").html.prop("checked", false);
      var resp = form.validateField("yesno", { required: true });
      expect(resp.valid).toEqual(false);
    });
  });

});
