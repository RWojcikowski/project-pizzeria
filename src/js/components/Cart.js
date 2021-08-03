import { settings, select, classNames, templates } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    this.products = [];
    this.getElements(element);
    this.initActions();

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    console.log('new Cart ', this);
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = this.dom.wrapper.querySelector(select.cart.address);
    thisCart.renderTotalsKeys = [
      'totalNumber',
      'totalPrice',
      'subtotalPrice',
      'deliveryFee'
    ];
    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(
        select.cart[key]
      );
    }
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: this.dom.address.value,
      phone: this.dom.phone.value,
      totalNumber: this.totalNumber,
      deliveryFee: this.deliveryFee,
      subtotalPrice: this.subtotalPrice,
      totalPrice: this.totalPrice,
      params: this.params,
      products: []
    };

    this.products.forEach(product => {
      const newProduct = product.getData();
      payload.products.push(newProduct);
    });
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });

  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    // new CartProduct(menuProduct, generatedDOM);
    // console.log('thisCart.products', thisCart.products);
    // console.log('adding product', menuProduct);
    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let singleProduct of thisCart.products) {
      thisCart.subtotalPrice = thisCart.subtotalPrice + singleProduct.price;
      thisCart.totalNumber = thisCart.totalNumber + singleProduct.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }
  remove(cartProduct) {
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);

    const removeDOM = cartProduct.dom.wrapper;
    removeDOM.remove();

    thisCart.update();
  }
}
export default Cart;