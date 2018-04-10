/**
 * Javascript for DokuWiki Plugin Wizard
 *
 * @author Michael Klier <chi@chimeric.de>
 */
var plugin_wiz = {
    plugin_name: null,
    ajax__plugin_component_type: null,
    ajax__plugin_layout: null,

    init: function() {
        plugin_wiz.ajax__plugin_layout = $('#ajax__plugin_layout');
        plugin_wiz.ajax__plugin_component_type = $('#ajax__plugin_component_type');

        $('input.edit').blur(function() {
                $(this).removeClass('focus');
        });

        $('input#ajax__is_plugin_component').change(function() {
            if($('input.ajax__plugin_component_name:visible').length == 1) {
                $('input.ajax__plugin_component_name').hide();
                $('label.ajax__plugin_component_name').hide();
                $('input.ajax__plugin_component_name').attr('value', '');
                $('input.ajax__plugin_component_name').attr('readonly', '');
                $('input.ajax__plugin_component_name').removeClass('readonly');
            } else {
                $('.ajax__plugin_component_name').show();
            }
        });

        $('input#ajax__btn_add_plugin_component').click(function() {
            // check if the plugin name is set
            if(!plugin_wiz.validate_pluginname()) return;

            var plugin_type = $('option:selected', plugin_wiz.ajax__plugin_component_type).attr('value');

            if($('input.ajax__plugin_component_name:visible').length == 1) {
                if(!$('input.ajax__plugin_component_name').attr('value')) {
                    $('input.ajax__plugin_component_name').focus();
                    $('input.ajax__plugin_component_name').addClass('focus');
                } else {
                    // add component
                    var plugin_component_name = plugin_wiz.plugin_name + '_' + $('input.ajax__plugin_component_name').attr('value');
                    if(plugin_wiz.html_add_component(plugin_component_name, plugin_type)) {
                        $('input.ajax__plugin_component_name').removeClass('focus');
                        $('input.ajax__plugin_component_name').attr('value', '');
                    }
                }
            } else {
                // check if we have components of that type already
                if($('span.plugin_component_type.' + plugin_type, plugin_wiz.ajax__plugin_layout).length == 0) {
                    plugin_wiz.html_add_component(plugin_wiz.plugin_name, plugin_type);
                    $('option[value=' + plugin_type + ']', plugin_wiz.ajax__plugin_component_type).remove();
                } else {
                    alert('Sorry, you have a ' + plugin_type + ' component already! You can add another component if you want!');
                }
            }
        });


        /**
         * Validate input before submit
         */
        $('form#ajax__plugin_wiz').submit(function(event) {
            var okay = true;

            $('input.validate_string').each(function(i){
                $(this).val($.trim($(this).val()));
                if($(this).val() == ''){
                    $(this).addClass('focus');
                    okay = false;
                }
            });

            $('input.validate_url').each(function(i){
                $(this).val($.trim($(this).val()));
                if(!$(this).val().match(/^https?:\/\//i)){
                    $(this).addClass('focus');
                    okay = false;
                }
            });

            $('input.validate_date').each(function(i){
                $(this).val($.trim($(this).val()));
                if(!$(this).val().match(/^\d\d\d\d-\d\d-\d\d$/)){
                    $(this).addClass('focus');
                    okay = false;
                }
            });

            if(!$('div.plugin_component').length){
                alert('Doh! Your plugin needs to have at least one component');
                event.preventDefault();
            }else{
                if(!okay){
                    alert('Please make sure all fields are filled correctly');
                    event.preventDefault();
                }
            }
        });
    },

    validate_pluginname: function() {
        var Jfield = $('#ajax__plugin_name');
        Jfield.val($.trim(Jfield.val()));
        if(!Jfield.val().match(/^[a-z][a-z0-9]*$/)){
            // not a valid name, continue editing
            Jfield.focus();
            Jfield.addClass('focus');
            plugin_wiz.plugin_name = '';
            return false;
        }else{
            // valid name, make readonly
            Jfield.removeClass('focus');
            Jfield.addClass('readonly');
            Jfield.attr('readonly', 'readonly');
            plugin_wiz.plugin_name = Jfield.val();
            return true;
        }
    },

    html_del_component: function(div) {
        var plugin_type = $('span.plugin_component_type', div).html();
        div.remove();
        // re-add plugin type to type selector if there aren't any more in the current layout
        if($('span.plugin_component_type.' + plugin_type, plugin_wiz.ajax__plugin_layout).length == 0) {
            plugin_wiz.ajax__plugin_component_type.append('<option value="' + plugin_type + '">' + plugin_type + '</option>');
        }

        // re-enable plugin name if no more components
        if(!$('div.plugin_component').length){
            $('#ajax__plugin_name').removeClass('readonly');
            $('#ajax__plugin_name').removeAttr('readonly');
        }
    },

    html_add_component: function(plugin_name, plugin_type) {
        if(!plugin_type) return;

        var id = plugin_type + '_plugin_' + plugin_name;

        // do we have a plugin with that id already?
        if($('#' + id, plugin_wiz.ajax__plugin_layout).length > 0) {
            if($('input.ajax__plugin_component_name:visible').length == 1) {
                $('input.ajax__plugin_component_name').focus();
                $('input.ajax__plugin_component_name').addClass('focus');
            }
            return false;
        }

        plugin_wiz.ajax__plugin_layout.append('<div id="' + id + '" class="plugin_component">'
                                            + '<span class="plugin_component_type ' + plugin_type + '">' + plugin_type + '</span>'
                                            + '<a href="' + id + '" class="ajax__del_component">del</a>'
                                            + '<span class="plugin_component_name">' + id + ':</span>'
                                            + '</div>');

        var div = $('#' + id);

        // bind delete function to delete link
        $('a.ajax__del_component', div).click(function(event) {
            event.preventDefault();
            plugin_wiz.html_del_component(div);
        });

        switch(plugin_type) {
            case 'action':
                var input_name  = 'plugin[components][action][' + plugin_name + '][events]';
                div.append('<label for="' + input_name + '">Events:</label>');
                div.append('<input type="text" class="autocomplete edit validate_string" value="" name="' + input_name + '" />');

                $('input.autocomplete', div).autocomplete(ACTION_EVENTS, { 'multiple': true, 'multipleSeparator': ',', 'width': '300' } );

                $('input.autocomplete').blur(function() {
                        $(this).removeClass('focus');
                });
                break;

            case 'renderer':
                var input_name  = 'plugin[components][renderer][' + plugin_name + '][inherits]';
                div.append('<label for="' + input_name + '">Inherit from:</label>');
                div.append('<select name="' + input_name + '">'+
                           '  <option value="Doku_Renderer_xhtml">Doku_Renderer_xhtml</option>'+
                           '  <option value="Doku_Renderer">Doku_Renderer</option>'+
                           '</select>');
                break;
            default:
                var input_name  = 'plugin[components][' + plugin_type + '][' + plugin_name + ']';
                div.append('<input type="hidden" value="" name="' + input_name + '" />');
                break;
        }

        return true;
    }

};

$(document).ready( function() { plugin_wiz.init() } );

// vim:ts=4:sw=4:et:
