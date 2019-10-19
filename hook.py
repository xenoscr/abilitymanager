from plugins.abilitymanager.app.abilitymanager import abilitymanager
from app.database.core_dao import CoreDao

name = 'abilitymanager'
description = 'A plugin for MITRE\'s Caldera tool to aid in the creation and management of existing abilities.'
address = 'plugin/abilitymanager/gui'

async def initialize(app, services):
	data_svc = services.get('data_svc')
	am_api = abilitymanager(services)
	app.router.add_static('/abilitymanager', 'plugins/abilitymanager/static', append_version=True)
	app.router.add_route('*', '/plugin/abilitymanager/gui', am_api.landing)
	app.router.add_route('*', '/plugin/abilitymanager/rest', am_api.rest_api)
