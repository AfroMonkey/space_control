# -*- coding: utf-8 -*-

from datetime import datetime


from odoo import api, fields, models, _


class PosOrder(models.Model):
    _inherit = 'pos.order'

    schedule_ids = fields.Many2many(
        comodel_name='space.schedule',
    )
    key = fields.Char(
        index=True,
        readonly=True,
    )
    used_datetime = fields.Datetime(
    )
    used = fields.Boolean(
        compute='_get_used',
    )

    @api.depends('used_datetime')
    def _get_used(self):
        for record in self:
            record.used = bool(record.used_datetime)

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        order_fields['key'] = ui_order['key']
        order_fields['schedule_ids'] = [schedule['id'] for schedule in ui_order['schedule_ids']]
        return order_fields
