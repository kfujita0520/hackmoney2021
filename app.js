
const express = require('express');
const path = require('path');

const indexRouter = require('./routes/index');
const metamaskRouter = require('./routes/metamask');
const bitgoRouter = require('./routes/bitgo');


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'web')));

app.use('/', indexRouter);
app.use('/metamask', metamaskRouter);
app.use('/bitgo', bitgoRouter);



app.use(express.json());
app.listen(3000);

module.exports = app;
