if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const csurf = require('csurf')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const indexRoutes = require('./routes')
const blogRoutes = require('./routes/blog')
const aboutRoutes = require('./routes/about')
const productRoutes = require('./routes/products')
const errorHandler = require('./middleware/error')
const authRoutes = require('./routes/auth')
const varMiddleware = require('./middleware/variables')
const { checkUser } = require('./middleware/authMiddleware')

const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(express.json({ limit: '10mb', extended: true }))
app.use(cookieParser())
app.use(csurf({ cookie: true }))
app.use(varMiddleware)

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.get('*', checkUser)

app.use('/', indexRoutes)
app.use('/blogs', blogRoutes)
app.use('/about', aboutRoutes)
app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use(errorHandler)

app.listen(process.env.PORT || 3000)




