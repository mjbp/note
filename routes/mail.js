var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mjbpnoteapp@gmail.com',
        pass: 'justsendingsnippets'
    }
});

router.post('/', function(req, res) {
	var referer = req.headers.referer;
	
	var mailOptions = {
		from: 'Note <mjbpnoteapp@gmail.com>',
		to: req.body['form-row-email'],
		subject: 'You have been sent a Note',
		text: req.body.content + '\n\n' + referer,
		html: req.body.content + '<br><br>' + referer
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(err, info){
		if(err){
			console.log('Error: ' + err);
		}else{
			console.log('Message sent: ' + info.response);
		}
	});
});

module.exports = router;
