ko.bindingHandlers.videoDataBinding = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var v = ko.utils.unwrapObservable(valueAccessor());
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var v = ko.utils.unwrapObservable(valueAccessor());
        if (v !== undefined && v !== 0) {
            element.load();
        }
    }
}

ko.bindingHandlers.fileBind = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var access = ko.utils.unwrapObservable(valueAccessor);
        $(element).on('change', function (e) {
            var file = e.target.files[0];
            var reader = new FileReader();

            reader.onloadend = function (onloadend_e) {
                var result = reader.result.split(',')[1]; // base 64 encoded file
                valueAccessor()(result);
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    },
};

ko.bindingHandlers.videoBinding = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var v = ko.utils.unwrapObservable(valueAccessor());
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var v = ko.utils.unwrapObservable(valueAccessor());
        if (v !== undefined && v > 0) {
            element.load();
        }
    }
}

ko.bindingHandlers.googleMap = {
    gMap: null,
    gMarker: null,

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var zoomValue = 16;
        var latLng;
        var newLoc = ko.utils.unwrapObservable(valueAccessor());

        if (newLoc.Lat() !== undefined && newLoc.Lng() !== undefined)
            latLng = new google.maps.LatLng(newLoc.Lat(), newLoc.Lng());
        else
            latLng = new google.maps.LatLng(40.1959278942098, 29.061126888846);

        var map = new google.maps.Map(element, {
            zoom: zoomValue - 5,
            center: latLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        ko.bindingHandlers.googleMap.gMap = map;

        map.addListener('click', function (e) {
            valueAccessor()({
                SkipSetCenter: true,
                Lat: ko.observable(e.latLng.lat()),
                Lng: ko.observable(e.latLng.lng()),
            });
        });

        var input = (document.getElementById('pac-input'));

        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        var infowindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }

            //infowindow.setContent('<div><strong>' + "Location(" + place.geometry.location.lat() + "," + place.geometry.location.lng() + ")" + '</strong><br>');
            //infowindow.open(map, marker);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var newLoc = valueAccessor();

        if (newLoc().Lat() === undefined || newLoc().Lng() === undefined) {
            ko.bindingHandlers.googleMap.gMap.setCenter(new google.maps.LatLng(40.1959278942098, 29.061126888846));

            var marker = ko.bindingHandlers.googleMap.gMarker;
            if (marker != null)
                marker.setMap(null);
        }
        else {
            if (newLoc().SkipSetCenter === undefined)
                ko.bindingHandlers.googleMap.gMap.setCenter(new google.maps.LatLng(newLoc().Lat(), newLoc().Lng()));

            var marker = ko.bindingHandlers.googleMap.gMarker;
            if (marker != null)
                marker.setMap(null);

            ko.bindingHandlers.googleMap.gMarker = new google.maps.Marker({
                position: { lat: newLoc().Lat(), lng: newLoc().Lng() },
                map: ko.bindingHandlers.googleMap.gMap,
            });
        }
        google.maps.event.trigger(ko.bindingHandlers.googleMap.gMap, 'resize');
    }
}

ko.bindingHandlers.cropper = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var $element = $(element);
        var value = ko.unwrap(valueAccessor());
        //var a = 1;
        ko.utils.registerEventHandler(element, "cropend.cropper", function (event) {
            var previewOutputObservable = allBindings.get('previewOutput');
            var valueAccessorFromAllBindings = allBindings.get('cropper');
            var newValue = element
            //var b = 1;
        });
        $element.cropper(value);
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var $element = $(element);
        var value = ko.unwrap(valueAccessor());
        //var c = 1;
    }
};

ko.bindingHandlers.colorPicker = {
    init: function (element, valueAccessor) {
        var clr = ko.utils.unwrapObservable(valueAccessor());

        $(element).colorpicker({
            color: clr,
            format: "hex",
            container: true,
            inline: true
        }).on("changeColor", function (ev) {
            valueAccessor()(ev.color.toHex());
        });
    },
    update: function (element, valueAccessor) {
        var clr = ko.utils.unwrapObservable(valueAccessor());
        $(element).colorpicker('setValue', clr);
    }
}

ko.bindingHandlers.dualList = {
    init: function (element, valueAccessor) {
        $(element).bootstrapDualListbox({
            selectorMinimalHeight: 160
        });

        $(element).on('change', function () {
            var data = ko.utils.unwrapObservable(valueAccessor());
            data.selected($(element).val());
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).bootstrapDualListbox('destroy');
        });
    },
    update: function (element, valueAccessor) {
        // to view if there is an update (without this "update" will not fire)
        var options = ko.utils.unwrapObservable(valueAccessor()).options();
        var selection = valueAccessor().selected();

        $(element).find('option').prop('selected', false);

        if (selection !== null) {
            ko.utils.arrayForEach(selection, function (o) {
                $(element).find('option[value="' + o + '"]').prop('selected', true);
            })
        }

        $(element).bootstrapDualListbox('refresh', true);
    }
}

ko.bindingHandlers.fixNavbar = {
    init: function (element, valueAccessor) {
        var $el = $(element);

        // event handler which update the width of the tabs
        $el.on('columnResizeWidth', function () {
            var new_width = $('#main-container').width();
            $el.width(new_width);
        });

        $(window).resize(function () {
            $el.trigger('columnResizeWidth');
        });


        $(window).scroll(function (event) {
            var st = $(this).scrollTop();
        });

        //var lastScrollTop = 0;
        $(window).on('scroll', function () {
            var tabsHeight = $el.innerHeight();
            var coverHeight = 200;
            var scrlTop = $(window).scrollTop();

            if ($(window).scrollTop() > coverHeight - tabsHeight)
                $el.addClass('navbar-fixed-top fixed-tabs');
            else
                $el.removeClass('navbar-fixed-top fixed-tabs');

            $el.trigger('columnResizeWidth');
        });
    }
}

//http://stackoverflow.com/a/2625240
//http://stackoverflow.com/a/15595893
ko.bindingHandlers.longTab = {
    init: function (element, valueAccessor) {
        var pressTimer;

        $(element).on("longTab", function (event) {
            var callback = valueAccessor(); // getting reference to the function
            callback();                     // calling the function
        });

        $(element).on('mouseup touchend', function () {
            clearTimeout(pressTimer);   // clear timeout

            // returning true is very important to allow the scrolling in the cart
            // and to allow the click binding to work.
            return true;
        });

        $(element).on('mousedown touchstart', function (e) {
            pressTimer = window.setTimeout(function () {
                $(element).trigger("longTab");
            }, 1000);

            // returning true is very important to allow the scrolling in the cart
            // and to allow the click binding to work.
            return true;
        });
    }
}

//http://knockoutjs.com/examples/animatedTransitions.html
ko.bindingHandlers.fadeVisible = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value));
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};

ko.bindingHandlers.animatedPulse = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        var $el = $(element);
        $el.removeClass().addClass('animated pulse').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $el.removeClass();
        });
    }
};

ko.bindingHandlers.ionRange = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var allBindings = allBindingsAccessor();
        var from = ko.utils.unwrapObservable(valueAccessor().from);
        var to = ko.utils.unwrapObservable(valueAccessor().to);

        var ionRangeOptions = allBindingsAccessor().ionRangeOptions || {};
        var defaults = ko.bindingHandlers.ionRange.defaults;

        var options = {};

        ko.utils.extend(options, ko.bindingHandlers.ionRange.defaults);
        ko.utils.extend(options, ionRangeOptions);

        ko.bindingHandlers.ionRange.addFromAndTo(options, from, to);

        options.onChange = function (obj) {
            var obsFrom = valueAccessor().from;
            var obsTo = valueAccessor().to;

            obsFrom(obj.from);
            obsTo(obj.to);
        }

        $(element).ionRangeSlider(options);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).data("ionRangeSlider").destroy();
        });
    },
    update: function (element, valueAccessor) {
        var from = ko.utils.unwrapObservable(valueAccessor().from);
        var to = ko.utils.unwrapObservable(valueAccessor().to);

        var slider = $(element).data("ionRangeSlider");
        slider.update({
            from: from,
            to: to
        });
    },
    addFromAndTo: function (options, from, to) {
        options.from = from;
        options.to = top;
    },
    defaults: {
        type: "double",
        min: 0,
        max: 23,

        step: 1,
        grid: true,
        grid_num: 24,
        disable: false,
    }
}

//http://stackoverflow.com/a/22707080/4390133
ko.bindingHandlers.modal = {
    init: function (element, valueAccessor) {
        $(element).modal({
            show: false
        });

        var value = valueAccessor();
        if (typeof value === 'function') {
            $(element).on('hide.bs.modal', function () {
                value(false);
            });
        }
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if (ko.utils.unwrapObservable(value)) {
            $(element).modal('show');
        } else {
            $(element).modal('hide');
        }
    }
}

//http://stackoverflow.com/a/42454040
ko.bindingHandlers.select2 = {
    after: ["options", "value", "selectedOptions"],
    init: function (el, valueAccessor, allBindingsAccessor, viewModel) {
        ko.utils.domNodeDisposal.addDisposeCallback(el, function () {
            $(el).select2('destroy');
        });
        var allBindings = allBindingsAccessor(),
            select2 = ko.utils.unwrapObservable(allBindings.select2);
        if (select2.url !== undefined && select2.paramName !== undefined) {
            select2.ajax = ko.bindingHandlers.select2.getAjax(select2.url, select2.paramName);
        }
        $(el).select2(select2);
    },
    update: function (el, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        if ("value" in allBindings) {
            if ((allBindings.select2.multiple || el.multiple) && allBindings.value().constructor != Array) {
                $(el).val(allBindings.value().split(',')).trigger('change');
            }
            else {
                ko.utils.unwrapObservable(allBindings.value);
                //$(el).trigger('change');
            }
        } else if ("selectedOptions" in allBindings) {
            var converted = [];
            var textAccessor = function (value) { return value; };
            if ("optionsText" in allBindings) {
                textAccessor = function (value) {
                    var valueAccessor = function (item) { return item; }
                    if ("optionsValue" in allBindings) {
                        valueAccessor = function (item) { return item[allBindings.optionsValue]; }
                    }
                    var items = $.grep(allBindings.options(), function (e) { return valueAccessor(e) == value });
                    if (items.length == 0 || items.length > 1) {
                        return "UNKNOWN";
                    }
                    return items[0][allBindings.optionsText];
                }
            }

            $(el).val(allBindings.selectedOptions());
        }
        $(el).trigger("change");
    },
    getAjax: function (url, paramName) {
        return {
            url: function (params) {
                var term = params.term;

                var queryString = '';
                if (term != undefined)
                    queryString = '?' + paramName + '=' + term;

                return url + queryString;
            },
            dataType: 'json',
            data: function (params) {
                return {
                    q: params.term, // search term
                    page: params.page
                };
            },
            delay: 250,
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data,
                    pagination: {
                        more: (params.page * 30) < data.total_count
                    }
                };
            },
            cache: true
        };
    }
};

ko.bindingHandlers.visibleFlex = {
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            element.style.display = "flex";
        else if ((!value) && isCurrentlyVisible)
            element.style.display = "none";
    }
};

ko.bindingHandlers.nestable = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var local = {};
        var options = {};

        ko.utils.extend(options, ko.bindingHandlers.nestable.options);
        ko.utils.extend(options, local);

        $(element).nestable(options);

        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();

            var submittedData = $(element).nestable('serialize');
            for (var i = 0; i < submittedData.length; i++) {
                delete submittedData[i].bind;
                submittedData[i].order = i;
            }

            observable(submittedData);
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).nestable("destroy");
        });
    },
    options: {
        maxDepth: 1,
        group: 'operations'
    }
}



ko.bindingHandlers.iCheckBox = {
    init: (el, valueAccessor) => {
        var observable = valueAccessor();
        $(el).iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green',
        });

        $(el).on("ifChanged", function () {
            var observable = valueAccessor();
            observable($(el)[0].checked);
        });

        ko.utils.domNodeDisposal.addDisposeCallback(el, function () {
            $(el).iCheck('destroy');
        });
    },
    update: (el, valueAccessor) => {
        var val = ko.utils.unwrapObservable(valueAccessor());
        if (val === true) {
            $(el).iCheck('check');
        } else {
            $(el).iCheck('uncheck');
        }
    }
};

ko.bindingHandlers.slimScroll = {
    init: function (element, valueAccessor) {
        var local = ko.utils.unwrapObservable(valueAccessor());
        var options = {};

        ko.utils.extend(options, ko.bindingHandlers.slimScroll.options);
        ko.utils.extend(options, local);

        $(element).css('max-height', options.maxHeight)
        $(element).slimscroll(options);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).slimScroll({ destroy: true });
        });
    },
    options: {
        height: '',
        allowPageScroll: true
    }
}

ko.bindingHandlers.tooltip = {
    init: function (element, valueAccessor) {
        var local = ko.utils.unwrapObservable(valueAccessor());
        var options = {};

        ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
        ko.utils.extend(options, local);

        $(element).tooltip(options);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).tooltip("destroy");
        });
    },
    update: function (element, valueAccessor) {
        var local = ko.utils.unwrapObservable(valueAccessor());
        var options = {};

        ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
        ko.utils.extend(options, local);

        if (options.valid)
            $(element).data("bs.tooltip").options.title = options.title;
        else
            $(element).data("bs.tooltip").options.title = options.alternativeTitle;
    },
    options: {
        placement: "top",
        trigger: "hover"
    }
};

ko.bindingHandlers.scrollDetails = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // flag for prevent the scrolling for the first time of the binding.
        // I mean when we selecting the first element of the list by default
        this.isFirstTime = true;
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());

        if (this.isFirstTime === true) {
            this.isFirstTime = false;
            return;
        }

        var period = 1000;

        if (viewModel.Mode() !== viewModel.DisplayMode)
            return;

        $('html, body').animate({ scrollTop: $(element).offset().top }, period);
    }
};

ko.bindingHandlers.scrollCreate = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // flag for prevent the scrolling for the first time of the binding.
        // I mean when we selecting the first element of the list by default
        this.isFirstTime = true;
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());
        if (this.isFirstTime === true) {
            this.isFirstTime = false;
            return;
        }
        var period = 1000;

        if (viewModel.Mode() !== viewModel.CreateMode && viewModel.Mode() !== viewModel.EditMode)
            return;

        $('html, body').animate({ scrollTop: $(element).offset().top }, period);
    }
};

ko.bindingHandlers.touchSpinTest = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor(),
            value = ko.utils.unwrapObservable(valueAccessor()),
            touchSpinOptions = allBindings.touchSpinOptions || {},
            minLimit = ko.utils.unwrapObservable(allBindings.touchSpinMin) || 0,
            maxLimit = ko.utils.unwrapObservable(allBindings.touchSpinMax) || 0,
            defaults = ko.bindingHandlers.touchSpin.defaults,
            $element = $(element);

        var options = $.extend(false, { initval: value }, defaults, touchSpinOptions);

        ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        $element.TouchSpin(options);
        ko.bindingHandlers.touchSpin.updateEnableState(element, allBindings);
        ko.bindingHandlers.touchSpin.disableUpDownButtonsFocusOnTabPressed();
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var allBindings = allBindingsAccessor();
        ko.bindingHandlers.value.update(element, valueAccessor);
        ko.bindingHandlers.touchSpin.updateEnableState(element, allBindings);
    },
    updateEnableState: function (element, allBindings) {
        var $element = $(element),
            $plus = $element.parent().find(".bootstrap-touchspin-up"),
            $minus = $element.parent().find(".bootstrap-touchspin-down");

        if (allBindings.enable !== undefined) {
            if (ko.utils.unwrapObservable(allBindings.enable) === true) {
                $plus.removeAttr('disabled');
                $minus.removeAttr('disabled');
            } else {
                $plus.attr('disabled', 'disabled');
                $minus.attr('disabled', 'disabled');
            }
        }

        if (allBindings.disable !== undefined) {
            if (ko.utils.unwrapObservable(allBindings.disable) === false) {
                $plus.removeAttr('disabled');
                $minus.removeAttr('disabled');
            } else {
                $plus.attr('disabled', 'disabled');
                $minus.attr('disabled', 'disabled');
            }
        }
    },
    disableUpDownButtonsFocusOnTabPressed: function () {
        $(".bootstrap-touchspin-up ,.bootstrap-touchspin-down").each(function (index, btn) {
            $(btn).attr("tabIndex", "-1");
        });
    },
    defaults: {
        min: 0,
        max: 1000000000,
        initval: "",
        step: 0.01,
        decimals: 2,
        stepinterval: 100,
        forcestepdivisibility: 'round',  // none | floor | round | ceil
        stepintervaldelay: 500,
        prefix: "",
        postfix: "",
        prefix_extraclass: "",
        postfix_extraclass: "",
        booster: true,
        boostat: 10,
        maxboostedstep: false,
        mousewheel: false,
        buttondown_class: "btn btn-default",
        buttonup_class: "btn btn-default",
        verticalbuttons: true
    }
};

ko.bindingHandlers.touchSpin = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor(),
            value = ko.utils.unwrapObservable(valueAccessor()),
            touchSpinOptions = allBindings.touchSpinOptions || {},
            defaults = ko.bindingHandlers.touchSpin.defaults,
            $element = $(element);

        var options = $.extend(false, { initval: value }, defaults, touchSpinOptions);

        ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        $element.TouchSpin(options);
        ko.bindingHandlers.touchSpin.updateEnableState(element, allBindings);
        ko.bindingHandlers.touchSpin.disableUpDownButtonsFocusOnTabPressed();
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var allBindings = allBindingsAccessor();
        ko.bindingHandlers.value.update(element, valueAccessor);
        ko.bindingHandlers.touchSpin.updateEnableState(element, allBindings);
    },
    updateEnableState: function (element, allBindings) {
        var $element = $(element),
            $plus = $element.parent().find(".bootstrap-touchspin-up"),
            $minus = $element.parent().find(".bootstrap-touchspin-down");

        if (allBindings.enable !== undefined) {
            if (ko.utils.unwrapObservable(allBindings.enable) === true) {
                $plus.removeAttr('disabled');
                $minus.removeAttr('disabled');
            } else {
                $plus.attr('disabled', 'disabled');
                $minus.attr('disabled', 'disabled');
            }
        }

        if (allBindings.disable !== undefined) {
            if (ko.utils.unwrapObservable(allBindings.disable) === false) {
                $plus.removeAttr('disabled');
                $minus.removeAttr('disabled');
            } else {
                $plus.attr('disabled', 'disabled');
                $minus.attr('disabled', 'disabled');
            }
        }
    },
    disableUpDownButtonsFocusOnTabPressed: function () {
        $(".bootstrap-touchspin-up ,.bootstrap-touchspin-down").each(function (index, btn) {
            $(btn).attr("tabIndex", "-1");
        });
    },
    defaults: {
        min: 0,
        max: 1000000000,
        initval: "",
        step: 0.01,
        decimals: 2,
        stepinterval: 100,
        forcestepdivisibility: 'round',  // none | floor | round | ceil
        stepintervaldelay: 500,
        prefix: "",
        postfix: "",
        prefix_extraclass: "",
        postfix_extraclass: "",
        booster: true,
        boostat: 10,
        maxboostedstep: false,
        mousewheel: false,
        buttondown_class: "btn btn-default",
        buttonup_class: "btn btn-default",
        verticalbuttons: true
    }
};

ko.bindingHandlers.datetimePicker = {
    init: function (element, valueAccessor) {
        var options = ko.bindingHandlers.datetimePicker.fix(valueAccessor().options);

        $(element).datetimepicker(options);

        $(element).on("dp.change", function (e) {
            var date = (e.date === false) ? undefined : moment(e.date);
            var prop = valueAccessor().value;
            if (ko.isObservable(prop) === true)
                prop(date);
            else
                prop = date;
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).data("DateTimePicker").destroy();
        });
    },
    update: function (element, valueAccessor) {
        var el = $(element).data("DateTimePicker");

        var value = valueAccessor().value;
        var v = (ko.isObservable(value) === true) ? value() : value;

        if (v === undefined || v.isValid() === false) {
            el.date(null);
            return;
        }

        var result = (!v) ? null : moment(v);
        el.date(result);

        if (result !== null) {
            var options = ko.bindingHandlers.datetimePicker.fix(valueAccessor().options);

            el.options(options);
        }
    },
    fix: function (local) {
        if (!local)
            return ko.bindingHandlers.datetimePicker.options;

        if (local.showClear)
            local.showClear = ko.utils.unwrapObservable(local.showClear);

        if (local.showTodayButton)
            local.showTodayButton = ko.utils.unwrapObservable(local.showTodayButton);

        if (local.showClose)
            local.showClose = ko.utils.unwrapObservable(local.showClose);

        if (local.format)
            local.format = ko.utils.unwrapObservable(local.format);

        if (local.locale)
            local.locale = ko.utils.unwrapObservable(local.locale);

        var options = {};

        ko.utils.extend(options, ko.bindingHandlers.datetimePicker.options);
        ko.utils.extend(options, local);

        return options;
    },
    options: {
        format: 'MM/DD/YYYY',
        //icons: icons,
        locale: 'en-US',
        //tooltips: {
        //    today: today,
        //    clear: clear,
        //    close: close,
        //    selectMonth: selectMonth,
        //    prevMonth: prevMonth,
        //    nextMonth: nextMonth,
        //    selectYear: selectYear,
        //    prevYear: prevYear,
        //    nextYear: nextYear,
        //    selectDecade: selectDecade,
        //    prevDecade: prevDecade,
        //    nextDecade: nextDecade,
        //    prevCentury: prevCentury,
        //    nextCentury: nextCentury
        //},
        //minDate: moment(new Date()),
        showTodayButton: true,
        showClear: true,
        showClose: true,
    }
}
