'use strict';
const moment = require("moment-timezone");

class ListingHours {

    constructor(periods, timezone) {
        if (typeof periods == "string") {
            periods = JSON.parse(periods);
        }
        this.periods = periods;
        this.timezone = timezone;
    }

    /**
     * Returns Array of readable hours
     */
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

    /**
     * Returns business hours for the day
     */
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

    /**
     * Return future time line from current time
     */
    getFutureTimeline() {
        const weekdays = [0, 1, 2, 3, 4, 5, 6];
        const current = moment.tz(this.timezone);
        const timeline = [];
        for (let day in weekdays) {
            const filtered = this.periods.filter(p => p.open.day == day);
            for (let f of filtered) {
                let start, end;
                if (f.open.day === parseInt(day)) {
                    start = moment.tz(this.timezone).startOf('week').set({
                        hour: f.open.time.substr(0, 2),
                        minute: f.open.time.substr(2, 4),
                        second: 0,
                        millisecond: 0
                    }).add(day, "days");
                    if (f.close.day !== parseInt(day)) {
                        end = moment.tz(this.timezone).startOf('week').endOf('day').add(day, "days");;
                    } else {
                        end = moment.tz(this.timezone).startOf('week').set({
                            hour: f.close.time.substr(0, 2),
                            minute: f.close.time.substr(2, 4),
                            second: 0,
                            millisecond: 0
                        }).add(day, "days");;
                    }
                } else if (f.close.day === parseInt(day)) {
                    start = moment.tz(this.timezone).startOf('week').startOf('day').add(day, "days");;
                    end = moment.tz(this.timezone).startOf('week').set({
                        hour: f.close.time.substr(0, 2),
                        minute: f.close.time.substr(2, 4),
                        second: 0,
                        millisecond: 0
                    }).add(day, "days");
                }

                timeline.push({
                    start,
                    end
                });

            }
        }
        for (let t of timeline) {
            if (current.isBetween(t.start, t.end)) continue;

            if (t.start < current) {
                t.start.add(7, "days");
                t.end.add(7, "days");
            }
        }

        const sorted = timeline.sort((a, b) => a.start - b.start);
        return sorted;
    }

    /**
     * Gets the next instance of when a time is reached
     */
    getNextEventTime() {
        const timeline = this.getFutureTimeline();
        if (timeline.length === 0) { return null; }
        const current = moment.tz(this.timezone);
        let nextEvent = timeline[0];
        if (nextEvent.start < current) {
            return nextEvent.end;
        }
        return nextEvent.start;
    }

    /**
     * Returns back if restaurant is open or currently closed
     */
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
