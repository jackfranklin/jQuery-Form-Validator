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
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(true);
      });

      it("returns true for fields that are exactly the minimum length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(true);
      });

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.formData.field("username").html).val("j");
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(false);
      });

    });

    describe("max_length", function() {
      it("returns true for fields under the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(6)")).toEqual(true);
      });

      it("returns false for fields over the max length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(4)")).toEqual(false);
      });

      it("returns true for fields that are the maximum length", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(5)")).toEqual(true);
      });
    });

    describe("required", function() {
      it("returns true if the field is not empty", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "required")).toEqual(true);
        $(validationTest.formData.field("username").html).val("0");
        expect(validationTest.formData.validate("username", "required")).toEqual(true);
      });
      it("returns false if the field is empty", function() {
        $(validationTest.formData.field("username").html).val("");
        expect(validationTest.formData.validate("username", "required")).toEqual(false);
      });
    });

    describe("length_between", function() {
      it("returns true if the length is between the two values", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "length_between(4,6)")).toEqual(true)
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
        expect(validationTest.formData.validate("username", "min_length(4)|max_length(7)")).toEqual(true);
      });
      it("returns false if one of the validations fails", function() {
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "min_length(6)|max_length(7)")).toEqual(false);
      });
    });

    describe("user can add their own validations", function() {
      it("lets the user add a validation which then works", function() {
        validationTest.formData.addValidationMethod("exact_length", function(obj, x) {
          return $(obj).val().length == x[0];
        });
        $(validationTest.formData.field("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "exact_length(5)")).toEqual(true);
        $(validationTest.formData.field("username").html).val("jackfranklin");
        expect(validationTest.formData.validate("username", "exact_length(5)")).toEqual(false);
      });
    });


  });
});
