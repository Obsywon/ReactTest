const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
dotenv.config();
require('./models/dbConfig');
const { verify } = require('./middlewares/Webtoken');

const cors = require('cors');
const corsOpt = require('./configs/corsStategy')
const credentials = require('./middlewares/Credentials')

// Deal with CORS
app.use(credentials)
app.use(cors(corsOpt));

// decode json requests
app.use(bodyParser.json());

// decode form requests
app.use(express.urlencoded({extended: false}));

// decode cookies
app.use(cookieParser());

app.use('/auth', require('./routers/authRoutes'))
app.use(verify)
app.use('/users', require('./routers/userRoutes'));


app.listen(5000, () => console.log('Server started (5000)'))