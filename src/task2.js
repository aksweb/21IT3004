const express = require('express');
const axios = require('axios');
const router = express.Router();


// Test server base URL
const TEST_SERVER_BASE_URL = 'http://20.244.56.144/test';

// Function to generate custom unique product ID
function generateProductId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

async function fetchTopProducts(companyName, categoryName, top, minPrice, maxPrice) {
    try {
        const response = await axios.get(`${TEST_SERVER_BASE_URL}/companies/${companyName}/categories/${categoryName}/products`, {
            params: {
                top,
                minPrice,
                maxPrice
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return [];
    }
}

function sortProducts(products, sortBy, sortOrder) {
    if (sortBy && sortOrder) {
        products.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortBy] - b[sortBy];
            } else {
                return b[sortBy] - a[sortBy];
            }
        });
    }
    return products;
}

router.get('/categories/:categoryname/products', async (req, res) => {
    const categoryName = req.params.categoryname;
    const top = parseInt(req.query.top) || 10;
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || Infinity;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder;

    let allProducts = [];

    // Fetch
    const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
    for (const company of companies) {
        const products = await fetchTopProducts(company, categoryName, top, minPrice, maxPrice);
        allProducts = allProducts.concat(products);
    }

    // Sorting
    allProducts = sortProducts(allProducts, sortBy, sortOrder);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * top;
    const endIndex = page * top;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);

    res.json(paginatedProducts);
});


router.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const categoryName = req.params.categoryname;
    const productId = req.params.productid;

    //details from all companies
    const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
    let productDetails = null;

    for (const company of companies) {
        const products = await fetchTopProducts(company, categoryName, 10, 0, Infinity);
        productDetails = products.find(product => product.productId === productId);
        if (productDetails) break;
    }

    if (productDetails) {
        res.json(productDetails);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});
module.exports = router;
