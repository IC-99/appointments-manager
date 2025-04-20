window.onload = function () {
    console.log('Window loaded!');

    // Fallback nel caso in cui `pywebviewready` non funzioni
    setTimeout(() => {
        if (window.pywebview && window.pywebview.api) {
            console.log('API disponibile:', window.pywebview.api);
            console.log('PyWebView API pronta!');
            !function () {
                moment.locale('it');
                var today = moment();
                var selected = null;

                function Calendar(selector, events) {
                    this.el = document.querySelector(selector);
                    this.events = events;
                    this.current = moment().date(1);
                    this.draw();
                    var current = document.querySelector('.today');
                    if (current) {
                        var self = this;
                        window.setTimeout(function () {
                            self.openDay(current);
                        }, 500);
                    }
                }

                Calendar.prototype.draw = function () {
                    //Create Header
                    this.drawHeader();

                    //Draw Month
                    this.drawMonth();
                }

                Calendar.prototype.drawHeader = function () {
                    var self = this;
                    if (!this.header) {
                        //Create the header elements
                        this.header = createElement('div', 'header');
                        this.header.className = 'header';

                        this.title = createElement('h1');

                        var right = createElement('div', 'right');
                        right.addEventListener('click', function () { self.nextMonth(); });

                        var left = createElement('div', 'left');
                        left.addEventListener('click', function () { self.prevMonth(); });

                        //Append the Elements
                        this.header.appendChild(this.title);
                        this.header.appendChild(right);
                        this.header.appendChild(left);
                        this.el.appendChild(this.header);
                    }

                    this.title.innerHTML = this.current.format('MMMM YYYY');
                }

                Calendar.prototype.drawMonth = function () {
                    var self = this;

                    this.events.forEach(function (ev) {
                        ev.date = moment(ev.data_appuntamento, 'YYYY-MM-DD');;
                    });


                    if (this.month) {
                        this.oldMonth = this.month;
                        this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
                        this.oldMonth.addEventListener('webkitAnimationEnd', function () {
                            self.oldMonth.parentNode.removeChild(self.oldMonth);
                            self.month = createElement('div', 'month');
                            self.backFill();
                            self.currentMonth();
                            self.fowardFill();
                            self.el.appendChild(self.month);
                            window.setTimeout(function () {
                                self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
                            }, 16);
                        });
                    } else {
                        this.month = createElement('div', 'month');
                        this.el.appendChild(this.month);
                        this.backFill();
                        this.currentMonth();
                        this.fowardFill();
                        this.month.className = 'month new';
                    }
                }

                Calendar.prototype.backFill = function () {
                    var clone = this.current.clone();
                    var dayOfWeek = (clone.day() + 6) % 7; // lun=0, mar=1, ..., dom=6

                    if (!dayOfWeek) { return; }

                    clone.subtract(dayOfWeek, 'days');

                    for (var i = dayOfWeek; i > 0; i--) {
                        this.drawDay(clone);
                        clone.add(1, 'days');
                    }
                }

                Calendar.prototype.fowardFill = function () {
                    var clone = this.current.clone().add(1, 'months').subtract(1, 'days');
                    var dayOfWeek = (clone.day() + 6) % 7; // lun=0, ..., dom=6

                    if (dayOfWeek === 6) { return; }

                    for (var i = dayOfWeek; i < 6; i++) {
                        clone.add(1, 'days');
                        this.drawDay(clone);
                    }
                }

                Calendar.prototype.currentMonth = function () {
                    var clone = this.current.clone();

                    while (clone.month() === this.current.month()) {
                        this.drawDay(clone);
                        clone.add(1, 'days',);
                    }
                }

                Calendar.prototype.getWeek = function (day) {
                    if (!this.week || (day.day() + 6) % 7 === 0) { // lunedì inizia la settimana
                        this.week = createElement('div', 'week');
                        this.month.appendChild(this.week);
                    }
                }

                Calendar.prototype.drawDay = function (day) {
                    var self = this;
                    this.getWeek(day);

                    //Outer Day
                    var outer = createElement('div', this.getDayClass(day));
                    outer.addEventListener('click', function () {
                        self.openDay(this);
                    });

                    //Day Name
                    var name = createElement('div', 'day-name', day.format('ddd'));

                    //Day Number
                    var number = createElement('div', 'day-number', day.format('DD'));


                    //Events
                    var events = createElement('div', 'day-events');
                    this.drawEvents(day, events);

                    outer.appendChild(name);
                    outer.appendChild(number);
                    outer.appendChild(events);
                    this.week.appendChild(outer);
                }

                Calendar.prototype.drawEvents = function (day, element) {
                    if (day.month() === this.current.month()) {
                        var todaysEvents = this.events.reduce(function (memo, ev) {
                            if (ev.date.isSame(day, 'day')) {
                                memo.push(ev);
                            }
                            return memo;
                        }, []);

                        todaysEvents.forEach(function (ev) {
                            var evSpan = createElement('span', 'event-dot');
                            element.appendChild(evSpan);
                        });
                    }
                }

                Calendar.prototype.getDayClass = function (day) {
                    classes = ['day'];
                    if (day.month() !== this.current.month()) {
                        classes.push('other');
                    } else if (today.isSame(day, 'day')) {
                        classes.push('today');
                    }
                    return classes.join(' ');
                }

                Calendar.prototype.openDay = function (el) {
                    if (selected != null) {
                        selected.classList.remove('selected-day');
                    }
                    el.classList.add('selected-day');
                    selected = el;

                    var details;
                    var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
                    var day = this.current.clone().date(dayNumber);

                    var currentOpened = document.querySelector('.details');

                    //Check to see if there is an open detais box on the current row
                    if (currentOpened && currentOpened.parentNode === el.parentNode) {
                        details = currentOpened;
                    } else {
                        //Close the open events on differnt week row
                        //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
                        if (currentOpened) {
                            currentOpened.addEventListener('webkitAnimationEnd', function () {
                                currentOpened.parentNode.removeChild(currentOpened);
                            });
                            currentOpened.addEventListener('oanimationend', function () {
                                currentOpened.parentNode.removeChild(currentOpened);
                            });
                            currentOpened.addEventListener('msAnimationEnd', function () {
                                currentOpened.parentNode.removeChild(currentOpened);
                            });
                            currentOpened.addEventListener('animationend', function () {
                                currentOpened.parentNode.removeChild(currentOpened);
                            });
                            currentOpened.className = 'details out';
                        }

                        //Create the Details Container
                        details = createElement('div', 'details in');

                        //Create the event wrapper
                        el.parentNode.appendChild(details);
                    }

                    var todaysEvents = this.events.reduce(function (memo, ev) {
                        if (ev.date.isSame(day, 'day')) {
                            memo.push(ev);
                        }
                        return memo;
                    }, []);

                    this.renderEvents(todaysEvents, details);
                }

                Calendar.prototype.renderEvents = function (events, ele) {
                    //Remove any events in the current details element
                    var currentWrapper = ele.querySelector('.events');
                    var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

                    events.forEach(function (ev) {
                        var div = createElement('div', 'event');
                        var square = createElement('div', 'event-category');
                        var time_text = ev.ora_appuntamento;
                        if (ev.ora_fine_appuntamento != "") {
                            time_text += ' - ' + ev.ora_fine_appuntamento
                        } 
                        var span = createElement('span', '', time_text + ' | ' + ev.indirizzo + ' (' + ev.zona + ') | ' + ev.cognome);

                        div.appendChild(square);
                        div.appendChild(span);
                        wrapper.appendChild(div);
                    });

                    if (!events.length) {
                        var div = createElement('div', 'event empty');
                        var span = createElement('span', '', 'Nessun Appuntamento');

                        div.appendChild(span);
                        wrapper.appendChild(div);
                    }

                    if (currentWrapper) {
                        currentWrapper.className = 'events out';
                        currentWrapper.addEventListener('webkitAnimationEnd', function () {
                            currentWrapper.parentNode.removeChild(currentWrapper);
                            ele.appendChild(wrapper);
                        });
                        currentWrapper.addEventListener('oanimationend', function () {
                            currentWrapper.parentNode.removeChild(currentWrapper);
                            ele.appendChild(wrapper);
                        });
                        currentWrapper.addEventListener('msAnimationEnd', function () {
                            currentWrapper.parentNode.removeChild(currentWrapper);
                            ele.appendChild(wrapper);
                        });
                        currentWrapper.addEventListener('animationend', function () {
                            currentWrapper.parentNode.removeChild(currentWrapper);
                            ele.appendChild(wrapper);
                        });
                    } else {
                        ele.appendChild(wrapper);
                    }
                }

                Calendar.prototype.nextMonth = function () {
                    this.current.add(1, 'months');
                    this.next = true;
                    this.draw();
                }

                Calendar.prototype.prevMonth = function () {
                    this.current.subtract(1, 'months');
                    this.next = false;
                    this.draw();
                }

                window.Calendar = Calendar;

                function createElement(tagName, className, innerText) {
                    var ele = document.createElement(tagName);
                    if (className) {
                        ele.className = className;
                    }
                    if (innerText) {
                        ele.innderText = ele.textContent = innerText;
                    }
                    return ele;
                }
            }();

            async function start() {
                const appointments = await window.pywebview.api.filter_appointments('');
                console.log(appointments);
                new Calendar('#calendar', appointments);
            };

            start();
        } else {
            console.error('API non trovata dopo il timeout.');
        }
    }, 100);  // Aspetta 1 secondo prima di fare il check
};