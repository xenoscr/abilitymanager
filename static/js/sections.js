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
	/*let cmd_command, cmd_cleanup, cmd_parser_name, cmd_parser_property, cmd_parser_script = null;
	let psh_command, psh_cleanup, psh_parser_name, psh_parser_property, psh_parser_script = null;
	let pwsh_command, pwsh_cleanup, pwsh_parser_name, pwsh_parser_property, pwsh_parser_script = null;
	let linux_command, linux_cleanup, linux_parser_name, linux_parser_property, linux_parser_script = null;
	let darwin_command, darwin_cleanup, darwin_parser_name, darwin_parser_property, darwin_parser_script = null;

	value.platforms.forEach(function(platform) {
		if (platform['executor'] == 'cmd')
		{
			cmd_platfrom = platform['platform'];
			cmd_command = atob(platform['command']);
			if (platform['cleanup'])
				cmd_cleanup = atob(platform['cleanup']);
			if (platform['parser'])
			{
				cmd_parser_name = platform['parser']['name'];
				cmd_parser_property = platform['parser']['property'];
				cmd_parser_script = atob(platform['parser']['script']);
			}
		}
		if (platform['executor'] == 'psh')
		{
			psh_platform = platform['platform'];
			psh_command = atob(platform['command']);
			if (platform['cleanup'])
				psh_cleanup = atob(platform['cleanup']);
			if (platform['parser'])
			{
				psh_parser_name = platform['parser']['name'];
				psh_parser_property = platform['parser']['property'];
				psh_parser_script = atob(platform['parser']['script']);
			}
		}
		if (platform['executor'] == 'pwsh')
		{
			pwsh_platform = platform['platform'];
			pwsh_command = atob(platform['command']);
			if (platform['cleanup'])
				pwsh_cleanup = atob(platform['cleanup']);
			if (platform['parser'])
			{
				pwsh_parser_name = platform['parser']['name'];
				pwsh_parser_property = platform['parser']['property'];
				pwsh_parser_script = atob(platform['parser']['script']);
			}
		}
		if (platform['executor'] == 'sh')
		{
			sh_platform = platform['platform'];
			sh_command = atob(platform['command']);
			if (platform['cleanup'])
				sh_cleanup = atob(platform['cleanup']);
			if (platform['parser'])
			{
				sh_parser_name = platform['parser']['name'];
				sh_parser_property = platform['parser']['property'];
				sh_parser_script = atob(platform['parser']['script']);
			}
		}
	});*/
    $('#ability-profile').find('#ability-test').append($("<option></option>")
        .attr("name",value['name'])
        .attr("ability_id",value['id'])
        .data("tactic", tactic)
		.data("attack_id", value['technique']['attack_id'])
        .data("attack_name", value['technique']['name'])
        .data("description", value['description'])
		.data("tests", value['platforms'])
        .text(value['name']));
		/*
		.data("cmd_platform", cmd_platform)
        .data("cmd_command", cmd_command)
        .data("cmd_cleanup", cmd_cleanup)
        .data("cmd_parser_name", cmd_parser_name)
        .data("cmd_parser_property", cmd_parser_property)
        .data("cmd_parser_script", cmd_parser_script)
		.data("psh_platform", psh_platform)
        .data("psh_command", psh_command)
        .data("psh_cleanup", psh_cleanup)
        .data("psh_parser_name", psh_parser_name)
        .data("psh_parser_property", psh_parser_property)
        .data("psh_parser_script", psh_parser_script)
		.data("pwsh_platform", pwsh_
        .data("pwsh_command", pwsh_command)
        .data("pwsh_cleanup", pwsh_cleanup)
        .data("pwsh_parser_name", pwsh_parser_name)
        .data("pwsh_parser_property", pwsh_parser_property)
        .data("pwsh_parser_script", pwsh_parser_script)
        .data("linux_command", linux_command)
        .data("linux_cleanup", linux_cleanup)
        .data("linux_parser_name", linux_parser_name)
        .data("linux_parser_property", linux_parser_property)
        .data("linux_parser_script", linux_parser_script)
        .data("darwin_command", darwin_command)
        .data("darwin_cleanup", darwin_cleanup)
        .data("darwin_parser_name", darwin_parser_name)
        .data("darwin_parser_property", darwin_parser_property)
        .data("darwin_parser_script", darwin_parser_script)
		*/
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
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-heading-' + testNum).append($('<td />').attr('class', 'test-title-' + testNum).append($('<H3 />').text('Test ' + testNum + ':'))).append($('<td />').attr('class', 'test-delete-' + testNum).append($('<button />', {id: 'delete-test-' + testNum, type: 'button', class: 'ability-delete-button', onclick: 'deleteTest('+ testNum + ');'}).html('Delete Test')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row1-' + testNum).append($('<td />').attr('class', 'test-platform-name-' + testNum).append($('<p />').text('Platform:'))).append($('<td />').attr('class', 'test-platform-value-' + testNum).append($('<select />').append($('<option />', {value: 'windows', text: 'windows'})).append($('<option />', {value: 'linux', text: 'linux'})).append($('<option />', {value: 'darwin', text: 'darwin'})).val(test.platform).change()));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row2-' + testNum).append($('<td />').attr('class', 'test-executor-name-' + testNum).append($('<p />').text('Executor:'))).append($('<td />').attr('class', 'test-executor-value-' + testNum).append($('<select />').append($('<option />', {value: 'cmd', text: 'cmd'})).append($('<option />', {value: 'psh', text: 'psh'})).append($('<option />', {value: 'pwsh', text: 'pwsh'})).append($('<option />', {value: 'sh', text: 'sh'})).val(test.executor).change()));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row3-' + testNum).append($('<td />').attr('class', 'test-command-name-' + testNum).append($('<p />').text('Command:'))).append($('<td />').attr('class', 'test-command-value-' + testNum).append($('<textarea></textarea>').text(atob(test.command))));
		if (test.cleanup)
			$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row4-' + testNum).append($('<td />').attr('class', 'test-cleanup-name-' + testNum).append($('<p />').text('Clean-Up:'))).append($('<td />').attr('class', 'test-cleanup-value-' + testNum).append($('<textarea></textarea>').text(atob(test.cleanup))));
		else
			$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row4-' + testNum).append($('<td />').attr('class', 'test-cleanup-name-' + testNum).append($('<p />').text('Clean-Up:'))).append($('<td />').attr('class', 'test-cleanup-value-' + testNum).append($('<textarea></textarea>').text('')));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row5-' + testNum).append($('<td />').attr('class', 'test-parser-name-name-' + testNum).append($('<p />').text('Parser Name:'))).append($('<td />').attr('class', 'test-parser-name-value-' + testNum).append($('<select />').append($('<option />', {value: 'line', text: 'line'})).append($('<option />', {value: 'host', text: 'host'})).append($('<option />', {value: 'json', text: 'json'})).append($('<option />', {value: 'regex', text: 'regex'})).val(parserName).change()));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row6-' + testNum).append($('<td />').attr('class', 'test-parser-property-name-' + testNum).append($('<p />').text('Parser Property:'))).append($('<td />').attr('class', 'test-parser-property-value-' + testNum).append($('<input>').val(parserProperty)));
		$('table.ability-tests-table tbody tr:last').after('<tr />').attr('class', 'test-row7-' + testNum).append($('<td />').attr('class', 'test-parser-script-name-' + testNum).append($('<p />').text('Parser script:'))).append($('<td />').attr('class', 'test-parser-script-value-' + testNum).append($('<input>').val(parserScript)));
	
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

function deleteTest(testNum){
	allTests = getAllTests();
	clearTests();
	testCounter = 0;
	
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

	$(chosen).data('tests').forEach(function(test) {
		addTest(testCounter, test);	
		testCounter++;
	});

	// find the test numbers using: $('[class^=test-heading]').each(function() { console.log(this.className[this.className.length -1]) });

/*	
	if ($(chosen).data('cmd_command'))
		$(parent).find('#ability-cmd-command').val($(chosen).data('cmd_command'));
	if ($(chosen).data('cmd_cleanup'))
		$(parent).find('#ability-cmd-cleanup').val($(chosen).data('cmd_cleanup'));
	if ($(chosen).data('cmd_parser_name'))
		$(parent).find('#ability-cmd-parser-name').val($(chosen).data('cmd_parser_name'));
	if ($(chosen).data('cmd_parser_property'))
		$(parent).find('#ability-cmd-parser-property').val($(chosen).data('cmd_parser_property'));
	if ($(chosen).data('cmd_parser_script'))
		$(parent).find('#ability-cmd-parser-script').val($(chosen).data('cmd_parser_script'));
	if ($(chosen).data('psh_command'))
		$(parent).find('#ability-psh-command').html($(chosen).data('psh_command'));
	if ($(chosen).data('psh_cleanup'))
		$(parent).find('#ability-psh-cleanup').html($(chosen).data('psh_cleanup'));
	if ($(chosen).data('psh_parser_name'))
		$(parent).find('#ability-psh-parser-name').val($(chosen).data('psh_parser_name'));
	if ($(chosen).data('psh_parser_property'))
		$(parent).find('#ability-psh-parser-property').val($(chosen).data('psh_parser_property'));
	if ($(chosen).data('psh_parser_script'))
		$(parent).find('#ability-psh-parser-script').val($(chosen).data('psh_parser_script'));
	if ($(chosen).data('pwsh_command'))
		$(parent).find('#ability-pwsh-command').html($(chosen).data('pwsh_command'));
	if ($(chosen).data('pwsh_cleanup'))
		$(parent).find('#ability-pwsh-cleanup').html($(chosen).data('pwsh_cleanup'));
	if ($(chosen).data('pwsh_parser_name'))
		$(parent).find('#ability-pwsh-parser-name').val($(chosen).data('pwsh_parser_name'));
	if ($(chosen).data('pwsh_parser_property'))
		$(parent).find('#ability-pwsh-parser-property').val($(chosen).data('pwsh_parser_property'));
	if ($(chosen).data('pwsh_parser_script'))
		$(parent).find('#ability-pwsh-parser-script').val($(chosen).data('pwsh_parser_script'));
	if ($(chosen).data('linux_command'))
		$(parent).find('#ability-linux-command').html($(chosen).data('linux_command'));
	if ($(chosen).data('linux_cleanup'))
		$(parent).find('#ability-linux-cleanup').html($(chosen).data('linux_cleanup'));
	if ($(chosen).data('linux_parser_name'))
		$(parent).find('#ability-linux-parser-name').val($(chosen).data('linux_parser_name'));
	if ($(chosen).data('linux_parser_property'))
		$(parent).find('#ability-linux-parser-property').val($(chosen).data('linux_parser_property'));
	if ($(chosen).data('linux_parser_script'))
		$(parent).find('#ability-linux-parser-script').val($(chosen).data('linux_parser_script'));
	if ($(chosen).data('darwin_command'))
		$(parent).find('#ability-darwin-command').html($(chosen).data('darwin_command'));
	if ($(chosen).data('darwin_cleanup'))
		$(parent).find('#ability-darwin-cleanup').html($(chosen).data('darwin_cleanup'));
	if ($(chosen).data('darwin_parser_name'))
		$(parent).find('#ability-darwin-parser-name').val($(chosen).data('darwin_parser_name'));
	if ($(chosen).data('darwin_parser_property'))
		$(parent).find('#ability-darwin-parser-property').val($(chosen).data('darwin_parser_property'));
	if ($(chosen).data('darwin_parser_script'))
		$(parent).find('#ability-darwin-parser-script').val($(chosen).data('darwin_parser_script'));
	*/
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

	/*
    $(parent).find('#ability-cmd-command').val('');
    $(parent).find('#ability-cmd-cleanup').val('');
    $(parent).find('#ability-cmd-parser-name').val('');
    $(parent).find('#ability-cmd-parser-property').val('');
    $(parent).find('#ability-cmd-parser-script').val('');
    $(parent).find('#ability-psh-command').html('');
    $(parent).find('#ability-psh-cleanup').html('');
    $(parent).find('#ability-psh-parser-name').val('');
    $(parent).find('#ability-psh-parser-property').val('');
    $(parent).find('#ability-psh-parser-script').val('');
    $(parent).find('#ability-pwsh-command').html('');
    $(parent).find('#ability-pwsh-cleanup').html('');
    $(parent).find('#ability-pwsh-parser-name').val('');
    $(parent).find('#ability-pwsh-parser-property').val('');
    $(parent).find('#ability-pwsh-parser-script').val('');
    $(parent).find('#ability-linux-command').html('');
    $(parent).find('#ability-linux-cleanup').html('');
    $(parent).find('#ability-linux-parser-name').val('');
    $(parent).find('#ability-linux-parser-property').val('');
    $(parent).find('#ability-linux-parser-script').val('');
    $(parent).find('#ability-darwin-command').html('');
    $(parent).find('#ability-darwin-cleanup').html('');
    $(parent).find('#ability-darwin-parser-name').val('');
    $(parent).find('#ability-darwin-parser-property').val('');
    $(parent).find('#ability-darwin-parser-script').val('');
	*/
}

function saveAbility() {
        let parent = $('#ability-profile');

        let abilityValues = {
                'name': $(parent).find('#ability-name').val(),
                'platform': $(parent).find('#ability-platform').val(),
                'executor': $(parent).find('#ability-executor').val(),
                'tactic': $(parent).find('#ability-tactic').val(),
                'technique': $(parent).find('#ability-technique-id').val(),
                'attack_name': $(parent).find('#ability-technique-name').val(),
                'description': $(parent).find('#ability-description').val(),
                'command': btoa($(parent).find('#ability-command').val()),
                'cleanup': btoa($(parent).find('#ability-cleanup').val())
        };
        restRequest('POST', {"index": "ac_ability_save", "key": "ability_id", "value": $(parent).find('#ability-id').val(), "data": abilityValues}, saveAbilityCallback);
}

function saveAbilityCallback(data) {
        $('p.process-status').html('<p>' + data + '</p><center><button id="reloadPage" class="atomic-button">Reload Page</button></center>');
    $('#reloadPage').click(function() {
        location.reload();
        });
}

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
