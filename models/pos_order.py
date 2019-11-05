# -*- coding: utf-8 -*-

from datetime import datetime


from odoo import api, fields, models, _


class PosOrder(models.Model):
    _inherit = 'pos.order'

    schedule_datetime = fields.Datetime(
        readonly=True,
    )
    schedule_ids = fields.Many2many(
        comodel_name='space.schedule',
        compute='_get_schedule_ids',
        store=True,
    )
    key = fields.Char(
        index=True,
        readonly=True,
    )

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        order_fields['schedule_datetime'] = ui_order['schedule_datetime'].replace('T', ' ')[:19]
        if ui_order.get('key', False):
            order_fields.update({
                'key': ui_order['key']
            })
        return order_fields

    @api.model
    def create(self, values):
        order = super(PosOrder, self).create(values)
        order._get_schedule_ids()
        return order

    @api.depends('schedule_datetime')
    def _get_schedule_ids(self):
        for record in self:
            record.schedule_ids = []
            SpaceSchedule = self.env['space.schedule']
            for line in record.lines:
                for space in line.product_id.space_ids:
                    schedule = SpaceSchedule.search([
                        ('space_id', '=', space.id),
                        ('start_datetime', '<=', record.schedule_datetime),
                        ('stop_datetime', '>', record.schedule_datetime),
                    ], limit=1)
                    record.schedule_ids |= schedule
