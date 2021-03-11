require('./db');
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cors = require('cors');
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');
const useradminRoutes = require('./routes/useradmin.js');

const port = process.env.PORT || 8080;
const app = express();

app.use(cookieParser());
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use('/', indexRouter);
app.use('/user',useradminRoutes);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

app.listen(port,()=>{
  console.log(`listenin on http://localhost:${port}`);
});