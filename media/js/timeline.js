$(document).ready(function() {

    // add links to timeline actions
    $('.timeline_update').each(function(){
        var _this = this;
        actions = eval($(this).find('.timeline_actions_json').text());
        $.each(actions, function() {
            var label = this[0];
            var url = this[1];
            $(_this).find('.timeline_update_actions').append('<a class="btn btn-default btn-sm" href="' + url +'">' + label + '</a>');
        });
    });
});