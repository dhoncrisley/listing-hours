"use strict";
// const moment = require("moment-timezone");
const { parse, getDay, format, set, isWithinInterval } = require("date-fns");

const weekdays = [
  "Domingo",
  "Segunda-Feira",
  "Terça-Feira",
  "Quarta-Feira",
  "Quinta-Feira",
  "Sexta-Feira",
  "Sábado",
  "Feriados",
];
class ListingHours {
  constructor(periods, timezone = "America/Recife") {
    this.periods = periods;
    this.timezone = timezone;
  }

  /**
   * Returns Array of readable hours
   */
  getHumanReadable() {
    const readable = [];

    for (let i = 0; i < weekdays.length; ++i) {
      const filtered = this.periods.filter((p) => p.open.day == i);

      if (filtered.length == 0) {
        readable.push(`${weekdays[i]}: Fechado`);
        continue;
      }

      const sorted = filtered.sort(
        (a, b) =>
          parse(a.open.time, "HHmm", new Date()) -
          parse(b.open.time, "HHmm", new Date()),
      );

      let hr = `${weekdays[i]}: `;
      for (let j = 0; j < sorted.length; ++j) {
        const start = format(
          parse(sorted[j].open.time, "HHmm", new Date()),
          "HH:mm",
        );
        const end = format(
          parse(sorted[j].close.time, "HHmm", new Date()),
          "HH:mm",
        );
        if (start == end) {
          hr += `Aberto 24 horas`;
          break;
        }
        hr += `${start} - ${end}`;

        if (j < sorted.length - 1) {
          hr += ", ";
        }
      }
      readable.push(hr);
    }
    return readable;
  }

  /**
   * Returns business hours for the day
   */
  getDayHours(weekday) {
    const now = new Date();
    // let  = getDay(current);
    const filtered = this.periods.filter((p) => {
      return p.open.day == weekday || p.close.day == weekday;
    });

    if (filtered.length == 0) return [];
    const timeline = [];
    for (let i = 0; i < filtered.length; i++) {
      const f = filtered[i];
      let start, end;
      if (f.open.day == weekday) {
        start = set(new Date(), {
          hours: f.open.time.substr(0, 2),
          minutes: f.open.time.substr(2, 4),
          seconds: 0,
          milliseconds: 0,
        });
        if (f.close.day != weekday) {
          end = set(new Date(), { hours: 23, minutes: 59, seconds: 59 });
        } else {
          end = set(new Date(), {
            hours: f.close.time.substr(0, 2),
            minutes: f.close.time.substr(2, 4),
            seconds: 0,
            milliseconds: 0,
          });
        }
      } else if (f.close.day == weekday) {
        start = set(new Date(), { hours: 0, minutes: 0, seconds: 0 });

        end = set(new Date(), {
          hours: f.close.time.substr(0, 2),
          minutes: f.close.time.substr(2, 4),
          seconds: 0,
          milliseconds: 0,
        });
      }

      timeline.push({
        start,
        index: f.index,
        end,
      });
    }

    return timeline;
  }

  /**
   * Returns back if restaurant is open or currently closed
   */
  isOpen(day = getDay(new Date())) {
    const current = new Date();
    const timeline = this.getDayHours(day);
    for (let t of timeline) {
      if (isWithinInterval(current, { start: t.start, end: t.end }))
        return true;
    }
    return false;
  }
}

module.exports = ListingHours;
