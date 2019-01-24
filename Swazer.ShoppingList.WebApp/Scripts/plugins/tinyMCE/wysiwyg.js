
(function ($, ko) {
    var binding = {
        'after': ['attr', 'value'],

        'defaults': {
            plugins: [
                "textcolor advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table contextmenu paste"
            ],
            toolbar: 'undo redo | styleselect | bold italic underline | link image imageupload | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |',
            menubar: 'edit insert view format table tools help',

            automatic_uploads: false,
            image_description: false,
            file_browser_callback_types: 'image',
            file_picker_types: 'image',
            images_upload_url: 'postAcceptor.php',
            init_instance_callback: function (ed) {
                ed.execCommand('mceImage');
            },
            paste_data_images: true,
            images_upload_handler: function (blobInfo, success, failure) {
                var b = blobInfo.blob();
                var fr = new FileReader();
                fr.onload = function () {
                    success(fr.result);
                }
                fr.readAsDataURL(b);
            },
            //https://stackoverflow.com/a/37840235
            max_chars: 9999, // max. allowed chars
            tinymce_updateCharCounter: function (el, len) {
                $('#' + el.id).prev().find('.char_count').text(len + '/' + el.settings.max_chars);
            },
            tinymce_getContentLength: function () {
                return tinymce.get(tinymce.activeEditor.id).contentDocument.body.innerText.length;
            },
            setup: function (ed) {
                //https://stackoverflow.com/a/26138411
                ed.on('init', function (args) {
                    var id = ed.id;
                    var height = 300;

                    document.getElementById(id + '_ifr').style.height = height + 'px';
                    //document.getElementById(id + '_tbl').style.height = (height + 30) + 'px';
                });

                var allowedKeys = [8, 37, 38, 39, 40, 46]; // backspace, delete and cursor keys
                ed.on('keydown', function (e) {
                    if (allowedKeys.indexOf(e.keyCode) != -1) return true;
                    if (this.settings.tinymce_getContentLength() + 1 > this.settings.max_chars) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    return true;
                });
                ed.on('keyup', function (e) {
                    this.settings.tinymce_updateCharCounter(this, this.settings.tinymce_getContentLength());
                });
            },
            init_instance_callback: function () { // initialize counter div
                $('#' + this.id).prev().append('<div><span style="margin-top:3px;" class="char_count pull-left flip"></span></div>');
                this.settings.tinymce_updateCharCounter(this, this.settings.tinymce_getContentLength());
            },
            paste_preprocess: function (plugin, args) {
                var editor = tinymce.get(tinymce.activeEditor.id);
                var len = editor.contentDocument.body.innerText.length;
                var text = args.content;
                if (len + text.length > editor.settings.max_chars) {
                    alert('Pasting this exceeds the maximum allowed number of ' + editor.settings.max_chars + ' characters.');
                    args.content = '';
                } else {
                    editor.settings.tinymce_updateCharCounter(editor, len + text.length);
                }
            },
        },

        'extensions': {},

        'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            if (!ko.isWriteableObservable(valueAccessor())) {
                throw 'valueAccessor must be writeable and observable';
            }
            // Get custom configuration object from the 'wysiwygConfig' binding, more settings here... http://www.tinymce.com/wiki.php/Configuration
            var options = allBindings.has('wysiwygConfig') ? allBindings.get('wysiwygConfig') : null,

                // Get any extensions that have been enabled for this instance.
                ext = allBindings.has('wysiwygExtensions') ? allBindings.get('wysiwygExtensions') : [],

                settings = configure(binding['defaults'], ext, options, arguments);

            // Ensure the valueAccessor's value has been applied to the underlying element, before instanciating the tinymce plugin
            $(element).text(valueAccessor()());

            // Defer TinyMCE instantiation
            setTimeout(function () {
                $(element).tinymce(settings);
            }, 0);

            // To prevent a memory leak, ensure that the underlying element's disposal destroys it's associated editor.
            ko.utils['domNodeDisposal'].addDisposeCallback(element, function () {
                $(element).tinymce().remove();
            });

            return { controlsDescendantBindings: true };
        },

        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var tinymce = $(element).tinymce(),
                value = valueAccessor()();
            if (tinymce) {
                if (tinymce.getContent() !== value) {
                    tinymce.setContent(value);
                    tinymce.execCommand('keyup');

                    // reusing the code
                    var def = ko.bindingHandlers.wysiwyg.defaults;
                    var len = def.tinymce_getContentLength();
                    def.tinymce_updateCharCounter(tinymce, len);

                    // working code, but it contains duplicating of the logic
                    //var len = tinymce.contentDocument.body.innerText.length;
                    //$('#' + element.id).prev().find('.char_count').text(len + '/' + ko.bindingHandlers.wysiwyg.defaults.max_chars);
                }
            }
        }

    };

    var configure = function (defaults, extensions, options, args) {
        // Apply global configuration over TinyMCE defaults
        var config = $.extend(true, {}, defaults);
        if (options) {
            // Concatenate element specific configuration
            ko.utils.objectForEach(options, function (property) {
                if (Object.prototype.toString.call(options[property]) === '[object Array]') {
                    if (!config[property]) {
                        config[property] = [];
                    }
                    options[property] = ko.utils.arrayGetDistinctValues(config[property].concat(options[property]));
                }
            });

            $.extend(true, config, options);
        }

        // Ensure paste functionality
        if (!config['plugins']) {
            config['plugins'] = ['paste'];
        } else if ($.inArray('paste', config['plugins']) === -1) {
            config['plugins'].push('paste');
        }

        // Define change handler
        var applyChange = function (editor) {
            // Ensure the valueAccessor state to achieve a realtime responsive UI.
            editor.on('change keyup nodechange', function (e) {
                // Update the valueAccessor
                args[1]()(editor.getContent());

                // Run all applied extensions
                for (var name in extensions) {
                    if (extensions.hasOwnProperty(name)) {
                        binding['extensions'][extensions[name]](editor, e, args[2], args[4]);
                    }
                }
            });
        };

        if (typeof (config['setup']) === 'function') {
            var setup = config['setup'];

            // Concatenate setup functionality with the change handler
            config['setup'] = function (editor) {
                setup(editor);
                applyChange(editor);
            };
        } else {
            // Apply change handler
            config['setup'] = applyChange;
        }

        return config;
    };

    // Export the binding
    ko.bindingHandlers['wysiwyg'] = binding;

})(jQuery, ko);