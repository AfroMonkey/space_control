# -*- coding: utf-8 -*-

from datetime import timedelta, datetime
import pytz

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class POSOrderUseWizard(models.TransientModel):
    _name = 'pos.order.use_wizard'
    _description = 'Multiple schedules'

    key = fields.Char(
        compute='_get_key',
        readonly=False,
        required=True,
    )
    order_id = fields.Many2one(
        comodel_name='pos.order',
        compute='_get_order',
        store=True,
        readonly=False,
        required=True,
    )
    schedule_ids = fields.Many2many(
        related='order_id.schedule_ids',
    )
    schedule_to_use_ids = fields.Many2many(
        comodel_name='space.schedule',
    )
    schedule_used_ids = fields.Many2many(
        related='order_id.schedule_used_ids',
    )
    ticket_ids = fields.Many2many(
        comodel_name='pos.order.line',
        compute='_get_ticket_ids',
    )

    @api.onchange('schedule_ids', 'schedule_used_ids')
    def _get_schedule_to_use_ids_domain(self):
        for record in self:
            if record.schedule_ids:
                return {'domain': {
                    'schedule_to_use_ids': [('id', 'in', record.schedule_ids.ids), ('id', 'not in', record.schedule_used_ids.ids)]
                }}

    @api.onchange('order_id')
    def _get_ticket_ids(self):
        for record in self:
            record.ticket_ids = record.order_id.lines

    @api.onchange('order_id')
    def _get_key(self):
        for record in self:
            if record.order_id:
                record.key = record.order_id.key

    @api.onchange('key')
    def _get_order(self):
        for record in self:
            if record.key:
                record.order_id = self.env['pos.order'].search([('key', '=', record.key)], limit=1)

    def mark_as_used(self):
        user_tz = self.env.user.tz or pytz.utc.zone
        local = pytz.timezone(user_tz)
        now = today = fields.Datetime.now()
        today = (now + local.utcoffset(now)).replace(hour=0, minute=0, second=0) - local.utcoffset(now)
        tomorrow = (now + local.utcoffset(now)).replace(hour=23, minute=59, second=59) - local.utcoffset(now)
        for record in self:
            if record.order_id:
                for schedule in record.order_id.schedule_ids:
                    anticipation = timedelta(minutes=schedule.anticipation)
                    tolerance = timedelta(minutes=schedule.tolerance)
                    if schedule.start_datetime < today or schedule.start_datetime > tomorrow:
                        raise ValidationError(_('The schedule for {} is not for today.'.format(schedule.space_id.name)))
                    if schedule.anticipation and now + anticipation < schedule.start_datetime:
                        raise ValidationError(_('The schedule for {} is for later today.'.format(schedule.space_id.name)))
                    elif schedule.tolerance and now - tolerance > schedule.start_datetime:
                        raise ValidationError(_('The schedule for {} has expired.'.format(schedule.space_id.name)))
                record.order_id.schedule_used_ids |= record.schedule_to_use_ids
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
                raise ValidationError(_('Select an order.'))
