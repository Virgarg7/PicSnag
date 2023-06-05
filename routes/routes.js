const express = require("express");
const router = express.Router();
const User = require("../models/users")
const multer = require('multer');
const users = require("../models/users");
const fs = require("fs");
const { log } = require("console");

// image uploaded 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
})

var upload = multer({
    storage: storage,
}).single("image");

// Insert an user into database 
router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    })

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User Added Successfully'
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });


})

// Home Page Router 
// router.get("/", (req, res) => {
//     res.render('index.ejs', { title: "Home Page" });
// });

// Get all users Route 
router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render("index.ejs", {
            title: "Home Page",
            users: users
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});



// Add page Router 
router.get("/add", (req, res) => {
    res.render("add_users.ejs", { title: "Add Users" });
})

// About page Router 
router.get("/about", (req, res) => {
    res.render("about.ejs", { title: "About" });
})

// Contact Page Router 
router.get("/contact", (req, res) => {
    res.render("contact.ejs", { title: "Contact" });
})


// Edit Page Route 
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            res.redirect('/');
        } else {
            res.render("edit_users.ejs", {
                title: "Edit User",
                user: user
            });
        }
    } catch (err) {
        res.redirect('/');
    }
});

//Clicking the Update User Button so as to Change in Database

router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        fs.unlinkSync('./uploads' + req.body.old_image);
    } else {
        new_image = req.body.old_image;
    }

    console.log('Update route handler is executed.');

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    })
        .then((result) => {
            req.session.message = {
                type: 'success',
                message: 'User Updated Successfully',
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
})


// Delete user route 
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id)
      .then((result) => {
        if (result.image != '') {
          fs.unlinkSync('./uploads/' + result.image);
        }
  
        req.session.message = {
          type: 'success',
          message: 'User Deleted Successfully',
        };
        res.redirect('/');
      })
      .catch((err) => {
        res.json({
          message: err.message,
        });
      });
  });
  
module.exports = router;