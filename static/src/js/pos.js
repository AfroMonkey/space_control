odoo.define('space_control.space', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');

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
            var self = this;
            var schedule_time = document.getElementById("schedule_time");
            var schedule_date = document.getElementById("schedule_date");
            var today = new Date();
            schedule_time.value = today.getHours() + ":" + today.getMinutes();
            schedule_date.valueAsDate = today;
            // TODO onchange to get product availability
        },
    });

    screens.define_action_button({
        'name': 'space_schedule',
        'widget': SpaceSchedule,
    });
    return {
        SpaceSchedule: SpaceSchedule,
    }
});
