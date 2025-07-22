
// Create new ad
const Ads = require('../models/ads');
const { uploadToCloud } = require('../utils/uploadToCloud');

// Create new ad with image
const postAds = async (req, res) => {
    try {
        let imageUrl = '';
        if (req.file) {
            const uploaded = await uploadToCloud(req.file.buffer, req.file.originalname, req.file.mimetype);
            if (!uploaded.success) {
                return res.status(500).json({ message: 'Image upload failed', error: uploaded.error });
            }
            imageUrl = uploaded.fileUrl;
        }

        const ad = new Ads({
            ...req.body,
            imageUrl,
        });

        await ad.save();
        res.status(201).json({ message: 'Ad created', ad });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create ad', error });
    }
};

// Update ad with optional new image
const updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };

        if (req.file) {
            const uploaded = await uploadToCloud(req.file.buffer, req.file.originalname, req.file.mimetype);
            if (!uploaded.success) {
                return res.status(500).json({ message: 'Image upload failed', error: uploaded.error });
            }
            updateData.imageUrl = uploaded.fileUrl;
        }

        const updated = await Ads.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: 'Ad not found' });

        res.status(200).json({ message: 'Ad updated', ad: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update ad', error });
    }
};
;

// Get all ads (admin or public)
const getAllAds = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const total = await Ads.countDocuments();

        const ads = await Ads.find()
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.status(200).json({
            status: 200,
            data: ads,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            message: "Ads fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to get ads',
            error
        });
    }
};


// Get active ads by placement (for frontend use)
const getAdsByPlacement = async (req, res) => {
    try {
        const { placement } = req.params;
        const ads = await Ads.find({ placement, active: true });
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ads', error });
    }
};



// Delete ad
const deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        await Ads.findByIdAndDelete(id);
        res.status(200).json({ message: 'Ad deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete ad', error });
    }
};

const adsController = {
    postAds,
    getAllAds,
    deleteAd,
    updateAd,
    getAdsByPlacement
}

module.exports = adsController;