// Portions of this code were borrowed from MITRE's Caldera chain plugin. All credits to them for anything I have reused.

function addAbilities() {
        $('p.process-status').html('<p>Adding abilities, please wait...</p><p>This does take a while, please be patient.</p>')
        updateNavButtonState('#addAbilities', 'invalid');
        updateNavButtonState('#reloadAbilities', 'invalid');
        updateNavButtonState('#exportOneAbility', 'invalid');
        updateNavButtonState('#exportAllToAbilities', 'invalid');
        updateButtonState('#saveAbility', 'invalid');
        updateButtonState('#saveVariables', 'invalid');
        $('select#ability-tactic-filter').prop("disabled", true);
        $('select#ability-test').prop("disabled", true);
        restRequest('PUT', {"index": "ac_ability"}, addAbilitiesCallback);
}

function addAbilitiesCallback(data) {
        alert(data);
        $('p.process-status').html(data);
        location.reload();
}

function refreshAbilities() {
        $('p.process-status').html('<p>Refreshing abilities...</p>');
        restRequest('PUT', {"index": "am_ability"}, refreshAbilitiesCallback);
}

function refreshAbilitiesCallback(data) {
        alert(data);
        $('p.process-status').html(data);
}

function reloadAbilities() {
        $('p.process-status').html('<p>Clicking "YES" will delete all ability and variable data. <b>WARNING: You will lose all current UUIDs!</b> Are you sure?</p><center><button id="yoloDelete" class="atomic-button" style="background-color:darkred;">YES</button><button id="safeNo" class="atomic-button" style="background-color:green;">NO</button></center>');
        $('#yoloDelete').click(function() {
                $('p.process-status').html('<p>Reloading abilities, please wait...</p><p>This does take a while, please be patient.</p>')
                deleteAll();
        });
        $('#safeNo').click(function() {
                $('p.process-status').html('Reload process cancled.');
        });
}

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

function deleteAll() {
        clearAbility();
        clearVariables();
        updateNavButtonState('#addAbilities', 'invalid');
        updateNavButtonState('#reloadAbilities', 'invalid');
        updateNavButtonState('#exportOneAbility', 'invalid');
        updateNavButtonState('#exportAllToAbilities', 'invalid');
        updateButtonState('#saveAbility', 'invalid');
        updateButtonState('#saveVariables', 'invalid');
        $('select#ability-tactic-filter').prop("disabled", true);
        $('select#ability-test').prop("disabled", true);
        restRequest('DELETE', {"index": "delete_all"}, deleteAllCallback);
}

function deleteAllCallback() {
        $('p.process-status').html('<p>Abilities have been deleted.</p>');
        addAbilities();
        location.reload();
}

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

function clearAbilityDossier(){
    $('#ability-profile .ability-table tr:last td:input,ol').each(function(){
        $(this).val('');
        $(this).empty();
    });
    $('#ability-profile').find('textarea').each(function(){
		$(this).val('');
        $(this).html('');
    });
	clearTests();
}

function clearTests(){
	$('table.ability-tests-table tbody tr').remove();
	$('table.ability-tests-table tbody').append('<tr />');
}

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
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-heading-' + testNum).append($('<td />').attr('class', 'test-title-' + testNum).append($('<H3 />').text('Test ' + testNum + ':'))).append($('<td />').attr('class', 'test-delete-' + testNum).attr('align', 'right').append($('<span />', {id: 'delete-test-span', class: 'ability-delete-span', onclick: 'deleteTest('+ testNum + ');'}).html('-')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-sub-header-row').append($('<td />').attr('class', 'test-sub-header')).append($('<td />').attr('style', 'text-align:left').attr('class', 'test-sub-header').append($('<h4>').text('Command Details:')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row1-' + testNum).append($('<td />').attr('class', 'test-platform-name-' + testNum).append($('<p />').text('Platform:'))).append($('<td />').attr('class', 'test-platform-value-' + testNum).append($('<select />').append($('<option />', {value: 'windows', text: 'windows'})).append($('<option />', {value: 'linux', text: 'linux'})).append($('<option />', {value: 'darwin', text: 'darwin'})).val(test.platform).change()));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row2-' + testNum).append($('<td />').attr('class', 'test-executor-name-' + testNum).append($('<p />').text('Executor:'))).append($('<td />').attr('class', 'test-executor-value-' + testNum).append($('<select />').append($('<option />', {value: 'cmd', text: 'cmd'})).append($('<option />', {value: 'psh', text: 'psh'})).append($('<option />', {value: 'pwsh', text: 'pwsh'})).append($('<option />', {value: 'sh', text: 'sh'})).val(test.executor).change()));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row3-' + testNum).append($('<td />').attr('class', 'test-command-name-' + testNum).append($('<p />').text('Command:'))).append($('<td />').attr('class', 'test-command-value-' + testNum).append($('<textarea></textarea>').text(atob(test.command))));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-sub-header-row').append($('<td />').attr('class', 'test-sub-header')).append($('<td />').attr('style', 'text-align:left').attr('class', 'test-sub-header').append($('<h4>').text('Test Clean-Up:')));
		if (test.cleanup)
			$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row4-' + testNum).append($('<td />').attr('class', 'test-cleanup-name-' + testNum).append($('<p />').text('Clean-Up:'))).append($('<td />').attr('class', 'test-cleanup-value-' + testNum).append($('<textarea></textarea>').text(atob(test.cleanup))));
		else
			$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row4-' + testNum).append($('<td />').attr('class', 'test-cleanup-name-' + testNum).append($('<p />').text('Clean-Up:'))).append($('<td />').attr('class', 'test-cleanup-value-' + testNum).append($('<textarea></textarea>').text('')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-sub-header-row').append($('<td />').attr('class', 'test-sub-header')).append($('<td />').attr('style', 'text-align:left').attr('class', 'test-sub-header').append($('<h4>').text('Payload:')));
		if (test.payload)
			$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row5-' + testNum).append($('<td />').attr('class', 'test-payload-name-' + testNum).append($('<p />').text('Payload:'))).append($('<td />').attr('class', 'test-payload-value-' + testNum).append($('<input />').val(test.payload)));
		else
			$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row5-' + testNum).append($('<td />').attr('class', 'test-payload-name-' + testNum).append($('<p />').text('Payload:'))).append($('<td />').attr('class', 'test-payload-value-' + testNum).append($('<input />').val('')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-sub-header-row').append($('<td />').attr('class', 'test-sub-header')).append($('<td />').attr('style', 'text-align:left').attr('class', 'test-sub-header').append($('<h4>').text('Parser:')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row6-' + testNum).append($('<td />').attr('class', 'test-parser-name-name-' + testNum).append($('<p />').text('Parser Name:'))).append($('<td />').attr('class', 'test-parser-name-value-' + testNum).append($('<select />').append($('<option />', {value: 'line', text: 'line'})).append($('<option />', {value: 'host', text: 'host'})).append($('<option />', {value: 'json', text: 'json'})).append($('<option />', {value: 'regex', text: 'regex'})).val(parserName).change()));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row7-' + testNum).append($('<td />').attr('class', 'test-parser-property-name-' + testNum).append($('<p />').text('Parser Property:'))).append($('<td />').attr('class', 'test-parser-property-value-' + testNum).append($('<input>').val(parserProperty)));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row8-' + testNum).append($('<td />').attr('class', 'test-parser-script-name-' + testNum).append($('<p />').text('Parser script:'))).append($('<td />').attr('class', 'test-parser-script-value-' + testNum).append($('<input>').val(parserScript)));
	
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
		curTest['command'] = btoa($('td.test-command-value-'+i+' textarea').text());
		if ($('td.test-cleanup-value-'+i+' textarea').text() != '')
			curTest['cleanup'] = btoa($('td.test-cleanup-value-'+i+' textarea').text());
		if ($('td.test-payload-value-'+i+' input').val())
			curTest['payload'] = $('td.test-payload-value-'+i+' input').val();
		if ($('td.test-parser-name-value-'+i+' select option:selected').text() != '')
		{
			curParser['name'] = $('td.test-parser-name-value-'+i+' select option:selected').text();
			curParser['property'] = $('td.test-parser-property-value-'+i+' input').val();
			curParser['script'] = btoa($('td.test-parser-script-value-'+i+' input').val());
			curTest['parser'] = curParser;
		}
		allTests.push(curTest);
	}
	return allTests;
}

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
				return false;
			}
		}
		Object.assign(testCombos, curTest);
	}
	return true;
}

function deleteTest(testNum){
	allTests = getAllTests();
	clearTests();
	testCounter = 0;
	
	$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-platform-heading').append($('<td />').attr('class', 'test-platform-title').append($('<H2 />').text('Platforms:'))).append('<td />').attr('class', 'test-platform-title');
	$('table.ability-tests-table tbody tr.test-platform-title td:last').append($('<span />', { 'onclick': 'addEmptyTest();' }).html('+')).attr('align', 'right');
	for (i = 0; i < allTests.length; i++){
		if (i != testNum)
		{
			addTest(testCounter, allTests[i]);
			testCounter++;
		}
	}
}

function loadAbility() {
    let parent = $('#ability-profile');
	let testCounter = 0;
    clearAbilityDossier();

    let chosen = $('#ability-test option:selected');
    $(parent).find('#ability-id').val($(chosen).attr('ability_id'));
    $(parent).find('#ability-name').val($(chosen).attr('name'));
    $(parent).find('#ability-tactic').val($(chosen).data('tactic'));
    $(parent).find('#ability-technique-id').val($(chosen).data('attack_id'));
    $(parent).find('#ability-technique-name').val($(chosen).data('attack_name'));
    $(parent).find('#ability-description').val($(chosen).data('description'));

	$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-platform-heading').append($('<td />').attr('class', 'test-platform-title').append($('<H2 />').text('Platforms:'))).append('<td />').attr('class', 'test-platform-title');
	$('table.ability-tests-table tbody tr.test-platform-title td:last').append($('<span />', { 'onclick': 'addEmptyTest();' }).html('+')).attr('align', 'right');
	$(chosen).data('tests').forEach(function(test) {
		addTest(testCounter, test);	
		testCounter++;
	});

}

function clearAbility() {
    let parent = $('#ability-profile');
    clearAbilityDossier();

    $(parent).find('#ability-id').val('');
    $(parent).find('#ability-name').val('');
    $(parent).find('#ability-tactic').val('');
    $(parent).find('#ability-technique-id').val('');
    $(parent).find('#ability-technique-name').val('');
    $(parent).find('#ability-description').val('');
}

function saveAbility() {
        let abilityParent = $('#ability-profile');

		let abilityValues = {};
		let technique = {};

		if (checkDupTestCombo()){
			technique['attack_id'] = $(abilityParent).find('#ability-technique-id').val();
			technique['name'] = $(abilityParent).find('#ability-technique-name').val();

			abilityValues['id'] = $(abilityParent).find('#ability-id').val();
			abilityValues['name'] = $(abilityParent).find('#ability-name').val();
			abilityValues['description'] = $(abilityParent).find('#ability-description').val();
			abilityValues['tactic'] = $(abilityParent).find('#ability-tactic').val();
			abilityValues['technique'] = technique;
			abilityValues['platforms'] = getAllTests();
			restRequest('POST', {"index": "am_ability_save", "data": abilityValues}, saveAbilityCallback);
		}
		else
		{
			alert('A duplicate OS & Executor combination was detected. Please correct the issue and try again.');
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
    $(parent).find('#ability-id').val(data);
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

function createNewAbility() {
	clearAbility();
	getUUID();
	$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-platform-heading').append($('<td />').attr('class', 'test-platform-title').append($('<H2 />').text('Platforms:'))).append('<td />').attr('class', 'test-platform-title');
	$('table.ability-tests-table tbody tr.test-platform-title td:last').append($('<span />', { 'onclick': 'addEmptyTest();' }).html('+')).attr('align', 'right');
};

function saveVariables() {
        let ability_id = $('#ability-profile').find('#ability-id').val();

        let variables = [];

        $('#variable-table').find('tr.variable').each(function a() {
                variables.push({ 'id': $(this).find('td.name p').data('id'), 'ability_id': ability_id, 'var_name': $(this).find('td.name p').text(), 'value': btoa($(this).find('td.value input').val()) });
        });
        restRequest('POST', {"index": "ac_variables_save", "data": variables}, saveVariablesCallback);
}

function saveVariablesCallback(data) {
        $('p.process-status').html('<p>' + data + '</p><center><button id="reloadPage" class="atomic-button">Reload Page</button></center>');
    $('#reloadPage').click(function() {
        location.reload();
    });
}

function buildRequirements(encodedTest){
    let matchedRequirements = atob(encodedTest).match(/#{([^}]+)}/g);
    if(matchedRequirements) {
        matchedRequirements = matchedRequirements.filter(function(e) { return e !== '#{server}' });
        matchedRequirements = matchedRequirements.filter(function(e) { return e !== '#{group}' });
        matchedRequirements = matchedRequirements.filter(function(e) { return e !== '#{files}' });
        matchedRequirements = [...new Set(matchedRequirements)];
        return matchedRequirements.map(function(val){
           return val.replace(/[#{}]/g, "");
        });
    }
    return [];
}

function exportAllToStockpile() {
        $('p.process-status').html('<p>Exporting all Abilities to Stockpile. Please wait.</p>');
        restRequest('POST', { "index": "ac_export_all", "data": "" }, exportStockpileCallback);
}

function exportOneToStockpile(){
        $('p.process-status').html('<p>Exporting Ability to Stockpile. Please wait.</p>');
        let ability_id = $('#ability-profile').find('#ability-id').val();
        restRequest('POST', { "index": "ac_export_one", "ability_id": ability_id }, exportStockpileCallback);
}

function exportStockpileCallback(data) {
        $('p.process-status').html('<p>' + data + '</p>');
}
