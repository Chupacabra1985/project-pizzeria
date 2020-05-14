import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initData: function () {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.product;
    thisApp.data = {};
    fetch(url).then(function (rawResponse) {
      return rawResponse.json();
    }).then(function (parsedResponse) {
      thisApp.data.products = parsedResponse;
      thisApp.initMenu();
    });
    console.log('thisApp.daa', JSON.stringify(thisApp.data));
  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initCard: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    thisApp.initData();
    thisApp.initCard();
  }
};

app.init();

