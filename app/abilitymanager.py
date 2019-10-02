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

	@template('abilitymanager.html')
	async def landing(self, request):
		await self.auth_svc.check_permission(request)
		abilities = await self.data_svc.explode_abilities()
		tactics = set([a['tactic'].lower() for a in abilities])
		return { 'abilities': json.dumps(abilities), 'tactics': tactics }


