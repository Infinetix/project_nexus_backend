const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 6969;

const uri = process.env.URI;

mongoose.connect(uri, {});

mongoose.connection.once('open', () => {
    console.log("mongodb connected");
})
const user = require('./routes/user.route')
const org = require('./routes/organization.route')


app.use('/user', user)
app.use('/org', org)

app.get('/', (req, res) => {
    res.json("running!")
})

app.listen(port, () => {
    console.log("server running on port :-" + port);
});