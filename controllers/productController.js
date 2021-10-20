const Product = require('../models/product')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const handleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = { title: '', price: '', doc: '' }

  // Error creating product
  if (err.message === 'Error creating product') {
    errors.doc = 'Error creating product'
  }

   // Error updating product
  if (err.message === 'Error updating product') {
    errors.doc = 'Error updating product'
  }

  // validation errors
  if (err.message.includes('Product validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }

  return errors
}

// All products
const product_index = async (req, res) => {
  let query = Product.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  try {
    const products = await query.exec()
    res.render('products/index', {
      title: 'All products',
      products: products,
      searchOptions: req.query
    })
  } catch(err) {
    res.redirect('/')
  }
}

// New product page
const product_create_get = async (req, res) => {
  res.render('products/new', { 
    product: new Product(),
    title: 'Add New Product'
  })
}

// Create product
const product_create_post = async (req, res) => {
  const product = new Product({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price
  })
  saveCover(product, req.body.cover)

  try {
    const newProduct = await product.save()
    if (newProduct) {
      res.status(201).json({ newProduct: newProduct._id })
    } else {
      throw Error('Error creating product')
    }
  } catch(err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

// Show product details
const product_details = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product == null) {
      return res.redirect('/')
    }
    res.render('products/show', { 
      title: 'Info About Product',
      product: product 
    })
  } catch (err) {
    res.redirect('/')
  }
}

// Edit product 
const product_edit_get = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product == null) {
      return res.redirect('/')
    }
    res.render('products/edit', {
      title: 'Edit Product',
      product: product
    })
  } catch (err) {
    res.redirect('/')
  }
}

// Update product
const product_update_put = async (req, res) => {
  let product
  try {
    product = await Product.findById(req.params.id)
    product.title = req.body.title
    product.description = req.body.description
    product.price = req.body.price
  if (req.body.cover != null && req.body.cover !== '') {
    saveCover(product, req.body.cover)
  }
  const updatedProduct = await product.save()
  if (updatedProduct) {
    res.status(201).json({ updatedProduct: updatedProduct._id })
  } else {
    throw Error('Error updating product')
  }
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

// Delete product
const product_delete = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id)
    await product.remove()
    res.json({ message: 'Product Deleted' })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(500).json({ errors })
  }
}

function saveCover(product, coverEncoded) {
  if (coverEncoded == null) return false
  const cover = JSON.parse(coverEncoded)
  if(cover != null && imageMimeTypes.includes(cover.type)) {
    product.coverImage = new Buffer.from(cover.data, 'base64')
    product.coverImageType = cover.type
  }
  return true
}


module.exports = {
  product_index,
  product_create_get,
  product_create_post,
  product_details,
  product_edit_get,
  product_update_put,
  product_delete
}