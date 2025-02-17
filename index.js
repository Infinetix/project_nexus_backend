const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 6960;

const uri = process.env.URI;

mongoose.connect(uri, {});

mongoose.connection.once('open', () => {
    console.log("mongodb connected");
})
const user = require('./routes/user.route')
const org = require('./routes/organization.route')
const req = require('./routes/request.route')


app.use('/user', user)
app.use('/org', org)
app.use('/req',req)

app.get('/', (req, res) => {
    res.json("running!")
})

app.listen(port, () => {
    console.log("server running on port :-" + port);
});