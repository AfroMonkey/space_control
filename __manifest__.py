# -*- coding: utf-8 -*-

{
    'name': 'Space Control',
    'version': '13.0.1.4.2',
    'author': 'Navarro Moisés',
    'website': 'https://github.com/AfroMonkey/space_control',
    'category': 'Operations',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/space_control_groups.xml',
        'security/ir.model.access.csv',
        'data/pos_category.xml',
        'data/product_attribute.xml',
        'views/space.xml',
        'views/space_schedule.xml',
        'views/space_schedule_wizard.xml',
        'views/space_schedule_statistics.xml',
        'views/product_product.xml',
        'views/pos_order.xml',
        'views/pos_order_use_wizard.xml',
        'templates/pos.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    'application': True,
}
