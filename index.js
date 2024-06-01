const express = require('express');
const app = express();

// Import the task1 router
const task1Router = require('./src/task1');
app.use('/task1', task1Router);

const PORT = process.env.PORT || 9876;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
