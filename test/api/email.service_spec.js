const should = require("should");
const mockery = require("mockery");
const nodemailerMock = require("nodemailer-mock");

describe('emailService', function() {
    let emailService, nodemailer;

    before(function() {
        mockery.enable({ warnOnUnregistered: false, useCleanCache: true }); // Enable mockery to mock objects
        mockery.registerMock('nodemailer', nodemailerMock); // Once mocked, any code that calls require('nodemailer') will get our nodemailerMock
        
        /* IMPORTANT! Make sure anything that uses nodemailer is loaded here, after it is mocked just above... */
        emailService = require("../../api/email.service");
    });
      
    afterEach(function() {
        nodemailerMock.mock.reset(); // Reset the mock back to the defaults after each test
    });
      
    after(function() {
        // Remove our mocked nodemailer and disable mockery
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('#send()', function() {
        it("should send email", async function() {
            let result = await emailService.send("test@test.com", "Pneuma1", "Tooly tool tool");
            result.should.not.be.null();
            result.messageId.should.not.be.null();
            const sentMail = nodemailerMock.mock.getSentMail();
            sentMail.length.should.be.exactly(1);
            sentMail[0].text.should.be.exactly("Tooly tool tool");
        });
    });

});