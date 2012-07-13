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

      it("returns false for fields that are below minimum length", function() {
        $(validationTest.formData.fields("username").html).val("j");
        expect(validationTest.formData.validate("username", "min_length(5)")).toEqual(false);

      });

    });


  });
});
