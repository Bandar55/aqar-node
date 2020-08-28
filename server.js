const express = require('express');
const app = express();
const mongoose = require('mongoose');
// var timeout = require('connect-timeout');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes')

const cors = require('cors');
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
app.use(bodyParser.json({ limit: '200mb' }))

mongoose.connect('mongodb://127.0.0.1:27017/realstate', { useNewUrlParser: true }, (err) => {
    if(err) {
        console.log('Error in connecting with db')
    } else {
        console.log('Successfully connected db')
    }
});
app.use(cors());
// app.use(timeout(120000));
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);


app.listen(3005, () => {
    console.log('app listening on port 3005')
});