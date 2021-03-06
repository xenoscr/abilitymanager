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
		self.stockPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../stockpile//data/abilities/')

	def get_conf(self):
		confPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../conf/amconf.yml')
		with open(confPath, 'r') as c:
                                conf = yaml.load(c, Loader=yaml.Loader)
		self.ctipath = os.path.expanduser(os.path.join(conf['ctipath'], 'enterprise-attack/'))
		self.log.debug('Getting local configuration from: {}'.format(confPath))
		try:
			with open(confPath, 'r') as c:
				conf = yaml.load(c, Loader=yaml.Loader)
			self.ctipath = os.path.expanduser(os.path.join(conf['ctipath'], 'enterprise-attack/'))
			if 'payloadPath' in conf.keys():
				self.payloadPath = os.path.expander(conf['payloadPath'])
			else:
				self.payloadPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../stockpile/data/payloads/')
			if 'abilityPath' in conf.keys():
				self.abilityPath = os.path.expander(conf['abilityPath'])
			else:
				self.abilityPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../stockpile//data/abilities/')
		except Exception as e:
			self.log.debug('Stopped at api call.')
			self.log.error(e)
			pass

	async def get_uuid(self, data):
		try:
			return str(uuid.uuid4())
		except Exception as e:
			self.log.debug('Error getting UUID.')
			self.log.error('e')
			return 'Failure'

	
	async def getMITRETactics(self):
		tacticList = []
		tactics = {}
		matrix = self.fs.query([
			Filter('type', '=', 'x-mitre-matrix'),
		])

		for i in range(len(matrix)):
			tactics[matrix[i]['name']] = []
			for tactic_id in matrix[i]['tactic_refs']:
				tactics[matrix[i]['name']].append(self.fs.query([Filter('id', '=', tactic_id)])[0])    
		
		for tactic in tactics['Enterprise ATT&CK']:
			tacticList.append(tactic['name'])

		return tacticList

	async def getMITRETechniques(self, data):
		tactic = data['data'].replace(' ', '-').lower()
		techniques = []
		filter = [
			Filter('type', '=', 'attack-pattern'),
			Filter('kill_chain_phases.phase_name', '=', tactic)
		]
		results = self.fs.query(filter)

		# This is used in the official documentation. I'm not sure it is needed.
		doubleCheck = [t for t in results if {
			'kill_chain_name' : 'mitre-attack',
			'phase_name' : tactic,
		} in t.kill_chain_phases]

		for entry in doubleCheck:
			techniques.append({ 'tactic': tactic, 'name': entry['name'], 'id': entry['external_references'][0]['external_id'] })

		return techniques
	
	async def getATTACK(self):
		attackList = []
		tactics = await self.getMITRETactics()

		try:
			for tactic in tactics:
				for technique in await self.getMITRETechniques({ 'data': tactic }):
					attackList.append(technique)

			return attackList
		except Exception as e:
			self.log.debug('Failed to parse tactics')
			self.log.error(e)
			return []

	async def explode_stockpile(self):
		self.log.debug('Starting stockpile ability explosion')
		stockAbilities = []
		self.log.debug('Checking stockpile path: {}'.format(self.stockPath))
		if os.path.exists(self.stockPath):
			for root, dirs, files in os.walk(self.stockPath):
				for procFile in files:
					fullFile = os.path.join(root, procFile)
					if os.path.splitext(fullFile)[-1].lower() == '.yml':
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
								newTest = {'platform': keyName, 'executor': ''}
								parserName = ''
								parserProperty = ''
								parserScript = ''
								if 'command' in rawPlatform[keyName][test].keys():
									newTest.update({ 'command': b64encode(rawPlatform[keyName][test]['command'].encode('utf-8')).decode('utf-8') }) 
								if 'cleanup' in rawPlatform[keyName][test].keys():
									newTest.update({ 'cleanup': b64encode(rawPlatform[keyName][test]['cleanup'].encode('utf-8')).decode('utf-8') })
								if 'payload' in rawPlatform[keyName][test].keys():
									newTest.update({ 'payload': rawPlatform[keyName][test]['payload'] })
								if 'parser' in rawPlatform[keyName][test].keys():
									if rawPlatform[keyName][test]['parser']['name']:
										parserName = rawPlatform[keyName][test]['parser']['name']
									if rawPlatform[keyName][test]['parser']['property']:
										parserProperty = rawPlatform[keyName][test]['parser']['property']
									if rawPlatform[keyName][test]['parser']['script']:
										parserScript = rawPlatform[keyName][test]['parser']['script']
									newTest.update({ 'parser': { 'name': parserName, 'property': parserProperty, 'script': b64encode(parserScript.encode('utf-8')).decode('utf-8') } })
								if (len(test.split(',')) > 1):
									for subTest in test.split(','):
										newTest['executor'] = subTest
										platformData.append(newTest.copy())
								else:
									newTest['executor'] = test
									platformData.append(newTest)
						newAbility = { 'id': rawAbility['id'], 'name': rawAbility['name'],
							'description': rawAbility['description'], 'tactic': rawAbility['tactic'],
							'technique': rawAbility['technique'], 'platforms': platformData, 'path': fullFile }

						stockAbilities.append(newAbility)
		return stockAbilities

	async def delete_ability(self, data):
		pathData = data['data']
		try:
			os.remove(pathData)
			return 'File deleted.'
		except Exception as e:
			self.log.error(e)
			return 'File deletion failed.'
	
	async def save_ability(self, data):
		abilityData = data.pop('data')
		newYaml = []
		newYamlEntry = {}
		newPlatforms = {}
		osList = []

		# Add the YAML presenter
		yaml.add_representer(cmdStr, cmd_presenter)

		# Get the OS names
		for test in abilityData['platforms']:
			osList.append(test['platform'])

		osList = list(set(osList))
		
		try:
			for osSys in osList:
				newPlatforms[osSys] = {}
				for test in abilityData['platforms']: 
					if osSys == test['platform']:
						newTest = {}
						command = b64decode(test['command'])
						command = command.decode('utf-8')
						if command[0] == '\'':
							command = command.strip('\'')
						elif command[0] == '\"':
							command = command.strip('\"')
						command = command.replace('\\n','\n')
						newTest['command'] = cmdStr(command)
						# Check for payload
						if 'payload' in test.keys():
							newTest['payload'] = test['payload']
						if 'cleanup' in test.keys():
							cleanup = b64decode(test['cleanup'])
							cleanup = cleanup.decode('utf-8')
							if cleanup[0] == '\'':
								cleanup = cleanup.strip('\'')
							elif cleanup[0] == '\"':
								cleanup = cleanup.strip('\"')
							cleanup = cleanup.replace('\\n','\n')
							newTest['cleanup'] = cmdStr(cleanup)
						if 'parser' in test.keys():
							newParser = {}
							newParser['name'] = test['parser']['name']
							newParser['property'] = test['parser']['property']
							newParser['script'] = b64decode(test['parser']['script']).decode('utf-8')
							newTest['parser'] = newParser
						newPlatforms[osSys][test['executor']] = newTest
					else:
						pass

			newYamlEntry['id'] = abilityData['id']
			newYamlEntry['name'] = abilityData['name']
			newYamlEntry['description'] = abilityData['description']
			newYamlEntry['tactic'] = abilityData['tactic']
			newYamlEntry['technique'] = abilityData['technique']
			newYamlEntry['platforms'] = newPlatforms
			newYaml.append(newYamlEntry)
		except Exception as e:
			self.log.error(e)
			return 'Failed to parse ability data.'

		#payloadPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../stockpile/data/payloads/')
		#abilityPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../../stockpile//data/abilities/')
		# You can change the output path for testing or to seperate your changes if you like.
		#payloadPath = '/tmp/'
		#abilityPath = '/tmp/'

		# Check and create payloads folder if it does not exist
		try:
			if not os.path.exists(self.payloadPath):
				os.makedirs(self.payloadPath)
		except Exception as e:
			self.log.error(e)
			return False

		# Check and create ability folder if it does not exist
		try:
			if not os.path.exists(os.path.join(self.abilityPath, abilityData['tactic'])):
				os.makedirs(os.path.join(self.abilityPath, abilityData['tactic']))
		except Exception as e:
			self.log.error(e)
			return False

		# Write the YAML file to the correct directory
		try:
			with open(os.path.join(self.abilityPath, abilityData['tactic'], '{}.yml'.format(abilityData['id'])), 'w') as newYAMLFile:
				dump = yaml.dump(newYaml, default_style = None, default_flow_style = False, allow_unicode = True, encoding = None, sort_keys = False)
				newYAMLFile.write(dump)
		except Exception as e:
			self.log.error(e)

		# Delete the original file if necessary
		try:
			if (os.path.dirname(abilityData['path']) != os.path.join(self.abilityPath, abilityData['tactic'])) and (os.path.basename(abilityData['path']) == '{}.yml'.format(abilityData['id'])):
				os.remove(abilityData['path'])
		except Exception as e:
			self.log.error(e)

		return 'Test saved successfully. Click the reload button to reload the list of available abilities.'

	@template('abilitymanager.html')
	async def landing(self, request):
		try:
			fullTactics = []
			attackLit = []
			await self.auth_svc.check_permissions(request)
			abilities = await self.explode_stockpile()
			tactics = set([a['tactic'].lower() for a in abilities])
			fullTactics = await self.getMITRETactics()
			attackList = await self.getATTACK()
			self.log.debug('Landing call completed.')
		except Exception as e:
			self.log.debug('Failed to land.')
			self.log.error(e)
		return { 'abilities': json.dumps(abilities), 'tactics': tactics, 'fulltactics': json.dumps(fullTactics), 'techniques': json.dumps(attackList) }

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
				am_ability=lambda d: self.explode_stockpile(**d),
				am_ability_save=lambda d: self.save_ability(data=d),
				am_ability_delete=lambda d: self.delete_ability(data=d),
				am_get_uuid=lambda d: self.get_uuid(data=d),
				am_get_tactics=lambda d: self.getMITRETactics(),
				am_get_techniques=lambda d: self.getMITRETechniques(data=d),
				am_get_attack=lambda d: self.getATTACK()
			),
			DELETE=dict(
			)
		)
		try:
			output = await options[request.method][index](data)
		except Exception as e:
			self.log.error(e)
		return web.json_response(output)
