const express = require('express');
const auth = require('../middleware/auth.js');
const UserAdmin = require('../models/UserAdmin.js');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const admin = require('../middleware/admin.js');
require("dotenv/config");


//for signin
router.post('/signup',async (req,res) => {
    try {
        const data = await UserAdmin.findOne({email:req.body.email})
        if(data) return res.render("useradmin/register",{
            message:"Email already exist",
            email: req.body.email
        })
        else{
        const hashpassword = await bcrypt.hash(req.body.password,8);
        const data = new UserAdmin({
            name: req.body.name,
            email: req.body.email,
            password: hashpassword,
            role: req.body.role?req.body.role:'User',
            isActive: true
        })
        const newData = await data.save()
        res.redirect('/user/login') 
    }} catch{
        res.redirect('/')
    }
});


// for login
router.post('/login',async (req,res) => {
    try {
        const email = req.body.email
        let data = await UserAdmin.findOne({email:email})
        if(!data) return res.render("useradmin/loging",{
            message:"Enter a valid email ID",
            password: "",
            email: req.body.email
        })
        else{
            const isPassValid = await bcrypt.compare(req.body.password,data.password); 
            if(!isPassValid) return res.render("useradmin/loging",{
                password:"Enter a correct password",
                message: "",
                email: req.body.email
            })
            jwt.sign({id:data._id},process.env.SECRET,{expiresIn:6000}, (err,token) => {
                if(err) throw err;
                res.cookie("jwt",token, {
                    expires: new Date(Date.now() + 180000)
                });
                res.redirect('/') 
            })
        }        
    } catch{
        res.redirect('/user/login') 
    }
});


//for edit
router.post('/edit',auth,async (req,res) => {
    // let checkdata = await UserAdmin.findOne(req.body.email)
    // if(checkdata) return res.render("useradmin/edit",{
    //     message:"Email alresdy exist",
    //     email: req.body.email
    // })
    let data = await UserAdmin.find({_id: req.cookies.id})
    data[0].name=req.body.name
    data[0].email=req.body.email
    await data[0].save();
    return res.redirect('/user/profile')
});


router.get('/home',(req,res) => {
    res.render('useradmin/loghome');
});

router.get('/login',(req,res) => {
    res.render('useradmin/loging',{
        message : "",
        password: "",
        email: ""
    })
});

router.get('/register',(req,res) => {
    res.render('useradmin/register',{
        message : "",
        email: ""
    });
});


router.get('/edit',auth,async (req,res) => {
    console.log(req.cookies);
    let data = await UserAdmin.findById(req.cookies.id)
    console.log(data)
    res.render('useradmin/edit.ejs', {
        userDetail : data
        // message: ""
    });
});

router.get('/profile',auth,async (req,res) => {
    console.log(req.cookies);
    let data = await UserAdmin.findById(req.cookies.id)
    console.log(data)
    res.render('useradmin/profile.ejs', {
        userDetail : data
    });
});


router.get('/userdetails',admin, async (req,res) => {
    let data = await UserAdmin.find({});
    console.log(data)
    res.render('useradmin/userdetails.ejs', {
        data : data
    });
});


router.get('/logout', auth, async (req,res) =>{
    try {
        res.clearCookie("jwt");
        console.log('logout succesfully')
        res.redirect('/');
    } catch (error) {
        console.error(error);
    }
});


module.exports = router;
