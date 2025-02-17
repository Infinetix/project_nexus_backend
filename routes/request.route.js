// Import required modules
const express = require('express');
const sendSignupSuccessEmail = require('../util/mailer')

// Models
const Request = require('../models/request');
const Organization = require('../models/organization');
const User = require('../models/user');

// Initialize Express Router
const router = express.Router();


router.get('/get', async (req, res) => {
    try {
        const requests = await Request.find();
        res.status(200).json({success:false,statusCode:7001,requests:requests});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success:false,  message: 'Internal server error', error });
    }
});

router.get("/:req_id", async (req,res)=>{
    try{
        const {req_id} = req.params;
        const request = await Request.find({req_id})
        res.status(200).json({
            success:true,
            statusCode:7001,
            request
        })

    }
    catch (error) {
        success:false,
        console.error('Error fetching request details:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }

})
router.post("/:req_id/:status", async (req, res) => {
    try {
        const { req_id, status } = req.params;
        const request = await Request.findOneAndUpdate(
            { req_id: req_id },
            { status: status },
            { new: true }  // Return updated document
        );

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Extract email from reqDesc JSON
        const { email, firstName } = request.reqDesc;

        // Send email on successful signup
        if (status === 'approved') {
            await sendSignupSuccessEmail(email, firstName);
        }

        res.status(200).json({
            success: true,
            statusCode: 7001,
            request
        });

    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;
