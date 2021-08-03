import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    console.log(thisCartProduct);
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    this.initActions();
  }
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct
      }
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initActions(event) {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function () {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function () {
      // event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amountWidget.value = thisCartProduct.amount;
      thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amount;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  getData() {
    const data = {
      id: this.id,
      amount: this.amount,
      priceSingle: this.priceSingle,
      price: this.price,
      params: this.params,
      name: this.name,
    };
    return data;
  }
}

export default CartProduct;