describe("jQuery Form Builder", function() {

  testData = {};
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
      expect(formData.fields("username").attributes.class).toEqual("testClass");
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
        $(validationTest.formData.fields("username").html).val("jackfranklin");
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(true);
      });

      it("returns true for fields that are exactly the minimum length", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(true);
      });

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.formData.fields("username").html).val("j");
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(false);
      });

    });

    describe("max_length", function() {
      it("returns true for fields under the max length", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(6)")).toEqual(true);
      });

      it("returns false for fields over the max length", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(4)")).toEqual(false);
      });

      it("returns true for fields that are the maximum length", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "max_length(5)")).toEqual(true);
      });
    });

    describe("required", function() {
      it("returns true if the field is not empty", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "required")).toEqual(true);
        $(validationTest.formData.fields("username").html).val("0");
        expect(validationTest.formData.validate("username", "required")).toEqual(true);
      });
      it("returns false if the field is empty", function() {
        $(validationTest.formData.fields("username").html).val("");
        expect(validationTest.formData.validate("username", "required")).toEqual(false);
      });
    });


    describe("multiple validations", function() {
      it("returns true for a field that passes both min & max length validations", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "min_length(4)|max_length(7)")).toEqual(true);
      });
      it("returns false if one of the validations fails", function() {
        $(validationTest.formData.fields("username").html).val("jackf");
        expect(validationTest.formData.validate("username", "min_length(6)|max_length(7)")).toEqual(false);
      });
    });


  });
});
