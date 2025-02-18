// Import required modules
const express = require('express');
const validateToken = require("../middleware/auth")

// Models
const NexusActivityLog = require('../models/nexusActivityLog')

// Initialize Express Router
const router = express.Router();


router.get('/get', validateToken, async (req, res) => {
    try {
        // Check if the user role is 'super-admin'
        if (req.user.role !== 'super-admin') {
            return res.status(403).json({ message: 'You are not authorized to access this resource' });
        }
        const requests = await NexusActivityLog.find();
        res.status(200).json({success:false,statusCode:7001,requests:requests});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success:false,  message: 'Internal server error', error });
    }
});

router.get("/:activity_id",validateToken, async (req,res)=>{
    try{
        // Check if the user role is 'super-admin'
        if (req.user.role !== 'super-admin') {
            return res.status(403).json({ message: 'You are not authorized to access this resource' });
        }
        const {activity_id} = req.params;
        const activity = await NexusActivityLog.find({activity_id})
        res.status(200).json({
            success:true,
            statusCode:7001,
            activity
        })

    }
    catch (error) {
        success:false,
        console.error('Error fetching request details:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }

})

module.exports = router;
