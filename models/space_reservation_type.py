# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class SpaceReservationType(models.Model):
    _name = 'space.reservation.type'
    _description = 'Space Reservation Type'

    name = fields.Char(
        required=True,
    )
    price = fields.Float(
        required=True,
    )
    space_ids = fields.Many2many(
        comodel_name='space',
    )
    ticket_ids = fields.One2many(
        comodel_name='space.reservation.guest_relation',
        inverse_name='reservation_type_id',
    )
