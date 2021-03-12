const jwt = require('jsonwebtoken');
const UserAdmin = require('../models/UserAdmin.js');
require("dotenv/config");


const admin = async (req, res, next) => {
    try {
        req.cookies.id = "";
        const token = req.cookies.jwt;
        if(!token) return res.redirect("/user/login");
        const data = jwt.verify(token,process.env.SECRET);
        if(!data) return res.send('error while fetching');
        const result = await UserAdmin.findById(data.id);
        // console.log(result);
        // console.log(req.cookies)
        // req.cookies.id = result._id;
        if(result.role !== 'Admin') return res.redirect('/');
        next();
    } catch{
        res.redirect('/')
    }
}

module.exports = admin;