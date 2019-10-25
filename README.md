# Ability Manager
A plugin for MITRE's Caldera tool to aid in the creation and management of existing abilities.

## Backstory
While working with Caldera (https://github.com/mitre/caldera) I, and my teammate, found it cumbersome to edit and create YAML files manually to use with Caldera. Not only was it more time consuming, it is also more prone to mistakes. After trouble-shooting  20ish YAML files to find the reason why Caldera would not launch based on cryptic error messages returned from PyYAML. I decided to create a tool to solve my problems, an Ability Manager plugin. With this tool, we are able to manage abilities more quickly and with fewer errors. (I still can't spell any better.) While testing this plugin I actually found errors in the demonstration YAML files included with Caldera's Stockpile (https://github.com/mitre/stockpile) plugin.

## Requirements
Python 3.x.x with the following libraries installed:
* PyYAML - https://pyyaml.org/wiki/PyYAML
* STIX2 - https://github.com/oasis-open/cti-python-stix2

## Ability Manager requires the following repositories be stored locally somewhere:
* https://github.com/mitre/cti

## Installation
Clone the repository to MITRE's Caldera "plugins" folder:
```
cd <path to caldera>/plugins
git clone https://github.com/xenoscr/abilitymanager.git
```
Change directories:
```
cd abilitymanager
```
Install the required Python modules:
```
pip install -r requirements.txt
```
Clone the MITRE CTI Repository (If you have not done so already.)
```
git clone https://github.com/mitre/cti.git
```
Edit the conf/amconf.yml file to update the path to point to the MITRE CTI database you cloned.
Edit Caldera's conf/local.yml file and add abilitymanager to the plugins section.

## Usage
### Ability Manager
To use the Ability Manager plugin to manage abilities, first, follow the installation instructions above. After you have successfully completed all of the required steps you should be ready to use Ability Manager to help you manage your Caldera abilities. To access the Ability Manager, start Caldera and click on the Ability Manager menu option in the menu bar at the top of the page. (It may take a moment to load because the Ability Manager is collecting the existing abilities and MITRE ATT&CK data from the CTI database.)

### Editing an Existing Ability
To edit an existing ability:
1. First, select a tactic from the "Select ATT&CK tactic" drop down.
2. Next, select the ability from the "Select ability" drop down.

After you have selected an ability, it should load in the ability manager's main table. Simply make your changes and click the "Save Ability" button when you are finished to save your work. If you do not wish to save your changes, simply select another ability, click the "New Ability, or "Copy Ability" buttons in the menu bar. If you click the "Copy Ability" button, a new UUID will be generated and it will be possible to save your test without damaging the original.

### Creating a New Ability
To create a new ability use the following steps:
1. Click the "New Ability" button.
2. Select a tactic from the "ATT&CK Tactic" drop down.
3. Select a technique from the "ATT&CK Technique" drop down.
4. Enter a name for your test in the "Name" input field.
5. Enter a brief description of the ability in the "Description" input field.
6. Click the green "+" next to "PLATFORMS" to add a blank test.
7. At a minimum, the "PLATFORM", "EXECUTOR", and "COMMAND" fields must be populated. If you wish to implement the other fields, refer to the Caldera Wiki (https://github.com/mitre/caldera/wiki).
8. You can repeat steps 6 & 7 as needed. Remember that you can only have one set of Platform & Executor pairs per ability. For example, if you create a test for Windows & CMD, you cannot create a second Windows & Command test in the same ability.

When you are finished, remember to SAVE your work.
**NOTE** It is possible to remove a test if you no longer need it or added it by mistake. Simply click the red "-" button next to the test you wish to remove. You will need to SAVE for this change to be permanent.

### Copy an Ability
To copy an existing ability use the following steps:
1. Open an existing ability.
2. Click the "Copy Ability" button.

This will generate a new UUID for the test, when you are finished editing or customizing the test, remember to SAVE your work.

## To-Do
This is still a work in progress. If you have improvements or ways to make this better, please feel free to submit a pull request. I will be happy to review your contributions and add them to the project. You are also free to fork and customize the project if you wish.

## Change-Log
### v1.0
Initial version.

## License
See the [LICENSE](https://github.com/xenoscr/abilitymanager/blob/master/LICENSE)

## Credits
* CTI and Caldera are maintained by MITRE: @mitre - https://github.com/mitre
