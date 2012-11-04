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
    var validationTest = {};
    beforeEach(function() {
      validationTest.formData = FormValidator();
    });

    describe("min_length", function() {
      it("returns true for fields that are of the minimum length", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validateField("username", "min_length(5)");
        expect(resp.valid).toEqual(true);
      });

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.formData.field("username").html).val("j");
        var resp = validationTest.formData.validateField("username", "min_length(5)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be at least length 5");
      });

    });

    describe("max_length", function() {
      it("returns true for values under the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validateField("username", "max_length(6)").valid).toEqual(true);
      });

      it("returns false for fields over the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        var resp = validationTest.formData.validateField("username", "max_length(4)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 4 characters");
      });
    });

    describe("required", function() {
      it("returns true if the field is not empty", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validateField("username", "required").valid).toEqual(true);
        $(validationTest.formData.field("username").html).val("0");
        expect(validationTest.formData.validateField("username", "required").valid).toEqual(true);
      });
      it("returns false if the field is empty", function() {
        $(validationTest.formData.field("username").html).val("");
        var resp = validationTest.formData.validateField("username", "required");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username is required");
      });
    });

    describe("length_between", function() {
      it("returns true if the length is between the two values", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validateField("username", "length_between(4,6)").valid).toEqual(true)
      });

      it("returns false if length is not inside the values", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validateField("username", "length_between(4,6)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a minimum of 4 characters and a maximum of 6");
      });
    });

    describe("matches", function() {
      it("returns true if the data matches", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validateField("username", "matches(jackf)").valid).toEqual(true)
      });

      it("returns false if the data doesn't match", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validateField("username", "matches(jack)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must match jack");
      });
    });

    describe("throws an error if validation method does not exist", function() {
      it("throws an error", function() {
        expect(function() {
          validationTest.formData.validateField("username", "blahblah");
        }).toThrow(new Error("Validation method blahblah does not exist"));
      });
    });


    describe("multiple validations", function() {
      it("returns true for a field that passes both min & max length validations", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        var resp = validationTest.formData.validateField("username", "min_length(4)|max_length(7)")
        expect(resp.valid).toEqual(true);
      });
      it("returns false if one of the validations fails", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validateField("username", "min_length(4)|max_length(7)")
        expect(resp.messages.length).toEqual(1);
        expect(resp.valid).toEqual(false);
      });

      it("returns multiple error messages when multiple validations fail", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validateField("username", "max_length(5)|matches(jackf)");
        expect(resp.messages.length).toEqual(2);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 5 characters");
        expect(resp.messages[1]).toEqual("Field username must match jackf");
      });
    });

    describe("user can add their own validations", function() {
      it("lets the user add a validation which then works", function() {

        validationTest.formData.addValidationMethod("exact_length", function(obj, x) {
          return $(obj).val().length == x[0];
        }, "Field %F has to be %ARG characters");
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validateField("username", "exact_length(5)").valid).toEqual(true);

        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validateField("username", "exact_length(5)")
        expect(resp.messages[0]).toEqual("Field username has to be 5 characters");
      });

      it("allows users to edit the error messages of validations", function() {
        var min_length = validationTest.formData.getValidationMethod("min_length");
        min_length.message = "Field %F has to be at least %ARG characters";
        validationTest.formData.saveValidationMethod("min_length", min_length);
        $(validationTest.formData.field("username").html).val("jack");
        expect(validationTest.formData.validateField("username", "min_length(5)").messages[0]).toEqual("Field username has to be at least 5 characters");

      });
    });



    describe("validations can be added and run at a later time", function() {
      beforeEach(function() {
        validationTest.formData.clearPendingValidations();
      });


      it("adds validations to a list", function() {
        validationTest.formData.addValidation("username", "exact_length(5)");
        validationTest.formData.addValidation("email", "required");
        var formField = $("<input/>", {
          type: "text",
          name: "email",
          "class": "emailField"
        });
        validationTest.formData.addField(formField);

        $(validationTest.formData.field("username").html).val("jackf");

        var validationResp = validationTest.formData.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(1);
        expect(validationResp.messages[0]).toEqual("Field email is required");
      });

      it("can add validations for same field multiple times", function() {
        validationTest.formData.addValidation("username", "exact_length(5)");
        validationTest.formData.addValidation("username", "matches(jackf)");

        // check that its valid
        $(validationTest.formData.field("username").html).val("jackf");
        var validationResp = validationTest.formData.runValidations();
        expect(validationResp.valid).toEqual(true);

        //now check its invalid if both fail
        $(validationTest.formData.field("username").html).val("jackfranklin");
        validationResp = validationTest.formData.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(2);

        //now check its invalid if just one fails
        $(validationTest.formData.field("username").html).val("jackd");
        validationResp = validationTest.formData.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(1);

      });

      it("provides a method to access pending validations", function() {
        validationTest.formData.addValidation("username", "exact_length(5)");
        validationTest.formData.addValidation("email", "required");
        var pending = validationTest.formData.getPendingValidations();
        expect(pending.username).toEqual("exact_length(5)");
        expect(pending.email).toEqual("required");
      });

      it("lets runValidations be given a flag to clear pending validations", function() {
        validationTest.formData.addValidation("username", "exact_length(5)");
        validationTest.formData.addValidation("username", "matches(jackf)");
        $(validationTest.formData.field("username").html).val("jackf");
        var validationResp = validationTest.formData.runValidations();

        //now check pending validations still exist
        var pending = validationTest.formData.getPendingValidations();
        expect(pending.username).toEqual("exact_length(5)|matches(jackf)");

        //run again with flag
        validationTest.formData.runValidations(true);
        //now check pending validations are empty
        var pending = validationTest.formData.getPendingValidations();
        expect(pending.username).not.toBeDefined();
      });
    });
  });

});
