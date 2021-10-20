const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController');

router.get('/', productController.product_index)
router.get('/new', productController.product_create_get)
router.post('/', productController.product_create_post)
router.get('/:id', productController.product_details)
router.get('/:id/edit', productController.product_edit_get)
router.put('/:id', productController.product_update_put)
router.delete('/:id', productController.product_delete)

module.exports = router