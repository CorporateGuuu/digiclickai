// Export all database models

const ProductModel = require('./product');
const CategoryModel = require('./category');
const UserModel = require('./user');
const CartModel = require('./cart');
const OrderModel = require('./order');

module.exports = {
  ProductModel,
  CategoryModel,
  UserModel,
  CartModel,
  OrderModel
};
