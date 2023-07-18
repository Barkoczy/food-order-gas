const express = require('express');
const { formatDay, getMenu, makeOrder } = require('../util');

// @router
const router = express.Router();

// @routes
router.get('/', (_, res) => {
  res.render('index', { day: formatDay()});
});

router.get('/api/v1/foodmenu', async (_, res) => {
  const menu = await getMenu();
  res.render('menu', { menu });
});

router.post('/api/v1/order/make', async (req, res) => {
  const { order } = req.body;
  const result = await makeOrder(order);
  res.json(result);
});

// @export
module.exports = router;
