# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class SpaceReservationType(models.Model):
    _name = 'space.reservation.guest_relation'
    _description = 'Space Reservation Guest Relation'

    reservation_type_id = fields.Many2one(
        comodel_name='space.reservation.type',
    )
    product_id = fields.Many2one(
        comodel_name='product.product',
        required=True,
    )
    qty = fields.Integer(
        required=True,
    )
