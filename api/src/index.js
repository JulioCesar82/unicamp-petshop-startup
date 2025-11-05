const express = require('express');
require('dotenv').config();

const { apiPort } = require('./config/general');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (logs timestamp, method, url, ip, response status and duration)
const requestLogger = require('./middleware/requestLogger');
app.use(requestLogger);

const { swaggerUi, specs } = require('./config/swaggerConfig');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Lazy-load routes to avoid executing route/module initialization at app startup.
// The first incoming request to /api will require the routes and cache them.
let routes;
app.use('/api', (req, res, next) => {
  try {
    if (!routes) {
      routes = require('./routes');
    }
    return routes(req, res, next);
  } catch (err) {
    return next(err);
  }
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const createDDLAsync = require('./config/database/ddl');
const insertDMLAsync = require('./config/database/dml');

app.listen(apiPort, async () => {
  await createDDLAsync();
  await insertDMLAsync();
  console.log(`Server is running on port ${apiPort}`);
});
