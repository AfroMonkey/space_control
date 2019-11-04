odoo.define('space_control.space', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var rpc = require("web.rpc");
    var session = require("web.session");

    var _super_order = models.Order.prototype;

    models.Order = models.Order.extend({
        export_as_JSON: function () {
            var json = _super_order.export_as_JSON.apply(this, arguments);
            var schedule_time = document.getElementById("schedule_time");
            var schedule_date = document.getElementById("schedule_date");
            if (schedule_time && schedule_date) {
                var date = new Date(schedule_date.value + " " + schedule_time.value)
                json.schedule_datetime = date;
            }
            return json;
        },
    });

    var SpaceSchedule = screens.ActionButtonWidget.extend({
        template: 'SpaceSchedule',
        start: function () {
            var schedule_time = document.getElementById("schedule_time");
            var schedule_date = document.getElementById("schedule_date");
            var today = new Date();
            schedule_time.value = today.getHours() + ":" + today.getMinutes();
            schedule_date.valueAsDate = today;
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
            this.$('.pay').click(function () {
                var order = self.pos.get_order();
                var date = new Date(schedule_date.value + " " + schedule_time.value)
                self.check_availability(date, order).then(function (available) {
                    if (available) {
                        // var has_valid_product_lot = _.every(order.orderlines.models, function (line) {
                        //     return line.has_valid_product_lot();
                        // });
                        // if (!has_valid_product_lot) {
                        //     self.gui.show_popup('confirm', {
                        //         'title': _t('Empty Serial/Lot Number'),
                        //         'body': _t('One or more product(s) required serial/lot number.'),
                        //         confirm: function () {
                        //             self.gui.show_screen('payment');
                        //         },
                        //     });
                        // } else {
                        //     self.gui.show_screen('payment');
                        // }
                    }
                });
            });
        },
        check_availability: function (date, order) {
            var lines = [];
            for (const line of order.get_orderlines()) {
                lines.push({
                    id: line.product.id,
                    qty: line.quantity,
                });
            }
            return rpc.query({
                model: 'space.schedule',
                method: 'check_availability',
                args: [date, lines],
                kwargs: {
                    context: session.user_context
                },
            });
        }
    });

    return {
        SpaceSchedule: SpaceSchedule,
    }
});
