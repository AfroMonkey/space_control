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

    var SpaceSchedule = screens.ActionButtonWidget.extend({
        template: 'SpaceSchedule',
        start: function () {
            var schedule_time = document.getElementById("schedule_time");
            var schedule_date = document.getElementById("schedule_date");
            var today = new Date();
            schedule_time.value = today.getHours() + ":" + today.getMinutes();
            // TODO date
            schedule_date.valueAsDate = new Date(today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate());
        },
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
                self.get_schedules(datetime, space_ids).then(function (schedule_ids) {
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
                            }
                        }
                    }
                });
            });
        },
        get_schedules: function (datetime, space_ids) {
            var args = [
                [
                    ['start_datetime', '<=', datetime],
                    ['stop_datetime', '>', datetime],
                    ['space_id', 'in', space_ids],
                ],
                ['start_datetime', 'space_id', 'availability'],
            ];
            return rpc.query({
                model: 'space.schedule',
                method: 'search_read',
                args: args,
            })
        },
    });

    return {
        SpaceSchedule: SpaceSchedule,
    }
});
