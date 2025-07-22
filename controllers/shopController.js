const Shop = require('../models/shop');

// Add shop
const addShop = async (req, res) => {
    try {
        const { name, phone, city, services, location, governorate } = req.body;

        if (!name || !phone || !city || !services || !governorate) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingShop = await Shop.findOne({ phone });
        if (existingShop) {
            return res.status(400).json({
                status: 400,
                data: [],
                message: "already exist"
            })
        }
        const newShop = new Shop({ name, phone, city, services, location, governorate });
        await newShop.save();

        res.status(201).json({ message: 'Verified shop added successfully', shop: newShop });
    } catch (error) {
        console.error("add shop", error)
        res.status(500).json({ message: 'Server error', error });
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
const shopController = {
    addShop,
    getAllShops,
    updateShop,
    deleteShop,
    toggleShopStatus
};

module.exports = shopController;