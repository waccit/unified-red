var should = require("should");
var userService = require('../../../api/users/user.service');

describe('userService', function() {

    let test_user_id, test_disabled_user_id, test_expired_user_id, temp;

    before(function() {
        userService.create({ "firstName": "Test", "lastName": "Test", "username": "test_user", "password": "Password123", "email":"test@test.com" }).then(resp => {
            test_user_id = resp._id;
        });
        userService.create({ "firstName": "Test", "lastName": "Test", "username": "test_disabled_user", "password": "Password123", "email":"test@test.com", "enabled": false }).then(resp => {
            test_disabled_user_id = resp._id;
        });
        userService.create({ "firstName": "Test", "lastName": "Test", "username": "test_expired_user", "password": "Password123", "email":"test@test.com", "expirationDate": "2020-01-01T00:00:00.000Z" }).then(resp => {
            test_expired_user_id = resp._id;
        });
    });

    after(function() {
        userService.delete(test_user_id);
        userService.delete(test_disabled_user_id);
        userService.delete(test_expired_user_id);
    });

    describe('#getAll()', function() {
        it("should have 1 or more users", function() {
            userService.getAll().should.eventually.not.have.length(0);
        });
    });

    describe('#getById()', function() {
        it("should have test_user account", function() {
            userService.getById(test_user_id).should.eventually.have.property("username", "test_user");
        });
        it("should return null for invalid accounts", function() {
            userService.getById("000000000000000000000000").should.eventually.be.null();
        });
    });

    describe('#authenticate()', function() {
        it("should return a user object when provided a valid username and password", function() {
            let user = { "username": "test_user", "password": "Password123" };
            userService.authenticate(user).should.eventually.have.property("username", user.username);
        });
        it("should throw an exception when provided an invalid username", function() {
            let user = { "username": "test_invalid_user", "password": "password" };
            userService.authenticate(user).catch(err => { err.should.equal("User not found"); });
        });
        it("should throw an exception when provided an invalid password", function() {
            let user = { "username": "test_user", "password": "invalid_password_123" };
            userService.authenticate(user).catch(err => { err.should.equal("Username or password is incorrect"); });
        });
        it("should throw an exception when user account is disabled", function() {
            let user = { "username": "test_disabled_user", "password": "Password123" };
            userService.authenticate(user).catch(err => { err.should.equal("Disabled user account"); });
        });
        it("should throw an exception when user account is expired", function() {
            let user = { "username": "test_expired_user", "password": "Password123" };
            userService.authenticate(user).catch(err => { err.should.equal("User account has expired"); });
        });
    });

    describe('#create()', function() {
        it("should create test account", function() {
            should(test_user_id).not.be.null();
        });
        it("should throw an exception when username is already taken", async function() {
            let user = { "firstName": "Test", "lastName": "Test", "username": "test_user", "password": "Password123", "email":"test@test.com" };
            userService.create(user).catch(err => { err.should.equal('Username "test_user" is already taken'); });
        });
    });

    describe('#delete()', function() {
        it("should delete account", function() {
            let user = { "firstName": "temp", "lastName": "temp", "username": "temp", "password": "Password123", "email":"temp@temp.com" };
            userService.create(user).then(user => {
                userService.getById(user._id).should.eventually.have.property("username", "temp");
                userService.delete(user._id).should.eventually.be.undefined();
                userService.getById(user._id).should.eventually.be.null();
            });
        });
    });

    describe('#update()', function() {
        it("should update account", function() {
            let user = { "firstName": "new name" };
            userService.update(test_user_id, user).should.eventually.have.property("firstName", user.firstName);
        });
        it("should throw an exception when email address is invalid", function() {
            let user = { "email": "blah" };
            userService.update(test_user_id, user).catch(err => { err.should.equal('Invalid email address'); });
        });
        it("should throw an exception when password is weak", function() {
            let user = { "password": "blah" };
            userService.update(test_user_id, user).catch(err => { err.should.containEql('Weak password'); });
        });
    });

    describe('#generateResetToken()', function() { //TODO
    });

    describe('#resetPassword()', function() { //TODO
    });

});