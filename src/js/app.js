import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data', thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.ProductList = document.querySelector(select.containerOf.menu);

    thisApp.ProductList.addEventListener('add-to-card', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    // thisApp.data = dataSource;
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)

      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        /* save parsedResponse as thisApp.data.products*/
        thisApp.data.products = parsedResponse;
        /*execute initMenu Method */
        thisApp.initMenu();

      });
    // console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initData();
    thisApp.initCart();
  }
};
app.init();
