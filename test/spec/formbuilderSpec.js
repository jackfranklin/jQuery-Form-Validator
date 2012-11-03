describe("jQuery Form Builder", function() {

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
        var resp = validationTest.formData.validate("username", "min_length(5)");
        expect(resp.valid).toEqual(true);
      });

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.formData.field("username").html).val("j");
        var resp = validationTest.formData.validate("username", "min_length(5)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be at least length 5");
      });

    });

    describe("max_length", function() {
      it("returns true for values under the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(6)").valid).toEqual(true);
      });

      it("returns false for fields over the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        var resp = validationTest.formData.validate("username", "max_length(4)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a maximum of 4 characters");
      });
    });

    describe("required", function() {
      it("returns true if the field is not empty", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "required").valid).toEqual(true);
        $(validationTest.formData.field("username").html).val("0");
        expect(validationTest.formData.validate("username", "required").valid).toEqual(true);
      });
      it("returns false if the field is empty", function() {
        $(validationTest.formData.field("username").html).val("");
        var resp = validationTest.formData.validate("username", "required");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username is required");
      });
    });

    describe("length_between", function() {
      it("returns true if the length is between the two values", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "length_between(4,6)").valid).toEqual(true)
      });

      it("returns false if length is not inside the values", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validate("username", "length_between(4,6)");
        expect(resp.valid).toEqual(false);
        expect(resp.messages[0]).toEqual("Field username must be a minimum of 4 characters and a maximum of 6");
      });
    });

    describe("matches", function() {
      it("returns true if the data matches", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "matches(jackf)").valid).toEqual(true)
      });

      it("returns false if the data doesn't match", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validate("username", "matches(jack)");
        expect(resp.valid).toEqual(false);
      });
    });

    describe("throws an error if validation method does not exist", function() {
      it("throws an error", function() {
        expect(function() {
          validationTest.formData.validate("username", "blahblah");
        }).toThrow(new Error("Validation method blahblah does not exist"));
      });
    });


    describe("multiple validations", function() {
      it("returns true for a field that passes both min & max length validations", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        var resp = validationTest.formData.validate("username", "min_length(4)|max_length(7)")
        expect(resp.valid).toEqual(true);
      });
      it("returns false if one of the validations fails", function() {
        $(validationTest.formData.field("username").html).val("jackfranklin");
        var resp = validationTest.formData.validate("username", "min_length(4)|max_length(7)")
        expect(resp.messages.length).toEqual(1);
        expect(resp.valid).toEqual(false);
      });
    });

    // describe("user can add their own validations", function() {
    //   it("lets the user add a validation which then works", function() {
    //     validationTest.formData.addValidationMethod("exact_length", function(obj, x) {
    //       return $(obj).val().length == x[0];
    //     });
    //     $(validationTest.formData.field("username").html).val("jackf");
    //     expect(validationTest.formData.validate("username", "exact_length(5)")).toEqual(true);
    //     $(validationTest.formData.field("username").html).val("jackfranklin");
    //     expect(validationTest.formData.validate("username", "exact_length(5)")).toEqual(false);
    //   });
    // });

    // describe("validations can be added and run at a later time", function() {
    //   it("adds validations to a list", function() {
    //     validationTest.formData.add_validation("username", "exact_length(5)");
    //     validationTest.formData.add_validation("email", "required");
    //     var formField = $("<input/>", {
    //       type: "text",
    //       name: "email",
    //       class: "emailField"
    //     });
    //     validationTest.formData.addField(formField);

    //     $(validationTest.formData.field("username").html).val("jackf");

    //     var validationResp = validationTest.formData.run_validations();
    //     expect(validationResp.valid).toEqual(false);
    //     expect(validationResp.messages.length).toEqual(1);
    //     expect(validationResp.messages[0]).toEqual("Field email is required");

    //   });
    // });
  });

});
