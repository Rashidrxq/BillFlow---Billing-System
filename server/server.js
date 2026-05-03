const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server running → http://localhost:3000');
});
