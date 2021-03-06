const { assert } = require('chai');

const { emailLookUp } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailLookUp', function() {
  it('should return a user with valid email', function() {
    const user = emailLookUp("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefefined email does not exist', function () {
    const user = emailLookUp('user90@example.com', testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
});
