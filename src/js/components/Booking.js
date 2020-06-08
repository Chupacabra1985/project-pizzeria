import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HoursPicker from './HoursPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  static #bookId = 6;

  static increaseCount() {
    this.#bookId += 1;
  }

  static getCount() {
    return this.#bookId;
  }


  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.dom.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.dom.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&')
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ]).then(function (allResponse) {
      const bookingsResponse = allResponse[0];
      const eventsCurrentResponse = allResponse[1];
      const eventsRepeatResponse = allResponse[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json()
      ]);
    }).then(function ([bookings, eventsCurrent, eventsRepeat]) {
      thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
    });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.dom.datePicker.minDate;
    const maxDate = thisBooking.dom.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.dom.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.dom.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    thisBooking.addSliderStyle();
  }

  addSliderStyle() {
    const thisBooking = this;
    const value = 100/24;
    const slider = document.querySelector('.rangeSlider');
    const backgroundSlider = `background: linear-gradient(90deg,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][12])} 0%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][12])} ${value}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][12.5])} ${value}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][12.5])} ${value*2}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][13])} ${value*2}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][13])} ${value*3}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][13.5])} ${value*3}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][13.5])} ${value*4}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][14])} ${value*4}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][14])} ${value*5}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][14.5])} ${value*5}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][14.5])} ${value*6}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][15])} ${value*6}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][15])} ${value*7}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][15.5])} ${value*7}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][15.5])} ${value*8}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][16])} ${value*8}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][16])} ${value*9}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][16.5])} ${value*9}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][16.5])} ${value*10}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][17])} ${value*10}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][17])} ${value*11}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][17.5])} ${value*11}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][17.5])} ${value*12}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][18])} ${value*12}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][18])} ${value*13}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][18.5])} ${value*13}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][18.5])} ${value*14}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][19])} ${value*14}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][19])} ${value*15}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][19.5])} ${value*15}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][19.5])} ${value*16}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][20])} ${value*16}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][20])} ${value*17}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][20.5])} ${value*17}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][20.5])} ${value*18}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][21])} ${value*18}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][21])} ${value*19}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][21.5])} ${value*19}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][21.5])} ${value*20}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][22])} ${value*20}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][22])} ${value*21}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][22.5])} ${value*21}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][22.5])} ${value*22}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][23])} ${value*22}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][23])} ${value*23}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][23.5])} ${value*23}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][23.5])} ${value*24}%,
    ${thisBooking.rgbRecognizer(thisBooking.booked[thisBooking.date][24])} ${value*24}%
    );`;

    slider.setAttribute('style', backgroundSlider);
    console.log(thisBooking.booked[thisBooking.date][12]);
  }

  rgbRecognizer(list) {
    if (list !== undefined) {
      if (list.length >= 3) {
        return 'rgb(255, 0, 0)';
      } else if (list.length === 2) {
        return 'rgb(255, 128, 0)';
      } else {
        return 'rgb(0, 255, 0)';
      }
    } else {
      return 'rgb(0, 255, 0)';
    }
  }

  initTables() {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function () {
        if (!table.classList.contains(classNames.booking.tableBooked)) {
          table.classList.add(classNames.booking.tableBooked);
          thisBooking.selectedTable = table.getAttribute(settings.booking.tableIdAttribute);
        }
      });
    }
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.dom.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.hourPicker = new HoursPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
    thisBooking.initTables();
    thisBooking.dom.submit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.bookTable();
    });
  }

  bookTable() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const duration = thisBooking.dom.hoursAmount.value;

    const bookLoad = {
      id: Booking.getCount(),
      date: thisBooking.dom.datePicker.value,
      hour: thisBooking.dom.hourPicker.value,
      table: parseInt(thisBooking.selectedTable),
      repeat: false,
      duration: duration,
      ppl: thisBooking.dom.peopleAmount.value,
      starters: ['bread', 'water']
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookLoad),
    };

    fetch(url, options).then(function (response) {
      return response.json();
    }).then(function (parsedResponse) {
      console.log('parsedResponse', parsedResponse);
    });

    Booking.increaseCount();
    thisBooking.getData();
  }

}

export default Booking;
