const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.send('AWESOME LISTS: TEST - Hello World!');
});

module.exports = router;
