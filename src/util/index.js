// @deps
const axios = require('axios');
const { commands } = require('../types');

// @env
require('dotenv').config();

// @func
function formatDay() {
  const today = new Date();
  return today.getDate()+'.'+(today.getMonth() + 1)+'.'+today.getFullYear();
}
async function getMenu() {
  try {
    // @day
    const day = formatDay();

    // @req
    const { data } = await axios.post(process.env.GAS_URL, {
      cmd: commands.GET_MENU, day
    });

    // @res
    return data;
  } catch (e) {
    return { message: e.message };
  }
}
async function makeOrder(order) {
  try {
    // @req
    const { data } = await axios.post(process.env.GAS_URL, {
      cmd: commands.MAKE_ORDER, order
    });

    // @res
    return data;
  } catch (e) {
    return { message: e.message };
  }
}

module.exports = {
  formatDay,
  getMenu,
  makeOrder,
};
