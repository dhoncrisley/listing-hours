/* // 'use strict';
const moment = require("moment-timezone");

class ListingHours {

    constructor(periods, timezone) {
        this.periods = periods;
        this.timezone = timezone;
    }

    
    getHumanReadable() {
        const readable = [];
        const weekdays = moment.weekdays();

        for (let i = 0; i < weekdays.length; ++i) {
            const filtered = this.periods.filter(p => p.open.day === i);

            if (filtered.length === 0) {
                readable.push(`${weekdays[i]}: Closed`);
                continue;
            }

            const sorted = filtered.sort((a, b) => moment(a.open.time, 'HHmm') - moment(b.open.time, 'HHmm'));

            let hr = `${weekdays[i]}: `;
            for (let j = 0; j < sorted.length; ++j) {
                const start = moment(sorted[j].open.time, 'HHmm').format('hh:mm a');
                const end = moment(sorted[j].close.time, 'HHmm').format('hh:mm a');
                if (start === end) {
                    hr += `Open 24 hours`;
                    break;
                }
                hr += `${start} - ${end}`;

                if (j < sorted.length - 1) {
                    hr += ', ';
                }
            }
            readable.push(hr);
        }
        return readable;
    }

    
    getTodaysHours() {
        const current = moment.tz(this.timezone);
        let weekday = current.weekday();
        const filtered = this.periods.filter(p => {
            return p.open.day === weekday || p.close.day === weekday;
        });

        if (filtered.length === 0) return [];
        const timeline = [];
        for (let f of filtered) {
            let start, end;
            if (f.open.day === weekday) {
                start = moment.tz(this.timezone).set({
                    hour: f.open.time.substr(0, 2),
                    minute: f.open.time.substr(2, 4),
                    second: 0,
                    millisecond: 0
                });
                if (f.close.day !== weekday) {
                    end = moment.tz(this.timezone).endOf('day');
                } else {
                    end = moment.tz(this.timezone).set({
                        hour: f.close.time.substr(0, 2),
                        minute: f.close.time.substr(2, 4),
                        second: 0,
                        millisecond: 0
                    });
                }
            } else if (f.close.day === weekday) {
                start = moment.tz(this.timezone).startOf('day');
                end = moment.tz(this.timezone).set({
                    hour: f.close.time.substr(0, 2),
                    minute: f.close.time.substr(2, 4),
                    second: 0,
                    millisecond: 0
                });
            }

            timeline.push({
                start,
                end
            });
        }

        return timeline;
    }

    
    isOpen() {
        const current = moment.tz(this.timezone);
        const timeline = this.getTodaysHours();
        for (let t of timeline) {
            if (current.isBetween(t.start, t.end)) return true;
        }
        return false;
    }
}



module.exports = ListingHours;

const periods = [{
    "close": {
        "day": 2,
        "time": "1000"
    },
    "open": {
        "day": 1,
        "time": "0700"
    }
},
{
    "close": {
        "day": 7,
        "time": "2300"
    },
    "open": {
        "day": 7,
        "time": "1730"
    }
},]


const abc = new ListingHours(periods, 'America/Recife')

console.log(abc.isOpen())
console.log(abc.getHumanReadable()) */