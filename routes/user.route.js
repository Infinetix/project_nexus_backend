// User Authentication Routes
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const router = express.Router();

// Sign Up Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Change Password Route
router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

const upload = multer({ dest: 'uploads/' });

router.post('/add-users-from-excel', upload.single('file'), async (req, res) => {
    try {
        // Check if a file was uploaded
        console.log(req.file)
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Iterate through each row in the sheet
        const users = await Promise.all(sheetData.map(async (row) => {
            const { name, email, password } = row;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return null; // Skip existing users
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user object
            return new User({
                name,
                email,
                password: hashedPassword
            }).save();
        }));

        // Filter out null values (existing users)
        const addedUsers = users.filter((user) => user !== null);

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            message: `${addedUsers.length} users added successfully`,
            users: addedUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;
