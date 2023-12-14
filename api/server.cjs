// Run this with node server.cjs to run locally //
const app = require('./index.cjs');
const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`> Server running on PORT ${port}`);
});
