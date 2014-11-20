var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'michael.j.b.perkins@gmail.com',
        pass: '@bex4980@'
    }
});

router.post('/', function(req, res) {
	var referer = req.headers.referer;
	var mailOptions = {
		from: 'Note <michael.j.b.perkins@gmail.com>',
		to: 'mick@binaryvein.com',
		subject: 'Snippet sent from Note',
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
