const Engineer = require('../models/engineer');


// Add engineer
const addEngineer = async (req, res) => {
    try {
        const {
            name,
            phone,
            whatsappPhone,
            email,
            services,
            specializations,
            governorate,
            city,
            address,
            experience,
            certifications,
            profileImageUrl,
            portfolioImages,
            availability,
            pricing,
            isVerified,
            isActive,
            isFeatured,
            views,
            contactsCount,
            notes
        } = req.body;
        const{addedBy} =req.user?._id

        // Validate required fields
        if (!name || !phone || !services || !governorate || !city) {
            return res.status(400).json({ message: 'Name, phone, services, governorate, and city are required' });
        }

        // Check for duplicate phone number
        const existingEngineer = await Engineer.findOne({ phone });
        if (existingEngineer) {
            return res.status(400).json({
                status: 400,
                message: 'Engineer with this phone number already exists'
            });
        }

        // Construct new engineer object with full schema support
        const newEngineer = new Engineer({
            name,
            phone,
            whatsappPhone,
            email,
            services,
            specializations,
            governorate,
            city,
            address,
            experience,
            certifications,
            profileImageUrl,
            portfolioImages,
            availability,
            pricing,
            isVerified,
            isActive,
            isFeatured,
            views,
            contactsCount,
            addedBy,
            notes
        });

        // Save to database
        await newEngineer.save();

        res.status(201).json({
            message: 'Engineer added successfully',
            engineer: newEngineer
        });

    } catch (error) {
        console.error("Add Engineer Error:", error);
        res.status(500).json({
            message: 'Failed to add engineer',
            error: error.message
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

const getEngineerById = async (req, res) => {
    try {
        const {id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Invalid engineer ID"
            });
        }

        const engineer = await Engineer.findById(id);

        if (!engineer) {
            return res.status(404).json({
                status: 404,
                message: "Engineer not found"
            });
        }

        res.status(200).json({
            status: 200,
            data: engineer,
            message: "Engineer fetched successfully"
        });

    } catch (error) {
        console.error("Error fetching engineer by ID:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};


const engineerController = {
    addEngineer,
    getAllEngineers,
    updateEngineer,
    deleteEngineer,
    toggleEngineerStatus,
    getEngineerById,
};
module.exports = engineerController;