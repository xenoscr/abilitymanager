$(document).ready(function () {
    $("#ability-property-filter option").val(function(idx, val) {
        $(this).siblings('[value="'+ val +'"]').remove();
    });
    $('#nextAbility').click(function() {
        $('#ability-test option:selected').next().prop("selected", true);
        loadAbility();
    });
    $('#previousAbility').click(function() {
        $('#ability-test option:selected').prev().prop("selected", true);
        loadAbility();
    });
    $('#nextResult').click(function() {
        $('#decisionResult').get(0).value++;
        findResults();
    });
});

// Load the ability when selected from the drop-down menu
async function loadAbility() {
    let parent = $('#ability-profile');
	let testCounter = 0;
    clearAbilityDossier();

    let chosen = $('#ability-test option:selected');
    $(parent).find('#ability-id').text($(chosen).attr('ability_id'));
    $(parent).find('#ability-name').val($(chosen).attr('name'));
	populateAbilityTacticOptions();
    $(parent).find('#ability-tactic').val($(chosen).data('tactic')).change();
	populateAbilityTechniqueOptions();
    $(parent).find('#ability-technique').val($(chosen).data('attack_id') + ' | ' + $(chosen).data('attack_name')).change();
    $(parent).find('#ability-description').val($(chosen).data('description'));

	$('table.ability-tests-table tbody tr:last')
		.after('<tr />')
		.attr('class', 'test-platform-heading')
		.append($('<td />')
			.attr('class', 'test-platform-title')
			.append($('<H2 />').text('Platforms:')))
		.append('<td />')
		.attr('class', 'test-platform-title');
	$('table.ability-tests-table tbody tr.test-platform-title td:last')
		.append($('<span />', { 'onclick': 'addEmptyTest();' })
			.html('+'))
		.attr('align', 'right');
	$(chosen).data('tests').forEach(function(test) {
		addTest(testCounter, test);	
		testCounter++;
	});

}

function createNewAbility() {
	clearAbility();
	getUUID();
	populateAbilityTacticOptions();
	$('table.ability-tests-table tbody tr:last')
		.after('<tr />')
		.attr('class', 'test-platform-heading')
		.append($('<td />')
			.attr('class', 'test-platform-title')
			.append($('<H2 />')
				.text('Platforms:')))
		.append('<td />')
		.attr('class', 'test-platform-title');
	$('table.ability-tests-table tbody tr.test-platform-title td:last')
		.append($('<span />', { 'onclick': 'addEmptyTest();' })
			.html('+'))
		.attr('align', 'right');
};

// API Handlers

function refreshAbilities() {
        $('p.process-status').html('<p>Refreshing abilities...</p>');
        restRequest('PUT', {"index": "am_ability"}, refreshAbilitiesCallback);
}

function refreshAbilitiesCallback(data) {
        alert(data);
        $('p.process-status').html(data);
}

function saveAbility() {
	// Clear the status
	$('p.process-status').html('<p></p>');
	let abilityParent = $('#ability-profile');

	let abilityValues = {};
	let technique = {};

	if (checkTestsValid() && checkDupTestCombo() && checkBasicAbility()){
		technique['attack_id'] = $(abilityParent).find('#ability-technique option:selected').data('attack_id');
		technique['name'] = $(abilityParent).find('#ability-technique option:selected').data('attack_name');

		abilityValues['id'] = $(abilityParent).find('#ability-id').text();
		abilityValues['name'] = $(abilityParent).find('#ability-name').val();
		abilityValues['description'] = $(abilityParent).find('#ability-description').val();
		abilityValues['tactic'] = $(abilityParent).find('#ability-tactic').val();
		abilityValues['technique'] = technique;
		abilityValues['platforms'] = getAllTests();
		restRequest('POST', {"index": "am_ability_save", "data": abilityValues}, saveAbilityCallback);
	}
	else
	{
		alert('Errors were found, please review the status pain for details. To procede, please correct the issue and try again.');
	}
}

function saveAbilityCallback(data) {
	$('p.process-status').html('<p>' + data + '</p><center><button id="reloadPage" class="atomic-button">Reload Page</button></center>');
    $('#reloadPage').click(function() {
		location.reload();
	});
}

function getUUID() {
	restRequest('POST', { "index": "am_get_uuid", "data": {}  }, getUUIDCallback);
}

function getUUIDCallback(data) {
    let parent = $('#ability-profile');
    $(parent).find('#ability-id').text(data);
}

function getMITRETactics() {
	restRequest('POST', { "index": "am_get_tactics", "data": {} }, getMITRETacticsCallback);
}

function getMITRETacticsCallback(data) {
	$('#mitre-tactic-data pre').text(JSON.stringify(data));
}

function getMITRETechniques(tactic) {
	restRequest('POST', { "index": "am_get_techniques", "data": tactic }, getMITRETechniquesCallback);
}

function getMITRETechniquesCallback(data) {
	$('#mitre-technique-data pre').text(JSON.stringify(data));
}

// Populators

function populateTacticAbilities(){
	let exploits = JSON.parse($('#ability-data pre').text());

    let parent = $('#ability-profile');
    clearAbilityDossier();
    $(parent).find('#ability-test').empty().append("<option disabled='disabled' selected>Select ability</option>");

    let tactic = $(parent).find('#ability-tactic-filter').find(":selected").data('tactic');
    exploits.forEach(function(ability) {
        if(tactic == ability.tactic)
            appendAbilityToList(tactic, ability);
    });
    $('#ability-property-filter').css('opacity',0.5);
    $('#ability-tactic-filter').css('opacity',1.0);
}

function populateAbilityTacticOptions() {
	let tactics = JSON.parse($('#mitre-tactic-data pre').text());
	clearAbilityTacticOptions();
	$('#ability-tactic').append($('<option />', { 'value': '', 'disabled': 'true', 'selected': 'true' }).text('N/A'));
	tactics.sort().forEach(function(tactic) {
		$('#ability-tactic').append($('<option />', { 'value': tactic.replace(' ', '-').toLowerCase() }).text(tactic.replace(' ', '-').toLowerCase()));
	});
}

function populateAbilityTechniqueOptions() {
	let techniques = JSON.parse($('#mitre-technique-data pre').text());
	clearAbilityTechniqueOptions();
	$('#ability-technique').append($('<option />', { 'value': '', 'disabled': 'true', 'selected': 'true' }).text('N/A'));
	techniques.sort((a, b) => (a.id > b.id) ? 1 : -1).forEach(function(technique) {
		if (technique.tactic == $('#ability-tactic option:selected').text().replace(' ', '-').toLowerCase()) {
			textVal = technique.id + ' | ' + technique.name;
			$('#ability-technique').append($('<option />', { 'value': textVal }).text(textVal).data('attack_id', technique.id).data('attack_name', technique.name));
		}
	});
}

// Clearers

function clearAbilityDossier(){
    $('#ability-profile .ability-table tr:last td:input,ol').each(function(){
        $(this).val('');
        $(this).empty();
    });
    $('#ability-profile').find('textarea').each(function(){
		$(this).val('');
        $(this).html('');
    });
	clearAbilityTacticOptions();
	clearTests();
}

function clearTests(){
	$('table.ability-tests-table tbody tr').remove();
	$('table.ability-tests-table tbody').append('<tr />');
}

function clearAbilityTacticOptions() {
	$('#ability-tactic').empty();
}

function clearAbilityTechniqueOptions() {
	$('#ability-technique').empty();
}

function clearParser(number){
	$('td.test-parser-name-value-'+number+' select').prop('selectedIndex', -1)
	$('td.test-parser-property-value-'+number+' input').val('');
	$('td.test-parser-script-value-'+number+' input').val('');
}

function clearAbility() {
    let parent = $('#ability-profile');
    clearAbilityDossier();

    $(parent).find('#ability-id').text('');
    $(parent).find('#ability-name').val('');
    $(parent).find('#ability-tactic').val('');
    $(parent).find('#ability-technique-id').val('');
    $(parent).find('#ability-technique').val('');
    $(parent).find('#ability-description').val('');
}

function appendAbilityToList(tactic, value) {
    $('#ability-profile').find('#ability-test').append($("<option></option>")
        .attr("name",value['name'])
        .attr("ability_id",value['id'])
        .data("tactic", tactic)
		.data("attack_id", value['technique']['attack_id'])
        .data("attack_name", value['technique']['name'])
        .data("description", value['description'])
		.data("tests", value['platforms'])
        .text(value['name']));
}

// Test manipulation

function addTest(testNum, test){
		if (test.parser)
		{
			parserName = test.parser.name;
			parserProperty = test.parser.property;
			parserScript = atob(test.parser.script);
		}
		else
		{
			parserName = '';
			parserProperty = '';
			parserScript = '';
		}
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-heading-' + testNum)
			.append($('<td />')
				.attr('class', 'test-title-' + testNum)
				.append($('<H3 />').text('Test ' + testNum + ':')))
			.append($('<td />')
				.attr('class', 'test-delete-' + testNum)
				.attr('align', 'right')
				.append($('<span />', {id: 'delete-test-span', class: 'ability-delete-span', onclick: 'deleteTest('+ testNum + ');'})
					.html('-')));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-sub-header-row')
			.append($('<td />')
				.attr('class', 'test-sub-header'))
			.append($('<td />')
				.attr('style', 'text-align:left')
				.attr('class', 'test-sub-header')
				.append($('<h4>')
					.text('Command Details:')));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-row1-' + testNum)
			.append($('<td />')
				.attr('class', 'test-platform-name-' + testNum)
				.append($('<p />')
					.text('Platform:')))
			.append($('<td />')
				.attr('class', 'test-platform-value-' + testNum)
				.append($('<select />')
					.append($('<option />', {value: 'windows', text: 'windows'}))
				.append($('<option />', {value: 'linux', text: 'linux'}))
				.append($('<option />', {value: 'darwin', text: 'darwin'}))
				.val(test.platform).change()));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-row2-' + testNum)
			.append($('<td />')
				.attr('class', 'test-executor-name-' + testNum)
				.append($('<p />').text('Executor:')))
			.append($('<td />')
				.attr('class', 'test-executor-value-' + testNum)
				.append($('<select />')
					.append($('<option />', {value: 'cmd', text: 'cmd'}))
					.append($('<option />', {value: 'psh', text: 'psh'}))
					.append($('<option />', {value: 'pwsh', text: 'pwsh'}))
					.append($('<option />', {value: 'sh', text: 'sh'}))
					.val(test.executor).change()));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-row3-' + testNum)
			.append($('<td />')
				.attr('class', 'test-command-name-' + testNum)
				.append($('<p />')
					.text('Command:')))
			.append($('<td />')
				.attr('class', 'test-command-value-' + testNum)
				.append($('<textarea></textarea>')
					.text(atob(test.command))));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-sub-header-row')
			.append($('<td />')
				.attr('class', 'test-sub-header'))
			.append($('<td />')
				.attr('style', 'text-align:left')
				.attr('class', 'test-sub-header')
				.append($('<h4>')
					.text('Test Clean-Up:')));
		if (test.cleanup)
			$('table.ability-tests-table tbody tr:last')
				.after('<tr />')
				.attr('class', 'test-row4-' + testNum)
				.append($('<td />')
					.attr('class', 'test-cleanup-name-' + testNum)
					.append($('<p />')
						.text('Clean-Up:')))
				.append($('<td />')
					.attr('class', 'test-cleanup-value-' + testNum)
					.append($('<textarea></textarea>')
						.text(atob(test.cleanup))));
		else
			$('table.ability-tests-table tbody tr:last')
				.after('<tr />')
				.attr('class', 'test-row3-' + testNum)
				.append($('<td />')
					.attr('class', 'test-cleanup-name-' + testNum)
					.append($('<p />')
						.text('Clean-Up:')))
				.append($('<td />')
					.attr('class', 'test-cleanup-value-' + testNum)
					.append($('<textarea></textarea>')
						.text('')));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-sub-header-row')
			.append($('<td />')
				.attr('class', 'test-sub-header'))
			.append($('<td />')
				.attr('style', 'text-align:left')
				.attr('class', 'test-sub-header')
				.append($('<h4>')
					.text('Payload:')));
		if (test.payload)
			$('table.ability-tests-table tbody tr:last')
				.after('<tr />')
				.attr('class', 'test-row5-' + testNum)
				.append($('<td />')
					.attr('class', 'test-payload-name-' + testNum)
					.append($('<p />')
						.text('Payload:')))
				.append($('<td />')
					.attr('class', 'test-payload-value-' + testNum)
					.append($('<input />')
						.val(test.payload)));
		else
			$('table.ability-tests-table tbody tr:last')
				.after('<tr />')
				.attr('class', 'test-row5-' + testNum)
				.append($('<td />')
					.attr('class', 'test-payload-name-' + testNum)
					.append($('<p />').text('Payload:')))
				.append($('<td />')
					.attr('class', 'test-payload-value-' + testNum)
					.append($('<input />')
						.val('')));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-sub-header-row')
			.append($('<td />')
				.attr('class', 'test-sub-header'))
			.append($('<td />')
				.attr('style', 'text-align:left')
				.attr('class', 'test-sub-header')
				.append($('<h4>')
					.text('Parser:'))
				.append($('<button />')
					.attr('type', 'button')
					.attr('class', 'test-parser-delete-button-'+ testNum)
					.attr('onclick', 'clearParser('+ testNum +');')
					.html('Clear Parser')));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-row6-' + testNum)
			.append($('<td />')
				.attr('class', 'test-parser-name-name-' + testNum)
				.append($('<p />')
					.text('Parser Name:')))
			.append($('<td />')
				.attr('class', 'test-parser-name-value-' + testNum)
				.append($('<select />')
					.append($('<option />', {value: 'line', text: 'line'}))
					.append($('<option />', {value: 'host', text: 'host'}))
					.append($('<option />', {value: 'json', text: 'json'}))
					.append($('<option />', {value: 'regex', text: 'regex'}))
				.val(parserName).change()));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-row7-' + testNum)
			.append($('<td />')
				.attr('class', 'test-parser-property-name-' + testNum)
				.append($('<p />')
					.text('Parser Property:')))
			.append($('<td />')
				.attr('class', 'test-parser-property-value-' + testNum)
				.append($('<input>')
					.val(parserProperty)));
		$('table.ability-tests-table tbody tr:last')
			.after('<tr />')
			.attr('class', 'test-row8-' + testNum)
			.append($('<td />')
				.attr('class', 'test-parser-script-name-' + testNum)
				.append($('<p />')
					.text('Parser script:')))
			.append($('<td />')
				.attr('class', 'test-parser-script-value-' + testNum)
				.append($('<input>')
					.val(parserScript)));
	
}

function getAllTests(){
	let testCount = $('[class^=test-heading-]').length;

	let allTests = [];

	for (i = 0; i < testCount; i++)
	{
		curTest = {};
		curParser = {};
		curTest['platform'] = $('td.test-platform-value-'+i+' select option:selected').text();
		curTest['executor'] = $('td.test-executor-value-'+i+' select option:selected').text();
		curTest['command'] = btoa($('td.test-command-value-'+i+' textarea').val());
		if ($('td.test-cleanup-value-'+i+' textarea').text() != '')
			curTest['cleanup'] = btoa($('td.test-cleanup-value-'+i+' textarea').val());
		if ($('td.test-payload-value-'+i+' input').val())
			curTest['payload'] = $('td.test-payload-value-'+i+' input').val();
		if ($('td.test-parser-name-value-'+i+' select option:selected').text() != '')
		{
			curParser['name'] = $('td.test-parser-name-value-'+i+' select option:selected').text();
			curParser['property'] = $('td.test-parser-property-value-'+i+' input').val();
			curParser['script'] = btoa($('td.test-parser-script-value-'+i+' input').val());
			curTest['parser'] = curParser;
		}
		console.log(curTest);
		allTests.push(curTest);
	}
	return allTests;
}

function deleteTest(testNum){
	allTests = getAllTests();
	clearTests();
	testCounter = 0;
	
	$('table.ability-tests-table tbody tr:last')
		.after('<tr />')
		.attr('class', 'test-platform-heading')
		.append($('<td />')
			.attr('class', 'test-platform-title')
			.append($('<H2 />')
				.text('Platforms:')))
		.append('<td />')
		.attr('class', 'test-platform-title');
	$('table.ability-tests-table tbody tr.test-platform-title td:last')
		.append($('<span />', { 'onclick': 'addEmptyTest();' })
			.html('+'))
		.attr('align', 'right');
	for (i = 0; i < allTests.length; i++){
		if (i != testNum)
		{
			addTest(testCounter, allTests[i]);
			testCounter++;
		}
	}
}

function addEmptyTest() {
	curTest = {};
	curParser = {};
	curTest['platform'] = '';
	curTest['executor'] = '';
	curTest['command'] = '';

	let testCount = $('[class^=test-heading-]').length;

	addTest(testCount, curTest);
}

// Validators

function checkDupTestCombo(){ 
	let testCount = $('[class^=test-heading-]').length;

	let testCombos = {};

	for (i = 0; i < testCount; i++)
	{
		curTest = {};
		curTest[$('td.test-platform-value-'+i+' select option:selected').text()] = $('td.test-executor-value-'+i+' select option:selected').text();

		for (let [key, value] of Object.entries(testCombos))
		{
			curTestEntry = Object.entries(curTest)[0];
			if ((key == curTestEntry[0]) && (value == curTestEntry[1]))
			{
				$('p.process-status').append('<p>Two tests contain an identical platform and executor pairing. Only one test per pairing of platform and executor is permitted. Please correct the issue and try again.</p>');
				return false;
			}
		}
		Object.assign(testCombos, curTest);
	}
	return true;
}

function checkTestsValid(){
	let errorCount = 0;
	let testCount = $('[class^=test-heading-]').length;
	if (testCount == 0)
	{
		$('p.process-status').append('<p>No tests were found. You must add at least one test to save the ability.</p>');
		errorCount++;
	}
	for (i = 0; i < testCount; i++)
	{
		// Validate that a platform is selected
		if (typeof $('td.test-platform-value-'+i+' option:selected').val() == 'undefined')
		{
			$('p.process-status').append('<p>Test '+i+'\'s platform selection is blank. Please correct the issue and try again.</p>');
			errorCount++;
		}

		// Validate that an executor is selected
		if (typeof $('td.test-executor-value-'+i+' option:selected').val() == 'undefined')
		{
			$('p.process-status').append('<p>Test '+i+'\'s executor selection is blank. Please correct the issue and try again.</p>');
			errorCount++;
		}

		// Validate that the command exists and is not blank.
		if ($('td.test-command-value-'+i+' textarea').val() == '')
		{
			$('p.process-status').append('<p>Test '+i+'\'s command is blank. Please correct the issue and try again.</p>');
			errorCount++;
		}
		// Validate that parser
		if (typeof $('td.test-parser-name-value-'+i+' option:selected').val() !== 'undefined')
		{
			if (($('td.test-parser-property-value-'+i+' input').val() == '') || ($('td.test-parser-script-value-'+i+' input').val() == ''))
			{
				$('p.process-status').append('<p>Test '+i+'\'s parser settings appear to be blank or invalid. Please correct the issue and try again.</p>');
				errorCount++;
			}
		}
		else
		{
			
			if (($('td.test-parser-property-value-'+i+' input').val() != '') || ($('td.test-parser-script-value-'+i+' input').val() != ''))
			{
				$('p.process-status').append('<p>Test '+i+'\'s parser settings appear to be blank or invalid. Please correct the issue and try again.</p>');
				errorCount++;
			}
		}
	}
	if (errorCount > 0)
	{
		return false;
	}
	else
	{
		return true;
	}
}

function checkBasicAbility(){
	let errorCount = 0;
	// Check the Ability ID, should never fail.
	if ($('#ability-id').text() == '')
	{
		$('p.process-status').append('<p>The ability ID appears to be blank or invalid. Please correct the issue and try again.</p>');
		errorCount++;
	}
	// Check the Tactic
	if (($('#ability-tactic option:selected').text() == '') || ($('#ability-tactic option:selected').val() == ''))
	{
		$('p.process-status').append('<p>The ability tactic appears to be blank or invalid. Please correct the issue and try again.</p>');
		errorCount++;
	}
	// Check the Technique
	if ((typeof $('#ability-technique option:selected').val() == 'undefined') || ($('#ability-technique option:selected').val() == ''))
	{
		$('p.process-status').append('<p>The ability technique appears to be blank or invalid. Please correct the issue and try again.</p>');
		errorCount++;
	}
	// Check the Technique
	if ((typeof $('#ability-technique option:selected').val() == 'undefined') || ($('#ability-technique option:selected').val() == ''))
	{
		$('p.process-status').append('<p>The ability technique appears to be blank or invalid. Please correct the issue and try again.</p>');
		errorCount++;
	}
	// Check the Name
	if ($('#ability-name').val() == '')
	{
		$('p.process-status').append('<p>The ability name appears to be blank or invalid. Please correct the issue and try again.</p>');
		errorCount++;
	}
	// Check the description
	if ($('#ability-description').val() == '')
	{
		$('p.process-status').append('<p>The ability description appears to be blank or invalid. Please correct the issue and try again.</p>');
		errorCount++;
	}
	if (errorCount > 0)
	{
		return false;
	}
	else
	{
		return true;
	}
}
