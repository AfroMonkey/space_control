# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class POSOrderUseWizard(models.TransientModel):
    _name = 'pos.order.use_wizard'
    _description = 'Multiple schedules'

    key = fields.Char(
        required=True,
    )
    order_id = fields.Many2one(
        comodel_name='pos.order',
        required=True,
        readonly=False,
        compute='_get_order',
    )
    schedule_ids = fields.Many2many(
        related='order_id.schedule_ids',
    )
    used_datetime = fields.Datetime(
        related='order_id.used_datetime',
    )
    used = fields.Boolean(
        related='order_id.used',
    )
    ticket_ids = fields.Many2many(
        comodel_name='pos.order.line',
        compute='_get_ticket_ids',
    )

    @api.depends('order_id')
    def _get_ticket_ids(self):
        for record in self:
            record.ticket_ids = record.order_id.lines

    @api.onchange('key')
    def _get_order(self):
        for record in self:
            if record.key:
                POSOrder = self.env['pos.order']
                record.order_id = POSOrder.search(
                    [
                        ('key', '=', record.key),
                    ],
                    limit=1,
                )

    def mark_as_used(self):
        for record in self:
            if record.order_id:
                if not record.order_id.used:
                    record.order_id.used_datetime = fields.Datetime.now()
                    return {
                        'context': self.env.context,
                        'view_type': 'form',
                        'view_mode': 'form',
                        'res_model': self._name,
                        'view_id': False,
                        'type': 'ir.actions.act_window',
                        'target': 'new',
                    }
                else:
                    raise ValidationError(_('Order already used.'))
            else:
                raise ValidationError(_('Select an order.'))
