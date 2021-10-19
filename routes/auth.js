const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController');

router.get('/signup', authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', authController.logout_get)
router.get('/reset', authController.reset_get)
router.post('/reset', authController.reset_post)
router.get('/password/:token', authController.password_get)
router.post('/password', authController.password_post)



module.exports = router