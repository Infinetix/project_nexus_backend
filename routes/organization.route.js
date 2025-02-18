// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const validateToken = require("../middleware/auth")

// Models
const Organization = require('../models/organization');
const User = require('../models/user');
const NexusActivityLog = require('../models/nexusActivityLog')

// Initialize Express Router
const router = express.Router();

// API to add an organization and create an admin user
router.post('/add', validateToken, async (req, res) => {
    try {
        const { orgName, logo, description, email, type, compId, adminFirstName, adminLastName, adminEmail } = req.body;
        
        // Validate required fields
        if (!orgName || !email || !compId || !adminFirstName || !adminLastName || !adminEmail) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if organization already exists
        const existingOrg = await Organization.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ message: 'Organization with this email already exists' });
        }

        // Check if admin user already exists
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check user role from JWT
        if (req.user.role === 'super-admin') {
            // Create new organization
            const newOrganization = new Organization({
                name: orgName,
                logo,
                description,
                email,
                type,
                compId,
                org_id: uuidv4()
            });

            const savedOrganization = await newOrganization.save();

            // Create new admin user
            const newUser = new User({
                firstName: adminFirstName,
                lastName: adminLastName,
                user_id: uuidv4(),
                email: adminEmail,
                password: adminEmail,  // Ideally, this should be hashed
                role: 'admin',
                organizationId: savedOrganization.org_id
            });

            const savedUser = await newUser.save();

            // Log activity
            await NexusActivityLog.create({
                action: 'Created organization and admin user',
                performedBy: req.user.email,
                role: req.user.role,
                activity_id:uuidv4(),
                details: {
                    orgName,
                    adminEmail
                }
            });

            // Respond with success message
            res.status(200).json({
                success: true,
                message: 'Organization and admin user created successfully',
                statusCode: 7001,
                organization: savedOrganization,
                user: savedUser
            });

        } else if (req.user.role === 'nexus-user') {
            const newOrganization = new Organization({
                name: orgName,
                logo,
                description,
                email,
                type,
                compId,
                org_id: uuidv4(),
                active:false
            });

            const savedOrganization = await newOrganization.save();
            // Create request instead of directly creating organization and user
            const newRequest = new Request({
                reqType: 'org creation',
                reqName: 'New organization creation request',
                reqDesc: {
                    orgName,
                    logo,
                    description,
                    email,
                    type,
                    compId,
                    adminFirstName,
                    adminLastName,
                    adminEmail
                },
                req_id: uuidv4()
            });

            const savedRequest = await newRequest.save();

            // Log activity
            await NexusActivityLog.create({
                action: 'Created organization request',
                performedBy: req.user.email,
                role: req.user.role,
                activity_id:uuidv4(),
                details: {
                    orgName,
                    adminEmail
                }
            });

            res.status(200).json({
                success: true,
                message: 'Organization creation request submitted successfully',
                statusCode: 7002,
                request: savedRequest
            });

        } else {
            return res.status(403).json({ message: 'Unauthorized user role' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

router.get('/get', async (req, res) => {
    try {
        const orgs = await Organization.find();
        const user = await User.find()
        res.status(200).json({success:false,statusCode:7001,org:orgs});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success:false,  message: 'Internal server error', error });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const orgId = req.params.id;
        const deletedOrg = await Organization.findByIdAndDelete(orgId);
        if (!deletedOrg) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ message: 'Organization deleted successfully', deletedOrg });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// update any organisation details
router.put('/update/:id', async (req, res) => {
    try {
        const orgId = req.params.id;
        const { name, logo, description, type } = req.body;
        const updatedOrg = await Organization.findByIdAndUpdate(orgId, { name, logo, description, type }, { new: true });
        if (!updatedOrg) {
            return res.status(404).json({ statusCode:7001, message: 'Organization not found' });
        }
        res.status(200).json({ message: 'Organization updated successfully', updatedOrg });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

router.get('/:org_id', async (req, res) => {
    try {
        const { org_id } = req.params;

        // Fetch organization details
        const organization = await Organization.findOne({ org_id });
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Count active and inactive users for the organization
        const userCounts = await User.aggregate([
            { $match: { organizationId: org_id, role: { $nin: ['super-admin', 'nexus-user'] } } },
            { $group: { _id: '$active', count: { $sum: 1 } } }
        ]);

        let activeCount = 0;
        let inactiveCount = 0;

        userCounts.forEach(item => {
            if (item._id) {
                activeCount = item.count;
            } else {
                inactiveCount = item.count;
            }
        });

        // Response with organization details and user counts
        res.status(200).json({
            success: true,
            statusCode: 7001,
            organization,
            userCounts: {
                active: activeCount,
                inactive: inactiveCount
            }
        });
    } catch (error) {
        success:false,
        console.error('Error fetching organization details:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;


module.exports = router;
