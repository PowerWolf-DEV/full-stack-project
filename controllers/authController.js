const User = require('../models/user')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const regEmail = require('../emails/registration')
const resetPass = require('../emails/reset')


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls : { rejectUnauthorized: false }
})

// handle errors
const handleErrors = (err) => {
  let errors = { email: '', password: '', confirmPass: ''}

  // incorrect email 
  if (err.message === 'incorrect email') {
    errors.email = 'that email is not registered'
  }

   // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'password is incorrect'
  }

  // Password mismatch
  if (err.message === 'Password mismatch') {
    errors.confirmPass = 'passwords is not matches'
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = 'that email is already registered'
    return errors
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }

  return errors
}

// create json web token
const maxAge = 1 * 24 * 60 * 60 // 1 day
const expAge = 60 * 60 // 1 hour
const createToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge
  })
}

const createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: expAge
  })
}

const signup_get = (req, res) => {
  if (res.locals.user) return res.redirect('/')
  res.render('auth/signup', {title: 'Signup'})
}

const login_get = (req, res) => {
  if (res.locals.user) return res.redirect('/')
  res.render('auth/login', {title: 'Login'})
}

const signup_post = async (req, res) => {
  let { email, password, confirmPass } = req.body

  try {
    if (password === confirmPass) {
      let user = await User.create({ email , password })
      res.status(201).json({ user: user._id })
      await transporter.sendMail(regEmail(email))
    } else {
      throw Error('Password mismatch')
    }
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

const login_post = async (req, res) => {
  let { email, password } = req.body

  try {
    let user = await User.login(email, password)
    let token = createToken(user._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(200).json({ user: user._id })
  } catch (err) {
    let errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

const logout_get = (req, res) => {
  res.cookie('jwt', '', {maxAge: 1})
  res.redirect('/')
}

const reset_get = (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot Password'
  })
}

const reset_post = async (req, res) => {
  let { email } = req.body

  try {
    let user = await User.findOne({ email })
    if (user) {
      let token = createRefreshToken(user._id)
      user.resetToken = token
      user.resetTokenExp = Date.now() + 60 * 60 * 1000
      await user.save()
      res.status(201).json({ user: user._id })
      await transporter.sendMail(resetPass(user.email, token))
    } else {
      throw Error('incorrect email')
    }
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

const password_get = async (req, res) => {
  if(!req.params.token) {
    return res.redirect('/auth/login')
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Access Recovery',
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch (err) {
    console.log(err)
  }
}

const password_post = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (user) {
      user.password = req.body.password
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      res.status(201).json({ user: user._id })
    }
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

module.exports = {
  signup_get,
  login_get,
  signup_post,
  login_post,
  logout_get,
  reset_get,
  reset_post,
  password_get,
  password_post
}