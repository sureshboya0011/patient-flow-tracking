const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Patient Flow Tracker listening on http://localhost:${PORT}`);
  console.log(`Try: curl http://localhost:${PORT}/health`);
});
