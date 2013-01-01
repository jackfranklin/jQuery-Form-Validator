describe("Multiple instances of JFV", function() {
  it("allows 2 instances to co-exist on one page", function() {
    var formFieldOne = $("<input/>", {
      type: "text",
      name: "email",
      "class": "emailField"
    });

    var formFieldTwo = $("<input/>", {
      type: "text",
      name: "firstName",
      "class": "nameField"
    });

    var formOne = window.FormValidator(formFieldOne);
    var formTwo = window.FormValidator(formFieldTwo);
    expect(formOne.field("email")).toBeDefined();
    expect(formOne.field("firstName")).not.toBeDefined();
    expect(formTwo.field("firstName")).toBeDefined();
    expect(formTwo.field("email")).not.toBeDefined();
  });
});
