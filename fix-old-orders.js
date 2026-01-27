// Script to fix old orders in the database by fetching product details for each order's itemIds and updating the items array.
// Run this script with Node.js in your backend project root.

import mongoose from 'mongoose';
import orderModel from './backend/models/orderModel.js';
import productModel from './backend/models/productModel.js';

const MONGO_URI = 'mongodb://localhost:27017/your-db-name'; // <-- Change to your DB URI

async function fixOldOrders() {
  await mongoose.connect(MONGO_URI);
  const orders = await orderModel.find({});
  let updatedCount = 0;

  for (const order of orders) {
    // If items is empty but we have itemIds or similar info, try to fix
    if (!order.items || order.items.length === 0) {
      // Try to get itemIds from a backup field or skip if not possible
      // If you have a backup, use it here. Otherwise, skip.
      continue;
    }
    // Optionally, you can re-fetch product details for each item
    const itemIds = order.items.map(i => i._id);
    const products = await productModel.find({ _id: { $in: itemIds } });
    // Merge quantity from order.items into products
    const fixedItems = products.map(prod => {
      const orig = order.items.find(i => i._id.toString() === prod._id.toString());
      const obj = prod.toObject();
      obj.quantity = orig ? orig.quantity : 1;
      return obj;
    });
    order.items = fixedItems;
    await order.save();
    updatedCount++;
  }
  console.log(`Updated ${updatedCount} orders.`);
  await mongoose.disconnect();
}

fixOldOrders().catch(console.error);