describe("jQuery Form Validator", function() {

  var testData = {};
  beforeEach(function() {
    testData.validJson = '{ "name" : "Jack Franklin", "Age" : 20 }';
    testData.invalidJson = '{ "Name" : Jack Franklin }';
    testData.formJson = '{ "fields" : [{ "element": "input", "type": "text", "class": "testClass", "name": "username" }]}';
  });


  it("sets up the global FormBuilder method", function() {
    expect(window.FormBuilder(testData.validJson)).toBeTruthy()
  });


  it("throws an error if the JSON passed in is incorrect", function() {
    expect(function() {window.FormBuilder(testData.invalidJson)}).toThrow(new Error("JSON is not valid"));
  });

  it("does not throw an error if JSON passed in is valid", function() {
    expect(window.FormBuilder(testData.validJson)).toBeTruthy();
  });

  it("does not throw an error if no JSON is passed in", function() {
    expect(window.FormBuilder()).toBeTruthy();
  });

  describe("generating the fields", function() {
    it("can parse out the attributes for each input", function() {
      var formData = FormBuilder(testData.formJson);
      formData.generate();
      expect(formData.field("username").attributes.class).toEqual("testClass");
    });
  });

  describe("adding HTML elements to the form generator", function() {
    it("can parse a new form field from given HTML object", function() {
      var formField = $("<input/>", {
        type: "text",
        name: "email",
        class: "emailField"
      });
      var formData = FormBuilder(testData.formJson);
      formData.generate().addField(formField);
      expect(formData.field("email")).toBeDefined();
      expect(formData.field("email").attributes.class).toEqual("emailField");
    });
    it("can manage multiple fields at once", function() {
      var formField1 = $("<input/>", {
        type: "text",
        name: "username",
        class: "userField"
      });
      var formField2 = $("<input/>", {
        type: "text",
        name: "email",
        class: "emailField"
      });
      var formData = FormBuilder();
      var fields = formField1.add(formField2);
      formData.addFields(fields);
      expect(formData.field("email")).toBeDefined();
      expect(formData.field("username").attributes.type).toEqual("text");
    });
  });

  describe("validation", function() {
    var validationTest = {};
    beforeEach(function() {
      validationTest.formData = FormBuilder(testData.formJson);
      validationTest.formData.generate();
    });

    describe("min_length", function() {
      it("returns true for fields that are of the minimum length", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.V.validateField("username", "min_length(5)");
        expect(resp.valid).toEqual(true);
      });

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.formData.field("username").html).val("j");
        var resp = validationTest.formData.V.validateField("username", "min_length(5)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be at least length 5");
      });

    });

    describe("max_length", function() {
      it("returns true for values under the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.V.validateField("username", "max_length(6)").valid).toEqual(true);
      });

      it("returns false for fields over the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        var resp = validationTest.formData.V.validateField("username", "max_length(4)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 4 characters");
      });
    });

    describe("required", function() {
      it("returns true if the field is not empty", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.V.validateField("username", "required").valid).toEqual(true);
        $(validationTest.formData.field("username").html).val("0");
        expect(validationTest.formData.V.validateField("username", "required").valid).toEqual(true);
      });
      it("returns false if the field is empty", function() {
        $(validationTest.formData.field("username").html).val("");
        var resp = validationTest.formData.V.validateField("username", "required");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username is required");
      });
    });

    describe("length_between", function() {
      it("returns true if the length is between the two values", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.V.validateField("username", "length_between(4,6)").valid).toEqual(true)
      });

      it("returns false if length is not inside the values", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.V.validateField("username", "length_between(4,6)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a minimum of 4 characters and a maximum of 6");
      });
    });

    describe("matches", function() {
      it("returns true if the data matches", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.V.validateField("username", "matches(jackf)").valid).toEqual(true)
      });

      it("returns false if the data doesn't match", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.V.validateField("username", "matches(jack)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must match jack");
      });
    });

    describe("throws an error if validation method does not exist", function() {
      it("throws an error", function() {
        expect(function() {
          validationTest.formData.V.validateField("username", "blahblah");
        }).toThrow(new Error("Validation method blahblah does not exist"));
      });
    });


    describe("multiple validations", function() {
      it("returns true for a field that passes both min & max length validations", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        var resp = validationTest.formData.V.validateField("username", "min_length(4)|max_length(7)")
        expect(resp.valid).toEqual(true);
      });
      it("returns false if one of the validations fails", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.V.validateField("username", "min_length(4)|max_length(7)")
        expect(resp.messages.length).toEqual(1);
        expect(resp.valid).toEqual(false);
      });

      it("returns multiple error messages when multiple validations fail", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.V.validateField("username", "max_length(5)|matches(jackf)");
        expect(resp.messages.length).toEqual(2);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 5 characters");
        expect(resp.messages[1]).toEqual("Field username must match jackf");
      });
    });

    describe("user can add their own validations", function() {
      it("lets the user add a validation which then works", function() {

        validationTest.formData.V.addValidationMethod("exact_length", function(obj, x) {
          return $(obj).val().length == x[0];
        }, "Field %F has to be %ARG characters");
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.V.validateField("username", "exact_length(5)").valid).toEqual(true);

        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.V.validateField("username", "exact_length(5)")
        expect(resp.messages[0]).toEqual("Field username has to be 5 characters");
      });

      it("allows users to edit the error messages of validations", function() {
        var min_length = validationTest.formData.V.getValidationMethod("min_length");
        min_length.message = "Field %F has to be at least %ARG characters";
        validationTest.formData.V.saveValidationMethod("min_length", min_length);
        $(validationTest.formData.field("username").html).val("jack");
        expect(validationTest.formData.V.validateField("username", "min_length(5)").messages[0]).toEqual("Field username has to be at least 5 characters");

      });
    });


    describe("validations can be added and run at a later time", function() {
      beforeEach(function() {
        validationTest.formData.V.clearPendingValidations();
      });

      it("adds validations to a list", function() {
        validationTest.formData.V.addValidation("username", "exact_length(5)");
        validationTest.formData.V.addValidation("email", "required");
        var formField = $("<input/>", {
          type: "text",
          name: "email",
          class: "emailField"
        });
        validationTest.formData.addField(formField);

        $(validationTest.formData.field("username").html).val("jackf");

        var validationResp = validationTest.formData.V.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(1);
        expect(validationResp.messages[0]).toEqual("Field email is required");
      });

      it("can add validations for same field multiple times", function() {
        validationTest.formData.V.addValidation("username", "exact_length(5)");
        validationTest.formData.V.addValidation("username", "matches(jackf)");

        // check that its valid
        $(validationTest.formData.field("username").html).val("jackf");
        var validationResp = validationTest.formData.V.runValidations();
        expect(validationResp.valid).toEqual(true);

        //now check its invalid if both fail
        $(validationTest.formData.field("username").html).val("jackfranklin");
        validationResp = validationTest.formData.V.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(2);

        //now check its invalid if just one fails
        $(validationTest.formData.field("username").html).val("jackd");
        validationResp = validationTest.formData.V.runValidations();
        expect(validationResp.valid).toEqual(false);
        expect(validationResp.messages.length).toEqual(1);

      });
    });
  });

});
