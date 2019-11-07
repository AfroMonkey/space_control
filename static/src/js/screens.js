odoo.define("space_control.screens", function (require) {
    "use strict";

    var screens = require("point_of_sale.screens");
    var rpc = require("web.rpc");
    var core = require('web.core');
    var models = require('point_of_sale.models');

    var _t = core._t;

    models.load_fields('product.product', [
        'space_ids',
    ]);


    var get_schedules = function (datetime, space_ids) {
        var filter = [
            ['start_datetime', '<=', datetime],
            ['stop_datetime', '>', datetime],
        ]
        if (space_ids) {
            filter.push(['space_id', 'in', space_ids]);
        }
        var fields = [
            'start_datetime',
            'space_id',
            'availability',
        ]
        return rpc.query({
            model: 'space.schedule',
            method: 'search_read',
            args: [filter, fields],
        })
    }

    var SpaceSchedule = screens.ActionButtonWidget.extend({
        template: 'SpaceSchedule',
        start: function () {
            var schedule_time = document.getElementById("schedule_time");
            var schedule_date = document.getElementById("schedule_date");
            var self = this;
            this.$('#schedule_date').change(function () {
                const datetime = new Date(schedule_date.value + " " + schedule_time.value);
                get_schedules(datetime, undefined).then(function (schedule_ids) {
                    var order = self.pos.get_order();
                    order.schedule_ids = schedule_ids;
                    var schedules_table = document.getElementById('schedules_table');
                    for (var row of document.getElementsByClassName("schedule_row")) {
                        row.remove();
                    }
                    for (var schedule of order.schedule_ids) {
                        const date = schedule.start_datetime.substring(0, 10);
                        const time = schedule.start_datetime.substring(11, 19);
                        schedule.start_datetime = new Date(date + 'T' + time + '.000Z');
                        var tr = document.createElement('tr');
                        tr.setAttribute("class", "schedule_row");
                        var td = document.createElement('td');
                        td.appendChild(document.createTextNode(schedule.space_id[1]));
                        tr.appendChild(td);
                        td = document.createElement('td');
                        td.appendChild(document.createTextNode(schedule.start_datetime.toLocaleString()));
                        tr.appendChild(td);
                        td = document.createElement('td');
                        td.appendChild(document.createTextNode(schedule.availability));
                        tr.appendChild(td);
                        schedules_table.appendChild(tr);
                    }
                });
            });
            this.$('#schedule_time').change(function () {
                const datetime = new Date(schedule_date.value + " " + schedule_time.value);
                get_schedules(datetime, undefined).then(function (schedule_ids) {
                    var order = self.pos.get_order();
                    order.schedule_ids = schedule_ids;
                    var schedules_table = document.getElementById('schedules_table');
                    for (var row of document.getElementsByClassName("schedule_row")) {
                        row.remove();
                    }
                    for (var schedule of order.schedule_ids) {
                        const date = schedule.start_datetime.substring(0, 10);
                        const time = schedule.start_datetime.substring(11, 19);
                        schedule.start_datetime = new Date(date + 'T' + time + '.000Z');
                        var tr = document.createElement('tr');
                        tr.setAttribute("class", "schedule_row");
                        var td = document.createElement('td');
                        td.appendChild(document.createTextNode(schedule.space_id[1]));
                        tr.appendChild(td);
                        td = document.createElement('td');
                        td.appendChild(document.createTextNode(schedule.start_datetime.toLocaleString()));
                        tr.appendChild(td);
                        td = document.createElement('td');
                        td.appendChild(document.createTextNode(schedule.availability));
                        tr.appendChild(td);
                        schedules_table.appendChild(tr);
                    }
                });
            });
            var today = new Date();
            schedule_time.value = today.getHours() + ":" + today.getMinutes();
            schedule_date.valueAsDate = new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());
            const datetime = new Date(schedule_date.value + " " + schedule_time.value);
            get_schedules(datetime, undefined).then(function (schedule_ids) {
                var order = self.pos.get_order();
                order.schedule_ids = schedule_ids;
                var schedules_table = document.getElementById('schedules_table');
                for (var row of document.getElementsByClassName("schedule_row")) {
                    row.remove();
                }
                for (var schedule of order.schedule_ids) {
                    const date = schedule.start_datetime.substring(0, 10);
                    const time = schedule.start_datetime.substring(11, 19);
                    schedule.start_datetime = new Date(date + 'T' + time + '.000Z');
                    var tr = document.createElement('tr');
                    tr.setAttribute("class", "schedule_row");
                    var td = document.createElement('td');
                    td.appendChild(document.createTextNode(schedule.space_id[1]));
                    tr.appendChild(td);
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode(schedule.start_datetime.toLocaleString()));
                    tr.appendChild(td);
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode(schedule.availability));
                    tr.appendChild(td);
                    schedules_table.appendChild(tr);
                }
            });
            // TODO simplify code, 3 times same code
        }
    });

    screens.define_action_button({
        'name': 'space_schedule',
        'widget': SpaceSchedule,
    });

    screens.ActionpadWidget.include({
        renderElement: function () {
            var self = this;
            this._super();
            this.$('.pay').off('click');
            this.$('.pay').click(function () {
                var order = self.pos.get_order();
                var datetime = new Date(schedule_date.value + " " + schedule_time.value)
                var space_ids = [];
                for (var line of order.orderlines.models) {
                    space_ids = space_ids.concat(line.product.space_ids)
                }
                get_schedules(datetime, space_ids).then(function (schedule_ids) {
                    if (schedule_ids.length == 0) {
                        self.gui.show_popup('error', {
                            'title': _t('No schedule'),
                            'body': _t('There is no schedule at that time for that space.'),
                        });
                    } else {
                        for (var schedule of schedule_ids) {
                            if (schedule.availability <= 0) {
                                self.gui.show_popup('error', {
                                    'title': _t('No availability'),
                                    'body': _t('There is no availability for that schedule in space ' + schedule.space_id[1]),
                                });
                            } else {
                                const date = schedule.start_datetime.substring(0, 10);
                                const time = schedule.start_datetime.substring(11, 19);
                                schedule.start_datetime = new Date(date + 'T' + time + '.000Z');
                                order.schedule_ids = schedule_ids;
                                self.gui.show_screen('payment');
                                // TODO simplify
                            }
                        }
                    }
                });
            });
        },
    });

    screens.ReceiptScreenWidget.include({
        show: function () {
            this._super();
            const order = this.pos.get_order();
            new QRCode("qrcode", {
                text: order.key,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
        },
    });

    return {
        SpaceSchedule: SpaceSchedule,
    }
});
