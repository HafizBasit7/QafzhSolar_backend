const express = require('express');
const router = express.Router();
const Engineer = require('../models/engineer');
const Shop = require('../models/shop');
const shopController = require('../controllers/shopController');
const adsController = require('../controllers/adsController');
const Product = require('../models/product');
const engineerController = require('../controllers/engineerController');
const productController = require('../controllers/productController');
const GovernorateData = require('../data/governorates.json');
const Ads = require("../models/ads");



//  get governates
const getGovernorate = async (req, res) => {
    try {
        return res.status(200).json({
            status: 200,
            data: GovernorateData,
            message: "fetch governotaeInfo successful"
        })
    } catch (error) {
        console.log(error.message);


    }

}

// filters  Engineer governorate & cities

const filtersEngineer = async (req, res) => {
    try {
        const { search_keyword = "", page = 1, limit = 10 } = req.query;

        if (!search_keyword.trim()) {
            return res.status(400).json({
                status: 400,
                data: [],
                message: "Search keyword is required"
            });
        }

        const filterQuery = {
            $or: [
                { governorate: { $regex: search_keyword, $options: "i" } },
                { city: { $regex: search_keyword, $options: "i" } }
            ]
        };

        const total = await Engineer.countDocuments(filterQuery);
        const response = await Engineer.find(filterQuery)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        if (response.length === 0) {
            return res.status(404).json({
                status: 404,
                data: [],
                message: "No record found"
            });
        }

        return res.status(200).json({
            status: 200,
            data: response,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            message: "Fetch successful"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            data: [],
            message: "Internal server error"
        });
    }
};


// filters Shop governorate & cities

const filtersShop = async (req, res) => {
    try {
        const { search_keyword = "", page = 1, limit = 10 } = req.query;

        if (!search_keyword.trim()) {
            return res.status(400).json({
                status: 400,
                data: [],
                message: "Search keyword is required"
            });
        }

        const filterQuery = {
            $or: [
                { governorate: { $regex: search_keyword, $options: "i" } },
                { city: { $regex: search_keyword, $options: "i" } }
            ]
        };

        const total = await Shop.countDocuments(filterQuery);

        const shops = await Shop.find(filterQuery)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        if (shops.length === 0) {
            return res.status(404).json({
                status: 404,
                data: [],
                message: "No record found"
            });
        }

        return res.status(200).json({
            status: 200,
            data: shops,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            message: "Fetch successful"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            data: [],
            message: "Internal server error"
        });
    }
};


// filters Product 

const filtersProduct = async (req, res) => {
    try {
        const { search_keyword = "", page = 1, limit = 10 } = req.query;

        if (!search_keyword.trim()) {
            return res.status(400).json({
                status: 400,
                data: [],
                message: "Search keyword is required"
            });
        }

        const filterQuery = {
            $or: [
                { governorate: { $regex: search_keyword, $options: "i" } },
                { city: { $regex: search_keyword, $options: "i" } },
                { brand: { $regex: search_keyword, $options: "i" } },
                { phone: { $regex: search_keyword, $options: "i" } },
                { type: { $regex: search_keyword, $options: "i" } },
                { condition: { $regex: search_keyword, $options: "i" } },
                { price: { $regex: search_keyword, $options: "i" } }
            ]
        };

        const total = await Product.countDocuments(filterQuery);

        const products = await Product.find(filterQuery)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        if (products.length === 0) {
            return res.status(404).json({
                status: 404,
                data: [],
                message: "No record found"
            });
        }

        return res.status(200).json({
            status: 200,
            data: products,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            message: "Fetch successful"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            data: [],
            message: "Internal server error"
        });
    }
};

// Enhanced unified search for products with filters and keywords
const searchProductsWithFilters = async (req, res) => {
    try {
        const {
            search_keyword = "",
            type,
            condition,
            brand,
            governorate,
            city,
            minPrice,
            maxPrice,
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 10
        } = req.query;

        // Build dynamic query
        const query = { status: 'approved' };

        // Add search keyword functionality
        if (search_keyword && search_keyword.trim()) {
            query.$or = [
                { name: { $regex: search_keyword, $options: "i" } },
                { description: { $regex: search_keyword, $options: "i" } },
                { brand: { $regex: search_keyword, $options: "i" } },
                { type: { $regex: search_keyword, $options: "i" } }
            ];
        }

        // Add specific filters
        if (type && type !== 'all') query.type = type;
        if (condition && condition !== 'all') query.condition = condition;
        if (brand && brand !== 'all') query.brand = { $regex: brand, $options: "i" };
        if (governorate && governorate !== 'all') query.governorate = { $regex: governorate, $options: "i" };
        if (city && city !== 'all') query.city = { $regex: city, $options: "i" };
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Sorting
        const sortOptions = {};
        if (sortBy === 'price') {
            sortOptions.price = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'name') {
            sortOptions.name = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('userId', 'name phone');

        return res.status(200).json({
            status: 200,
            data: products,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            message: "Search completed successfully"
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            status: 500,
            data: [],
            message: "Internal server error"
        });
    }
};

// filters Ads
const filtersAds = async (req, res) => {
    try {
        const { search_keyword = "", page = 1, limit = 10 } = req.query;

        let filterQuery = {
            isActive: true,
            isApproved: true
        };

        if (search_keyword.trim()) {
            filterQuery.$or = [
                { title: { $regex: search_keyword, $options: "i" } },
                { description: { $regex: search_keyword, $options: "i" } }
            ];
        }

        const total = await Ads.countDocuments(filterQuery);
        const ads = await Ads.find(filterQuery)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('createdBy', 'name');

        return res.status(200).json({
            status: 200,
            data: ads,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            message: "Ads fetched successfully"
        });

    } catch (error) {
        console.error('Ads filter error:', error);
        return res.status(500).json({
            status: 500,
            data: [],
            message: "Internal server error"
        });
    }
};

// users route to get verfied shop
router.get('/getAllShops', shopController.getAllShops);

// users route to  get enginer 
router.get('/getAllEngineer', engineerController.getAllEngineers);

// user route to get Ads
router.get('/getAllAds', adsController.getAllAds);

//  user routes to get products 
router.get('/browse-products', productController.browseProducts);

// route get Governorate
router.get('/get/governorate-data', getGovernorate);

//route filter Engineer 
router.get('/filters-engineer', filtersEngineer);

// route filter Shop
router.get('/filters-shop', filtersShop);

// route filter Product
router.get('/filters-product', filtersProduct);

// Enhanced search with filters
router.get('/search-products', searchProductsWithFilters);

// rote filter ads
router.get('/filters-ads', filtersAds);

// route to get product by id
router.get('/getOneProduct/:id', productController.getProductById);

// route to get engineer By ID;
router.get('/getOneEngineer/:id', engineerController.getEngineerById);

// route to get shop by Id:
router.get('/getOneShop/:id', shopController.getShopById);




module.exports = router;
