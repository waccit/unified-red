const should = require("should");
const mockery = require("mockery");
const nodemailerMock = require("nodemailer-mock");
let userService;

describe('userService', function() {

    let test_user_id, test_disabled_user_id, test_expired_user_id;

    before(async function() {
        mockery.enable({ warnOnUnregistered: false, useCleanCache: true }); // Enable mockery to mock objects
        mockery.registerMock('nodemailer', nodemailerMock); // Once mocked, any code that calls require('nodemailer') will get our nodemailerMock
        
        /* IMPORTANT! Make sure anything that uses nodemailer is loaded here, after it is mocked just above... */
        userService = require('../../../api/users/user.service');

        let result = await userService.create({ "firstName": "Test", "lastName": "Test", "username": "test_user", "password": "Password123", "email":"test@test.com" });
        test_user_id = result._id;

        result = await userService.create({ "firstName": "Test", "lastName": "Test", "username": "test_disabled_user", "password": "Password123", "email":"test@test.com", "enabled": false });
        test_disabled_user_id = result._id;

        result = await userService.create({ "firstName": "Test", "lastName": "Test", "username": "test_expired_user", "password": "Password123", "email":"test@test.com", "expirationDate": "2020-01-01T00:00:00.000Z" });
        test_expired_user_id = result._id;
    });

    afterEach(function() {
        nodemailerMock.mock.reset(); // Reset the mock back to the defaults after each test
    });

    after(function() {
        // Remove our mocked nodemailer and disable mockery
        mockery.deregisterAll();
        mockery.disable();

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
        let userParam = { "firstName": "temp", "lastName": "temp", "username": "temp", "password": "Password123", "email":"temp@temp.com" };
        it("should delete account (sync)", async function() {
            let user = await userService.create(userParam);
            let result = await userService.getById(user._id);
            result.should.have.property("username", "temp");
            result = await userService.delete(user._id);
            should(result).be.undefined();
            result = await userService.getById(user._id);
            should(result).be.null();
        });
        it("should delete account (async)", function(done) {
            userService.create(userParam).then(function(user) {
                userService.getById(user._id).then(function(result) {
                    result.should.have.property("username", "temp");
                    userService.delete(user._id).then(function(result) {
                        should(result).be.undefined();
                        userService.getById(user._id).should.eventually.be.null();
                        done();
                    });
                });
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

    describe('#generateResetToken()', function() {
        let req = { protocol: "http", get: function(param) { return "localhost"; } };

        it("should generate a reset token & send password reset email (sync)", async function() {
            let token = await userService.generateResetToken(req, "test_user");
            token.should.not.be.null();
            const sentMail = nodemailerMock.mock.getSentMail();
            sentMail.length.should.be.exactly(1);
            sentMail[0].text.should.containEql("A password reset has been request for username");
        });
        it("should generate a reset token & send password reset email (async)", function(done) {
            userService.generateResetToken(req, "test_user").then(function(token) {
                token.should.not.be.null();
                const sentMail = nodemailerMock.mock.getSentMail();
                sentMail.length.should.be.exactly(1);
                sentMail[0].text.should.containEql("A password reset has been request for username");
                done();
            });
        });

        it("should throw an exception when provided an invalid username (sync)", async function() {
            try {
                let result = await userService.generateResetToken(req, "invalid_user");
                result.should.be.exactly("this should never fire");
            } catch (err) {
                err.should.equal("User not found");
            }
        });
        it("should throw an exception when provided an invalid username (async)", function(done) {
            userService.generateResetToken(req, "invalid_user").catch(err => {
                err.should.equal("User not found");
                done();
            });
        });
    });

    describe('#resetPassword()', function() {
        let req = { protocol: "http", get: function(param) { return "localhost"; } };

        it("should reset password (sync)", async function() {
            let token = await userService.generateResetToken(req, "test_user");
            let result = await userService.resetPassword(token, { "password": "Password1234" });
            result.should.have.property("username");
        });
        it("should reset password (async)", function(done) {
            userService.generateResetToken(req, "test_user").then(function(token) {
                token.should.not.be.null();
                userService.resetPassword(token, { "password": "Password1234" }).then(function (result) {
                    result.should.have.property("username");
                    done();
                });
            });
        });

        it("should throw an exception when provided a used token (sync)", async function() {
            let token = await userService.generateResetToken(req, "test_user");
            let result = await userService.resetPassword(token, { "password": "Password1234" });
            result.should.have.property("username");
            try {
                result = await userService.resetPassword(token, { "password": "Password1234" });
                result.should.be.exactly("this should never fire");
            } catch (err) {
                err.should.equal("Invalid or expired reset token");
            }
        });
        it("should throw an exception when provided a used token (async)", function(done) {
            userService.generateResetToken(req, "test_user").then(function(token) {
                userService.resetPassword(token, { "password": "Password1234" }).then(function(result) {
                    result.should.have.property("username");
                    userService.resetPassword(token, { "password": "Password1234" }).catch(err => {
                        err.should.equal("Invalid or expired reset token");
                        done();
                    });
                });
            });
        });

        it("should throw an exception when password is weak (sync)", async function() {
            let token = await userService.generateResetToken(req, "test_user");
            userService.resetPassword(token, { "password": "blah" }).catch(err => { err.should.containEql('Weak password'); });
        });
        it("should throw an exception when password is weak (async)", function(done) {
            userService.generateResetToken(req, "test_user").then(token => {
                userService.resetPassword(token, { "password": "blah" }).catch(err => {
                    err.should.containEql('Weak password');
                    done();
                });
            });
        });

        it("should throw an exception when provided an invalid token (sync)", async function() {
            try {
                let result = await userService.resetPassword("invalid_token", { "password": "blah" });
                result.should.be.exactly("this should never fire");
            } catch (err) {
                err.should.equal("Invalid or expired reset token");
            }
        });
        it("should throw an exception when provided an invalid token (async)", function(done) {
            userService.resetPassword("invalid_token", { "password": "blah" }).catch(err => {
                err.should.equal("Invalid or expired reset token");
                done();
            });
        });

    });

});