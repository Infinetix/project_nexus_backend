// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Models
const Organization = require('../models/organization');
const User = require('../models/user');

// Initialize Express Router
const router = express.Router();

// API to add an organization and create an admin user
router.post('/add', async (req, res) => {
    try {
        // Destructure organization and user details from request body
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

        // Generate UUID for organization

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

        // Hash admin password


        // Create new admin user
        const newUser = new User({
            firstName: adminFirstName,
            lastName: adminLastName,
            user_id: uuidv4(),
            email: adminEmail,
            password: adminEmail,
            role: 'admin',
            organizationId: savedOrganization.org_id
        });

        const savedUser = await newUser.save();

        // Respond with success message
        res.status(201).json({
            message: 'Organization and admin user created successfully',
            organization: savedOrganization,
            user: savedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;