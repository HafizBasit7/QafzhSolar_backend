const Product = require('../models/product');


const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 200,
            data: products,
            message: "fetch pending products successfull"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
// Admin: Get all pending products
const getPendingProducts = async (req, res) => {
    try {
        const pending = await Product.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.status(200).json({
            status: 200,
            data: pending,
            message: "fetch pending products successfull"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Admin: Approve or Reject product
const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.status(200).json({ message: `Product ${status}`, product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const AdminApprovalController = {
    getPendingProducts,
    updateProductStatus,
    getProducts,
}

module.exports = AdminApprovalController;