require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const app = express();
const fileUpload = require('express-fileupload')

const port = process.env.APP_PORT

const { logInfo, logSuccess, logError } = require('./utils/err');

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', 
}));


app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp',
  limits: { fileSize: 12 * 1024 * 1024 } // 12 MB
}));




// Routes
const paymentRoutes = require('./routes/payment/payment_routes');
const productRoutes = require('./routes/product/product_routes');
const orderRoutes = require('./routes/order/order_routes');
const discountRoutes = require('./routes/discount/discount_routes');
const memberRoutes = require('./routes/member/member_routes');
const outletRoutes = require('./routes/outlet/outlet_routes');
const categoryRoutes = require('./routes/category/category_routes');
const authRoutes = require('./routes/auth/auth_routes');
const userRoutes = require('./routes/user/user_routes');
const management = require('./routes/management/management_routes')
const tracking = require('./routes/tracking/tracking_routes')


// Register all routes with /api/ prefix
app.use('/api', paymentRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', discountRoutes);
app.use('/api', memberRoutes);
app.use('/api', outletRoutes);
app.use('/api', categoryRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', management)
app.use('/api', tracking)


//
const server = http.createServer(app);


mongoose.connect(`${process.env.CLOUD_URI}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 20,
  minPoolSize: 5,
}).then(() => logSuccess('✅ MongoDB connected successfully'))
  .catch((error) => logError(`❌ MongoDB connection error : ${error}`));



server.listen(port, () => {
  logInfo(`🚀 Server is running on http://localhost:${port}`);
});
