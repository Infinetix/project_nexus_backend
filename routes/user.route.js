// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Models
const Request = require('../models/request');
const Organization = require('../models/organization');
const User = require('../models/user');

// Initialize Express Router
const router = express.Router();

// Middleware to check if the user is admin or manager
const authenticateManagerOrAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !['admin', 'manager'].includes(user.role)) {
            return res.status(403).json({ message: `Access denied ${user.role}` });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error });
    }
};

// API to add a new user
router.post('/add-user', authenticateManagerOrAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, role, organizationId } = req.body;

        if (!firstName || !lastName || !email || !role || !organizationId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newUser = new User({
            firstName,
            lastName,
            user_id: uuidv4(),
            email,
            password: await bcrypt.hash(email, 10), // Default password is the email
            role,
            organizationId
        });

        const savedUser = await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// API to change password
router.post('/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// API to login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing email or password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role, orgId: user.organizationId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token, statusCode:7001 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
router.get('/user-count', async (req, res) => {
    try {
      const result = await User.aggregate([
        {
          $match: {
            role: { $nin: ['super-admin', 'nexus-user'] }
          }
        },
        {
          $group: {
            _id: '$active',
            count: { $sum: 1 }
          }
        }
      ]);
  
      const counts = result.reduce((acc, item) => {
        acc[item._id ? 'active' : 'inactive'] = item.count;
        return acc;
      }, { active: 0, inactive: 0 });
  
      res.status(200).json({
        success: true,
        statusCode:7001,
        counts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  });

  router.post("/signup",async(req,res)=>{
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            user_id:uuidv4(),
            email,
            password: hashedPassword,
            role: "nexus-user",
            organizationId:"org_nexus",
            avatar: 1,
            active: false
        });

        await newUser.save();

        req.body.role = "nexus-user";
        const { password:_, ...requestData } = req.body;
        // Create a request with uuidv4 for req_id
        const newRequest = new Request({
            reqName: 'New nexus user signup',
            reqDesc: requestData,  // Description from request body
            req_id: uuidv4()   // Generate unique ID
        });

        await newRequest.save();

        res.status(200).json({ message: 'User registered successfully, request created', userId: newUser._id, statusCode:7001 });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up user', error: error.message });
    }
  })

module.exports = router;
