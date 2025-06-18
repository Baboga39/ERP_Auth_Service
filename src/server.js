const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const authRoutes = require('./routes');
const errorHandler = require('../shared-libs/middlewares/errorHandler');
const logger = require('./utils/logger')
require('./worker/userCreated.worker');
const app = express();
app.use(helmet());
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler(logger));

app.listen(process.env.PORT, () =>
logger.info(`Auth Service running on port ${process.env.PORT}`)
);
