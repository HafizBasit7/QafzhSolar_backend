const Shop = require('../models/shop');

// Add shop

const addShop = async (req, res) => {
    try {
        const {
            name,
            description,
            phone,
            whatsappPhone,
            email,
            website,
            governorate,
            city,
            address,
            location,
            services,
            productCategories,
            brands,
            establishedYear,
            licenseNumber,
            workingHours,
            socialMedia,
            logoUrl,
            images,
            notes,
        } = req.body;
        const addedBy = req.user?._id;  //  using middleware 
        console.log("addedBy", addedBy);


        // Validate required fields
        if (!name || !phone || !city || !services || !governorate || !addedBy) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        // Prevent duplicate shop by phone
        const existingShop = await Shop.findOne({ phone });
        if (existingShop) {
            return res.status(400).json({
                status: 400,
                data: [],
                message: "Shop with this phone already exists"
            });
        }

        const newShop = new Shop({
            name,
            description,
            phone,
            whatsappPhone,
            email,
            website,
            governorate,
            city,
            address,
            location,
            services,
            productCategories,
            brands,
            establishedYear,
            licenseNumber,
            workingHours,
            socialMedia,
            logoUrl,
            images,
            notes,
            addedBy,
            isVerified: true, // Admin adds = verified
            verificationStatus: 'verified'
        });

        await newShop.save();

        res.status(201).json({
            message: 'Verified shop added successfully',
            shop: newShop
        });

    } catch (error) {
        console.error('Add shop error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get all verified shops
// GET /api/v1/shop/get-all?page=1&limit=10
const getAllShops = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit 10
        const skip = (page - 1) * limit;

        const [shops, total] = await Promise.all([
            Shop.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Shop.countDocuments()
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            status: 200,
            data: shops,
            pagination: {
                total,
                page,
                limit,
                totalPages
            },
            message: 'Shops fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update shop
const updateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedShop = await Shop.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.status(200).json({ message: 'Shop updated successfully', shop: updatedShop });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete shop
const deleteShop = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Shop.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.status(200).json({ message: 'Shop deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const toggleShopStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const shop = await Shop.findById(id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        shop.isActive = !shop.isActive;
        await shop.save();

        res.status(200).json({ message: 'Status updated', shop });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getShopById = async (req, res) => {
    try {
        const {id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Invalid Shop ID"
            });
        }

        const shop = await Shop.findById(id);

        if (!shop) {
            return res.status(404).json({
                status: 404,
                message: "shop not found"
            });
        }

        res.status(200).json({
            status: 200,
            data: shop,
            message: "shop fetched successfully"
        });

    } catch (error) {
        console.error("Error fetching shop by ID:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};
const shopController = {
    addShop,
    getAllShops,
    updateShop,
    deleteShop,
    toggleShopStatus,
    getShopById
};

module.exports = shopController;