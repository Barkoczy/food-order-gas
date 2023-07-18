// @global
const endpoint = '/api/v1';
const conf = {
  order: {
    date: '',
    address: '',
    phone: '',
    email: '',
    items: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    }
  },
  error: {
    email: {
      empty: 'Email je povinný údaj',
      validFormat: 'Email nie je v správnom tvare'
    },
    phone: {
      empty: 'Telefón je povinný údaj'
    },
    address: {
      empty: 'Adresa je poviný údaj'
    },
    items: {
      checked: {
        empty: 'Vyberte jedlo podľa vaších chutí'
      },
      qty: {
        empty: 'Zvolte počet porcí pre vybrané jedlá'
      }
    },
    qty: {
      max: 'Prekročený dostupný počet porcí'
    }
  },
  message: {
    wait: 'Vaša objednávka sa spracováva, čakajte prosím',
    error: 'Objednávka nebola spracovaná. Skúste to znova alebo nás telefonicky kontaktujte',
    success: 'Vaša objednávka bola úspešne prijatá. Ďakujeme a prajeme dobrú chuť'
  },
  elements: {
    container: '#foodmenu',
    email: '#foodmenu-input-email',
    phone: '#foodmenu-input-phone',
    address: '#foodmenu-input-address',
    button: '#foodmenu-button-send',
    items: {
      1: {
        checkbox: '#foodmenu-input-item-1-checkbox',
        qty: '#foodmenu-input-item-1-qty',
      },
      2: {
        checkbox: '#foodmenu-input-item-2-checkbox',
        qty: '#foodmenu-input-item-2-qty',
      },
      3: {
        checkbox: '#foodmenu-input-item-3-checkbox',
        qty: '#foodmenu-input-item-3-qty',
      },
      4: {
        checkbox: '#foodmenu-input-item-4-checkbox',
        qty: '#foodmenu-input-item-4-qty',
      },
      5: {
        checkbox: '#foodmenu-input-item-5-checkbox',
        qty: '#foodmenu-input-item-5-qty',
      },
      6: {
        checkbox: '#foodmenu-input-item-6-checkbox',
        qty: '#foodmenu-input-item-6-qty',
      },
    }
  }
};
let sending = false;
let order = {
  date: '',
  address: '',
  phone: '',
  email: '',
  items: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }
};

// @func
function getElements() {
  return {
    container: $(conf.elements.container),
    email: $(conf.elements.email),
    phone: $(conf.elements.phone),
    address: $(conf.elements.address),
    button: $(conf.elements.button),
    items: {
      1: {
        checkbox: $(conf.elements.items[1].checkbox),
        qty: $(conf.elements.items[1].qty),
      },
      2: {
        checkbox: $(conf.elements.items[2].checkbox),
        qty: $(conf.elements.items[2].qty),
      },
      3: {
        checkbox: $(conf.elements.items[3].checkbox),
        qty: $(conf.elements.items[3].qty),
      },
      4: {
        checkbox: $(conf.elements.items[4].checkbox),
        qty: $(conf.elements.items[4].qty),
      },
      5: {
        checkbox: $(conf.elements.items[5].checkbox),
        qty: $(conf.elements.items[5].qty),
      },
      6: {
        checkbox: $(conf.elements.items[6].checkbox),
        qty: $(conf.elements.items[6].qty),
      },
    }
  };
}
function loadMenu() {
  const elements = getElements();
  
  if (!elements.container.length) return;

  $.ajax({
    url: `${endpoint}/foodmenu`,
    type: 'GET',
    dataType: 'HTML',
    async: true,
    success(html) {
      elements.container.html(html);
      resetOrder();
      submitOrder();
    },
    error(e) {
      console.error(e);
    },
  });
}
function submitOrder() {
  // @elms
  const elements = getElements();

  // @soap
  autoSoapChoice(elements);

  // @maxQty
  maxItemQtyChoice(elements);

  // @valid
  if (!elements.button.length) return;

  // @event
  elements.button.on('click', function() {
    // @protect
    if (sending) return;

    // @orderItems
    for (let index in order.items) {
      if (elements.items[index].checkbox.is(":checked")) {
        order.items[index] = parseInt(elements.items[index].qty.val());
      }
    }

    // @valid
    if (notOrderItems(elements)) {
      notify('warm', conf.error.items.checked.empty);
      return;
    }
    if (notOrderQtyItems(elements)) {
      notify('warm', conf.error.items.qty.empty);
      return;
    }
    if (!elements.email.length || !elements.email.val().length > 0) {
      notify('warm', conf.error.email.empty);
      return;
    }
    if (!validateEmail(elements.email.val())) {
      notify('warm', conf.error.email.validFormat);
      return;
    }
    if (!elements.phone.length || !elements.phone.val().length > 0) {
      notify('warm', conf.error.phone.empty);
      return;
    }
    if (!elements.address.length || !elements.address.val().length > 0) {
      notify('warm', conf.error.address.empty);
      return;
    }
    
    // @order
    order.date     = formatDay();
    order.email    = elements.email.val();
    order.phone    = elements.phone.val();
    order.address  = elements.address.val();

    // @info
    notify('info', conf.message.wait);

    // @sending
    sending = true;

    // @make
    makeOrder();
  });
}
function autoSoapChoice(elements) {
  for (let index in order.items) {
    if (index === 1) continue;
    elements.items[index].checkbox.on('change', function() {
      if ($(this).is(":checked") && !elements.items[1].checkbox.is(":checked")) {
        elements.items[1].checkbox.prop('checked', true);
      } else {
        if (countChoiceItems(elements) === 0) {
          elements.items[1].checkbox.prop('checked', false);
          elements.items[1].qty.val(0);
        }
        elements.items[index].qty.val(0);
        elements.items[1].qty.val(qtyChoiceItems(elements));
      }
    });
  }
}
function maxItemQtyChoice(elements) {
  for (let index in order.items) {
    elements.items[index].qty.on('change paste keyup', function() {
      const current = parseInt($(this).val());
      const max = parseInt($(this).attr('max'));

      if (current > max) {
        notify('warm', conf.error.qty.max);
        $(this).val(max);
      }
      elements.items[1].qty.val(qtyChoiceItems(elements));
    });
  }
}
function countChoiceItems(elements) {
  let count = 0;

  for (let index in order.items) {
    if (parseInt(index) === 1) continue;
    if (elements.items[index].checkbox.is(":checked")) {
      count++;
    }
  }

  return count;
}
function qtyChoiceItems(elements) {
  let qty = 0;

  for (let index in order.items) {
    if (parseInt(index) === 1) continue;
    if (elements.items[index].checkbox.is(":checked")) {
      qty = qty + parseInt(elements.items[index].qty.val());
    }
  }

  return qty;
}
function notOrderItems(elements) {
  let state = true;

  for (let index in order.items) {
    if (parseInt(index) === 1) continue;
    if (elements.items[index].checkbox.is(":checked")) {
      state = false;
      break;
    }
  }

  return state;
}
function notOrderQtyItems(elements) {
  let states = [];

  for (let index in order.items) {
    if (elements.items[index].checkbox.is(":checked")) {
      states.push(parseInt(elements.items[index].qty.val()) > 0);
    }
  }

  return states.includes(false);
}
function makeOrder() {
  $.ajax({
    url: `${endpoint}/order/make`,
    type: 'POST',
    data: { order },
    dataType: 'JSON',
    async: true,
    success(json) {
      if (json.status === 'ERROR') {
        notify('error', conf.message.error);
      }
      if (json.status === 'SUCCESS') {
        loadMenu();
        notify('success', conf.message.success);
      }
    },
    error(e) {
      console.error(e);
    },
  });
}
function resetOrder() {
  sending = false;
  order = conf.order;
}
function formatDay() {
  const today = new Date();
  return today.getDate()+'.'+(today.getMonth() + 1)+'.'+today.getFullYear();
}
function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
function notify(state, message) {
  $.notify.defaults({
    elementPosition: 'top right',
    globalPosition: 'top right',
    showDuration: 100,
    hideDuration: 200
  })
  $.notify(message, state);
}

// @run
loadMenu();
