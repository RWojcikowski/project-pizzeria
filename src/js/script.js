/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  const settings = {
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END

  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log(thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      /*generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // console.log(generatedHTML);
      /*create element using ulils . createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }
    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = this.element.querySelector(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function (event) {
        // console.log(clickableTrigger);
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        allActiveProducts.forEach(product => {
          if (product !== thisProduct.element) {
            product.classList.remove('active');
            /* toggle active class on thisProduct.element */
            // thisProduct.element.classList.toggle('active');
            //console.log(thisProduct);
          }
        });
      });
    }
    initOrderForm() {
      const thisProduct = this;
      //console.log(thisProduct);
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData', formData);
      // set price to default price
      let price = thisProduct.data.price;
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);
        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
          const optionSelected =
            formData[paramId] &&
            formData[paramId].includes(optionId);
          if (optionSelected && !option.default) {
            price = price + option.price;
          } else if (!optionSelected && option.default) {
            price = price - option.price;
          }
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /*update calculated price in the HTML*/
      thisProduct.priceSingle = price;

      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      thisProduct.priceElem.innerHTML = thisProduct.price;
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('update', function () {
        thisProduct.processOrder();


      });
    }
    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct.prepareCartProduct());


    }

    prepareCartProduct() {

      const thisCartProduct = this;
      console.log(this);

      const productSummary = {
        id: thisCartProduct.id,
        name: thisCartProduct.data.name,
        price: thisCartProduct.priceSingle * thisCartProduct.amountWidget.value,
        amount: thisCartProduct.amountWidget.value,
        priceSingle: thisCartProduct.priceSingle,
        params: {}

      };

      return productSummary;

    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      // for very category (param)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };


        // for every option in this category
        for (let optionId in param.options) {
          // const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {}
              };
            }
          }
        }

      }
      return params;

    }
  }
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      // console.log('AmountWidget', thisWidget);
      // console.log('constructor argument:', element);
      thisWidget.getElements(element);
      thisWidget.value = thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }
    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      /* TODO: Add validation */
      const newValue = parseInt(value);
      thisWidget.input.value = thisWidget.value;
      if (
        newValue !== thisWidget.value &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      )
        thisWidget.value = newValue;
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }
    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
      });
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
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
      this.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
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
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });

    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      new CartProduct(menuProduct, generatedDOM);
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
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

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
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price =
          thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
  }


  const app = {

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },



    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = {};
      // thisApp.data = dataSource;
      const url = settings.db.url + '/' + settings.db.products;
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
      console.log('thisApp.data', JSON.stringify(thisApp.data));
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
    },
  };
  app.init();
}