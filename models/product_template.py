# -*- coding: utf-8 -*-

from odoo import api, fields, models, _


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_ticket = fields.Boolean(
        compute='_get_is_ticket'
    )
    space_ids = fields.Many2many(
        comodel_name='space',
        string=_('Spaces'),
    )

    @api.depends('pos_categ_id')
    def _get_is_ticket(self):
        for record in self:
            if record.pos_categ_id:
                record.is_ticket = record.pos_categ_id == self.env.ref('pos_category_ticket')
