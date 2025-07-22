const Engineer = require('../models/engineer');


// Add engineer
const addEngineer = async (req, res) => {
    try {
        const { name, phone, services, governorate, city } = req.body;

        if (!name || !phone || !services || !governorate || !city) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingEngineer = await Engineer.findOne({ phone });

        if (existingEngineer) {
            return res.status(400).json({
                status: 400,
                data: [],
                message: "already exist"
            })
        }

        const newEngineer = new Engineer({ name, phone, services, governorate, city });
        await newEngineer.save();

        res.status(201).json({ message: 'Engineer added successfully', engineer: newEngineer });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            error: error
        });
    }
};

const getAllEngineers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const total = await Engineer.countDocuments();
        const engineers = await Engineer.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: engineers,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};


// Update engineer
const updateEngineer = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEngineer = await Engineer.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedEngineer) {
            return res.status(404).json({ message: 'Engineer not found' });
        }

        res.status(200).json({ message: 'Engineer updated successfully', engineer: updatedEngineer });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete engineer
const deleteEngineer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Engineer.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Engineer not found' });
        }

        res.status(200).json({ message: 'Engineer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const toggleEngineerStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const engineer = await Engineer.findById(id);
        if (!engineer) return res.status(404).json({ message: 'Engineer not found' });

        engineer.isActive = !engineer.isActive;
        await engineer.save();

        res.status(200).json({ message: 'Status updated', engineer });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const engineerController = {
    addEngineer,
    getAllEngineers,
    updateEngineer,
    deleteEngineer,
    toggleEngineerStatus,
};
module.exports = engineerController;