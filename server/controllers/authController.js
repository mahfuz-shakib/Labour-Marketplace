const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, role } = req.body;
    if (!name || !email || !password || !confirmPassword || !phone || !role) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + (err.message || '') });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role, 
        category: user.category,
        experience: user.experience,
        demandableBudget: user.demandableBudget,
        rating: user.rating,
        availability: user.availability,
        profilePic: user.profilePic,
        bio: user.bio,
        location: user.location,
        organizationType: user.organizationType,
        organizationName: user.organizationName,
        description: user.description,
        profileCardCreated: user.profileCardCreated,
        profileCard: user.profileCard
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, we just return success
    // Client should remove token from localStorage
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 