/**
 * Javascript for DokuWiki Plugin Wizard
 *
 * @author Michael Klier <chi@chimeric.de>
 */
var plugin_wiz = {
    plugin_name: null,
    ajax__plugin_component_type: null,
    ajax__plugin_layout: null,

    action_plugin_events: 'ACTION_ACT_PREPROCESS,ACTION_EXPORT_POSTPROCESS,ACTION_HEADERS_SEND,AJAX_CALL_UNKNOWN'
                        + ',AUTH_LOGIN_CHECK,AUTH_USER_CHANGE,COMMON_WORDBLOCK_BLOCKED,DOKUWIKI_DONE,DOKUWIKI_STARTED'
                        + ',FEED_ITEM_ADD,FULLTEXT_SNIPPET_CREATE,HTML_CONFLICTFORM_OUTPUT,HTML_DRAFTFORM_OUTPUT,HTML_EDITFORM_OUTPUT'
                        + ',HTML_LOGINFORM_OUTPUT,HTML_PAGE_FROMTEMPLATE,HTML_RECENTFORM_OUTPUT,HTML_REGISTERFORM_OUTPUT'
                        + ',HTML_RESENDPWDFORM_OUTPUT,HTML_REVISIONSFORM_OUTPUT,HTML_UPDATEPROFILEFORM_OUTPUT,HTML_UPLOADFORM_OUTPUT'
                        + ',HTTPCLIENT_REQUEST_SEND,INDEXER_PAGE_ADD,INDEXER_TASKS_RUN,IO_NAMESPACE_CREATED,IO_NAMESPACE_DELETED'
                        + ',IO_WIKIPAGE_READ,IO_WIKIPAGE_WRITE,MAIL_MESSAGE_SEND,MEDIAMANAGER_CONTENT_OUTPUT,MEDIAMANAGER_STARTED'
                        + ',MEDIA_DELETE_FILE,MEDIA_SENDFILE,MEDIA_UPLOAD_FINISH,PARSER_CACHE_USE,PARSER_HANDLER_DONE,PARSER_METADATA_RENDER'
                        + ',PARSER_WIKITEXT_PREPROCESS,PLUGIN_CONFIG_PLUGINLIST,PLUGIN_PLUGINMANAGER_PLUGINLIST,RENDERER_CONTENT_POSTPROCESS'
                        + ',SEARCH_QUERY_FULLPAGE,SEARCH_QUERY_PAGELOOKUP,TOOLBAR_DEFINE,TPL_ACT_UNKNOWN,TPL_CONTENT_DISPLAY'
                        + ',TPL_METAHEADER_OUTPUT,TPL_TOC_RENDER,XMLRPC_CALLBACK_REGISTER',

    init: function() {
        plugin_wiz.ajax__plugin_layout = $('#ajax__plugin_layout');
        plugin_wiz.ajax__plugin_component_type = $('#ajax__plugin_component_type');

        $('input.ajax__edit').blur(function() {
            if($(this).attr('value')) {
                $(this).attr('readonly', 'readonly');
                $(this).addClass('readonly');
                if($(this).hasClass('focus')) {
                    $(this).removeClass('focus');
                }
                if($(this).attr('id') == 'ajax__plugin_name') {
                    plugin_wiz.plugin_name = $(this).attr('value');
                }
            }
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
            if(!plugin_wiz.plugin_name) {
                $('input#ajax__plugin_name').focus();
                $('input#ajax__plugin_name').addClass('focus');
                return;
            }

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

        $('form#ajax__plugin_wiz').submit(function(event) {
            // remove unneed post vars
            alert('validate stuff first');
        });
    },

    html_del_component: function(div) {
        var plugin_type = $('span.plugin_component_type', div).html();
        div.remove();
        // re-add plugin type to type selector if there aren't any more in the current layout
        if($('span.plugin_component_type.' + plugin_type, plugin_wiz.ajax__plugin_layout).length == 0) {
            plugin_wiz.ajax__plugin_component_type.append('<option value="' + plugin_type + '">' + plugin_type + '</option>');
        }
    },

    html_add_component: function(plugin_name, plugin_type) {
        if(!plugin_type) return;

        var id = 'plugin_' + plugin_type + '_' + plugin_name;

        // do we have a plugin with that id already?
        if($('#' + id, plugin_wiz.ajax__plugin_layout).length > 0) {
            if($('input.ajax__plugin_component_name:visible').length == 1) {
                $('input.ajax__plugin_component_name').focus();
                $('input.ajax__plugin_component_name').addClass('focus');
            }
            return false;
        }

        plugin_wiz.ajax__plugin_layout.append('<div id="' + id + '">'
                                            + '<div class="plugin_component">'
                                            + '<span class="plugin_component_type ' + plugin_type + '">' + plugin_type + '</span>'
                                            + '<a href="' + id + '" class="ajax__del_component">del</a>'
                                            + '<span class="plugin_component_name">' + id + ':</span>'
                                            + '</div>');

        var div = $('#' + id);
        var component = $('.plugin_component', div);

        // bind delete function to delete link
        $('a.ajax__del_component', component).click(function(event) {
            event.preventDefault();
            plugin_wiz.html_del_component(div);
        });

        switch(plugin_type) {
            case 'action':
                var input_name  = 'plugin[components][action][' + plugin_name + '][events]';
                component.append('<label for="' + input_name + '">Events:</label>');
                component.append('<input type="text" class="autocomplete" value="" name="' + input_name + '" />');
                data = plugin_wiz.action_plugin_events.split(',');
                $('input.autocomplete', component).autocomplete(data, { 'multiple': true, 'multipleSeparator': ',', 'width': '300' } );
                break;

            case 'syntax':
                var input_name  = 'plugin[components][' + plugin_type + '][' + plugin_name + ']';
                component.append('<label for="' + input_name + '">Events:</label>');
                component.append('<input type="hidden" value="" name="' + input_name + '" />');
                // FIXME other stuff?
                break;

            case 'helper':
            case 'renderer':
            case 'admin':
                var input_name  = 'plugin[components][' + plugin_type + '][' + plugin_name + ']';
                component.append('<label for="' + input_name + '">Events:</label>');
                component.append('<input type="hidden" value="" name="' + input_name + '" />');
                break;
        }

        return true;
    },

};

$(document).ready( function() { plugin_wiz.init() } );

// vim:ts=4:sw=4:et:env=utf-8: