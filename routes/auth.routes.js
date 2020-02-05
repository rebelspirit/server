const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../models/User');
const router = Router();

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Invalid email').isEmail(),
        check('password', 'Minimum password length 6 characters').isLength({ min: 6, max: 16 })
    ],
    async (req, res) => {
    try {
        console.log("body", req.body);

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Incorrect registration data"
            })
        }

        const {email, password} = req.body;
        const candidate = await  User.findOne({email});

        if(candidate) {
            return res.status(400).json({message: 'This user already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({email, password: hashedPassword});

        await user.save();

        res.status(201).json({message: "New user created"})

    } catch (e) {
        res.status(500).json({message: 'Something went wrong, try again'});
    }
});

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Enter a valid e-mail').normalizeEmail().isEmail(),
        check('password', 'Enter password').exists()
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Incorrect login details"
            })
        }

        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "User is not found"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message: "Wrong password"})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get('jwtSecret'),
            {expiresIn: '1h'}
        );
        res.status(200).json({token, userId: user.id})

    } catch (e) {
        res.status(500).json({message: 'Something went wrong, try again'})
    }
});

module.exports = router;