const should = require('should');
const proxyquire = require('proxyquire');
const nodemailerMock = require('nodemailer-mock');

describe('emailService', function () {
    let emailService, nodemailer;

    before(function () {
        emailService = proxyquire('../../api/email.service', {
            'nodemailer': nodemailerMock,
        });
    });

    afterEach(function () {
        nodemailerMock.mock.reset(); // Reset the mock back to the defaults after each test
    });

    describe('#send()', function () {
        it('should send email', async function () {
            let result = await emailService.send(
                'test@test.com',
                'Pneuma1',
                'Tooly tool tool'
            );
            result.should.not.be.null();
            result.messageId.should.not.be.null();
            const sentMail = nodemailerMock.mock.getSentMail();
            sentMail.length.should.be.exactly(1);
            sentMail[0].text.should.be.exactly('Tooly tool tool');
        });
    });
});
