const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configuration
const WINDOW_SIZE = 10;
const TEST_SERVER_URLS = {
    'p': 'http://20.244.56.144/test/primes',
    'f': 'http://20.244.56.144/test/fibo',
    'e': 'http://20.244.56.144/test/even',
    'r': 'http://20.244.56.144/test/rand'
};
let windowNumbers = [];
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MjIzMzU4LCJpYXQiOjE3MTcyMjMwNTgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdhMzNlMTMyLTgwY2YtNGE3My1iNzQzLTJmMTk0MTBmOGZhZiIsInN1YiI6IjIxaXQzMDA0KzFAcmdpcHQuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJSR0lQVCIsImNsaWVudElEIjoiN2EzM2UxMzItODBjZi00YTczLWI3NDMtMmYxOTQxMGY4ZmFmIiwiY2xpZW50U2VjcmV0IjoiZUNjVGZiWXZ6V3pSUmxKZSIsIm93bmVyTmFtZSI6IkFiaGlzaGVraCIsIm93bmVyRW1haWwiOiIyMWl0MzAwNCsxQHJnaXB0LmFjLmluIiwicm9sbE5vIjoiMjFpdDMwMDQifQ.bzwbKJZHR7Xv1KwIssUGLUbIlR4P3R7M160yr28Mc8M';

// Function to calculate average
function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

// Middleware to handle requests
router.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;

    if (!TEST_SERVER_URLS[numberId]) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    try {
        const response = await axios.get(TEST_SERVER_URLS[numberId], {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`
            },
            timeout: 500  // Set timeout to 500 ms
        });

        if (!response.data || !Array.isArray(response.data.numbers)) {
            throw new Error('Invalid response format');
        }

        const newNumbers = response.data.numbers.filter(num => !windowNumbers.includes(num));

        if (newNumbers.length === 0) {
            return res.status(200).json({ error: 'No new numbers to add' });
        }

        // Update window
        const previousWindowState = [...windowNumbers];
        windowNumbers = windowNumbers.concat(newNumbers);
        if (windowNumbers.length > WINDOW_SIZE) {
            windowNumbers = windowNumbers.slice(windowNumbers.length - WINDOW_SIZE);
        }

        const average = calculateAverage(windowNumbers);

        res.status(200).json({
            numbers: response.data.numbers,
            windowPrevState: previousWindowState,
            windowCurrState: windowNumbers,
            avg: average.toFixed(2)
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
