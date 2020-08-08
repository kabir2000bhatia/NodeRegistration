if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flashMsg = require('express-flash')
const session =  require('express-session')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')

const initializePassport = require('./passport-config')
initializePassport(passport, 
    email => users.find(user => user.email === email), //fxn to find user based on email
    id => users.find(user => user.id === id)
)

app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(express.urlencoded ({ extended: false }))  // to retrieve user info using req.body method
app.use(flashMsg())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//Get routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
app.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register.ejs')
})

//Post method
app.post('/login', checkNotAuthenticated,  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
const users = [];
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login') //no error
    } catch { 
        res.redirect('/register') //incase of any error
    }
    console.log(users)
})
//logout
app.delete('/logout', (req,res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res , next){
    if(req.isAuthenticated()) {
       return res.redirect('/')
    }
    next()
}
app.listen(3000, () => console.log('listening port 3000...'));


