odoo.define('space_control.pos', function (require) {
    "use strict";

    var models = require('point_of_sale.models');

    var _super_order = models.Order.prototype;

    models.load_models([{
        model: 'pos.order',
        fields: [
            'name',
        ],
        loaded: function (self, orders) { self.order = orders[0]; },
    }]);

    models.Order = models.Order.extend({
        load_server_data: function () {
            var self = this;
            self.models.push({
                model: 'space.schedule',
                fields: ['id'],
                loaded: function (self, schedules) {
                    self.schedules = schedules;
                },
            });
            return PosModelParent.load_server_data.apply(this, arguments);
        },
        export_as_JSON: function () {
            var self = this;
            var json = _super_order.export_as_JSON.apply(this, arguments);
            const schedule_time = document.getElementById("schedule_time");
            const schedule_date = document.getElementById("schedule_date");

            if (schedule_time && schedule_date) {
                const datetime = new Date(schedule_date.value + " " + schedule_time.value)
                json.schedule_datetime = datetime;
                this.key = this.generate_key();
                json.key = this.key;
                json.schedule_ids = this.schedule_ids;
            }
            return json;
        },
        generate_key: function () {
            const len = 16; // TODO conf
            return 'x'.repeat(len).replace(/[x]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    });
});
