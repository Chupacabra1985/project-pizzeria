import BaseWidget from './BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    const options = {
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      locale: {
        firstDayOfWeek: 1
      },
      onChange: function (dateStr) {
        thisWidget.value = dateStr;
      }
    };
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, options);
  }

  parseValue(value) {
    return value;
  }

  isValid(value) {
    return value !== null;
  }

  renderValue() {}

}

export default DatePicker;
