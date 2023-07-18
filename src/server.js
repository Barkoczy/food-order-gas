// @deps
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const { compress } = require('express-compress');
const minifyHTML = require('express-minify-html-3');
const router = require('./router');

// @env
require('dotenv').config();

// @app
const app = express();

// @setup
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
    },
  })
);
app.use(express.json());
app.use(compress());
app.use('/static', express.static(path.join(__dirname, '../public')));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.set('views', path.join(__dirname, '/view'));
app.set('view engine', 'ejs');
app.set('view options', { rmWhitespace: true });
app.set('trust proxy', 1);

// @router
app.use('/', router);

// @run
app.listen(process.env.PORT, () => {
  console.log(`🚀  Server ready at: http://localhost:${process.env.PORT}/`);
});
