import asyncio, json, logging, os, sys, re, uuid, yaml

from app.utility.logger import Logger

from pathlib import Path
from base64 import b64encode, b64decode
from aiohttp import web
from aiohttp_jinja2 import template
from stix2 import FileSystemSource
from stix2 import Filter

class cmdStr(str):
	pass

def cmd_presenter(dumper, data):
	return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')

class abilitymanager:

	def __init__(self, services):
		self.data_svc = services.get('data_svc')
		self.auth_svc = services.get('auth_svc')
		self.log = Logger('abilitymanager')
		self.log.debug('Ability Manager Plugin logging started.')
		self.get_conf()
		self.fs = FileSystemSource(self.ctipath)

	def get_conf(self):
		confPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../conf/amconf.yml')
		try:
			with open(confPath, 'r') as c:
				conf = yaml.load(c, Loader=yaml.Loaer)
			self.ctipath = os.path.expander(os.path.join(conf['ctipath'], 'enterprise-attack/'))
			self.log.debug(self.ctipath)
		except:
			pass

	def explode_stockpile(self):
		stockAbilities = []
		if os.path.exists(self.stockPath):
			self.log.debug(self.stockPath)
			for root, dirs, files in os.walk(self.stockPath):
				for procFile in files:
					fullFile = os.path.join(root, procFile)
					if os.path.splitext(fullFile)[-1].lower() == '.yml':
						self.log.debug('Processing {}'.format(fullFile))
						newAbility = {}
						with open(fullFile, 'r') as yamlFile:
							try:
								stockData = yaml.load(yamlFile, Loader=yaml.Loader)
							except:
								continue
						platformData = []
						rawAbility = stockData[0]
						rawPlatform = rawAbility['platforms']
						for keyName in rawPlatform.keys():
							for test in rawPlatform[keyName]:
								newTest = {'executor': ''}
								if 'command' in rawPlatform[keyName][test].keys():
									newTest.update({ 'command': b64encode(rawPlatform[keyName][test]['command'].encode('utf8')).decode('utf-8') }) 
								if 'cleanup' in rawPlatform[keyName][test].keys():
									newTest.update({ 'cleanup': b64encode(rawPlatform[keyName][test]['cleanup'].encode('utf-8')).decode('utf-8') })
								if 'parser' in rawPlatform[keyName][test].keys():
									newTest.update({ 'parser': rawPlatform[keyName][test]['parser'] })
								if (len(test.split(',')) > 1):
									for subTest in test.split(','):
										newTest['executor'] = subTest
										platformData.append(newTest)
								else:
									newTest['executor'] = test
									platformData.append(newTest)
						newAbility = { 'id': rawAbility['id'], 'name': rawAbility['name'],
							'description': rawAbility['description'], 'tactic': rawAbility['tactic'],
							'technique': rawAbility['technique'], 'platforms': platformData }

						stockAbilities.append(newAbility)
		return { 'abilities': stockAbilities }

	@template('abilitymanager.html')
	async def landing(self, request):
		await self.auth_svc.check_permission(request)
		abilities = await self.explode_stockpile()
		tactics = set([a['tactic'].lower() for a in abilities])
		return { 'abilities': json.dumps(abilities), 'tactics': tactics }

	async def rest_api(self, request):
		self.log.debug('Starting Rest call.')
		await self.auth_svc.check_permissions(request)
		data = dict(await request.json())
		index = data.pop('index')
		self.log.debug('Index: {}'.format(index))
		
		options = dict(
			PUT=dict(
			),
			POST=dict(
				ac_ability=lambda d: self.explode_stockpile(**d),
			),
			DELETE=dict(
			)
		)
		try:
			output = await options[request.method][index](data)
		except Exception as e:
			self.log.debug('Stopped at api call.')
			self.log.error(e)
		return web.json_response(output)
