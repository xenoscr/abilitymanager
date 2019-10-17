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
                populateVariables();
    });
    $('#previousAbility').click(function() {
        $('#ability-test option:selected').prev().prop("selected", true);
        loadAbility();
                populateVariables();
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
        .attr("value",value['name'])
        .attr("ability_id",value['ability_id'])
        .data("tactic", tactic)
        .data("technique", value['technique'])
                .data("attack_name", value['attack_name'])
        .data("name", value['name'])
        .data("description", value['description'])
                .data("platform", value['platform'])
        .data("executor", value['executor'])
        .data("command",value['command'])
        .data("cleanup", value['cleanup'])
        .text(value['name'] +' ('+value['platform']+'/'+value['executor']+')'));
}

function populateVariables() {
        clearVariables();
        let variables = JSON.parse($('#variable-data pre').text());

        let ability_id = $('#ability-profile').find('#ability-id').val();
        let varCount = 0;
        variables.forEach(function(variable) {
                if(ability_id == variable.ability_id)
                {
                        varCount++;
                        $('table.variable-table tbody tr:last').after('<tr></tr>').attr('class', 'variable').append($('<td></td>').attr('class', 'name').append($('<p></p>').data("id", variable.id).text(variable.var_name))).append($('<td></td>').attr('class', 'value').append($('<input></input>').attr('align', 'left').attr('style', 'text-align:left;').val(atob(variable.value))));
                }
        });
        if(varCount == 0)
                updateButtonState('#saveVariables', 'invalid');
        else
                updateButtonState('#saveVariables', 'valid');
}

function clearVariables() {
        $('table.variable-table tbody tr').remove();
        $('table.variable-table tbody').append('<tr></tr>');
}

function clearAbilityDossier(){
    $('#ability-profile .ability-table tr:last td:input,ol').each(function(){
        $(this).val('');
        $(this).empty();
    });
    $('#ability-profile').find('textarea#ability-command').each(function(){
        $(this).html('');
    });
}

function loadAbility() {
    let parent = $('#ability-profile');
    clearAbilityDossier();

    let chosen = $('#ability-test option:selected');
    $(parent).find('#ability-id').val($(chosen).attr('ability_id'));
    $(parent).find('#ability-name').val($(chosen).data('name'));
    $(parent).find('#ability-executor').val($(chosen).data('executor'));
        $(parent).find('#ability-platform').val($(chosen).data('platform'));
    $(parent).find('#ability-tactic').val($(chosen).data('tactic'));
    $(parent).find('#ability-technique-id').val($(chosen).data('technique'));
    $(parent).find('#ability-technique-name').val($(chosen).data('attack_name'));
    $(parent).find('#ability-description').val($(chosen).data('description'));
        if $(chosen).data('cmd-command')
                $(parent).find('#ability-cmd-command').html(atob($(chosen).data('cmd-command')));
        if $(chosen).data('cmd-cleanup')
            $(parent).find('#ability-cmd-cleanup').html(atob($(chosen).data('cmd-cleanup')));
        if $(chosen).data('cmd-parser')
        $(parent).find('#ability-cmd-parser').val(atob($(chosen).data('cmd-parser')));
        if $(chosen).data('psh-command')
        $(parent).find('#ability-psh-command').html(atob($(chosen).data('psh-command')));
        if $(chosen).data('psh-cleanup')
        $(parent).find('#ability-psh-cleanup').html(atob($(chosen).data('psh-cleanup')));
        if $(chosen).data('psh-parser')
        $(parent).find('#ability-psh-parser').val(atob($(chosen).data('psh-parser')));
        if $(chosen).data('pwsh-command')
        $(parent).find('#ability-pwsh-command').html(atob($(chosen).data('pwsh-command')));
        if $(chosen).data('psh-cleanup')
        $(parent).find('#ability-pwsh-cleanup').html(atob($(chosen).data('pwsh-cleanup')));
        if $(chosen).data('pwsh-parser')
        $(parent).find('#ability-pwsh-parser').val(atob($(chosen).data('pwsh-parser')));
        if $(chosen).data('darwin-command')
        $(parent).find('#ability-darwin-command').html(atob($(chosen).data('darwin-command')));
        if $(chosen).data('darwin-cleanup')
        $(parent).find('#ability-darwin-cleanup').html(atob($(chosen).data('darwin-cleanup')));
        if $(chosen).data('darwin-parser')
        $(parent).find('#ability-darwin-parser').val(atob($(chosen).data('darwin-parser')));
        if $(chosen).data('linux-command')
        $(parent).find('#ability-linux-command').html(atob($(chosen).data('linux-command')));
        if $(chosen).data('linux-cleanup')
        $(parent).find('#ability-linux-cleanup').html(atob($(chosen).data('linux-cleanup')));
        if $(chosen).data('linux-parser')
        $(parent).find('#ability-linux-parser').val(atob($(chosen).data('linux-parser')));
}

function clearAbility() {
    let parent = $('#ability-profile');
    clearAbilityDossier();

    $(parent).find('#ability-id').val('');
    $(parent).find('#ability-name').val('');
    $(parent).find('#ability-executor').val('');
        $(parent).find('#ability-platform').val('');
    $(parent).find('#ability-tactic').val('');
    $(parent).find('#ability-technique-id').val('');
    $(parent).find('#ability-technique-name').val('');
    $(parent).find('#ability-description').val('');
    $(parent).find('#ability-cmd-command').html('');
    $(parent).find('#ability-cmd-cleanup').html('');
    $(parent).find('#ability-cmd-parser').val('');
    $(parent).find('#ability-psh-command').html('');
    $(parent).find('#ability-psh-cleanup').html('');
    $(parent).find('#ability-psh-parser').val('');
    $(parent).find('#ability-pwsh-command').html('');
    $(parent).find('#ability-pwsh-cleanup').html('');
    $(parent).find('#ability-pwsh-parser').val('');
    $(parent).find('#ability-darwin-command').html('');
    $(parent).find('#ability-darwin-cleanup').html('');
    $(parent).find('#ability-darwin-parser').val('');
    $(parent).find('#ability-linux-command').html('');
    $(parent).find('#ability-linux-cleanup').html('');
    $(parent).find('#ability-linux-parser').val('');
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
