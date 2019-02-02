function forceJustNumber(observable) {
    if (observable() !== undefined)
        if (observable().match(/\D/g))
            observable(observable().replace(/\D/g, ''));
}

function forceJustMobile(observable) {
    if (observable() !== undefined)
        if (observable().match(/\D/g))
            observable(observable().replace(/\D/g, ''));
}

function forceJustContact(observable, contactType) {
    if (contactType() === undefined)
        return observable();

    if (!(contactType().EnglishName === "Web Site" || contactType().EnglishName === "Email")) {
        if (observable().match(/\D/g))
            observable(observable().replace(/\D/g, ''));
    }
}


function fix(prop) {
    if (ko.isObservable(prop) && typeof (prop.valueHasMutated) === 'function') {
        prop.valueHasMutated();
        prop.isModified(false);
    }
}

function isXS() {
    return isBreakpoint("xs");
}
function isSM() {
    return isBreakpoint("sm");
}
function isMD() {
    return isBreakpoint("md");
}
function isLG() {
    return isBreakpoint("lg");
}

// determine if the bootstrap has reached its specific breakpoints or not
// this function depend completely on some html which exists in the main Layout.
// the html section in the layout is like this
/* 
<div class="device-xs visible-xs"></div>
<div class="device-sm visible-sm"></div>
<div class="device-md visible-md"></div>
<div class="device-lg visible-lg"></div>
*/
function isBreakpoint(alias) {
    return $('.device-' + alias).is(':visible');
}

ko.validation.rules['oneLangAtLeast'] = {
    validator: function (both) {
        var f = both.a();
        var s = both.b();
        return !(f === false && s === false);
    },
    message: 'At least one language must be supported'
}

function isValidEmail(val) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val);
}

ko.validation.rules['contactVal'] = {
    validator: function (val, type) {
        if (type === undefined)
            return false;

        if (type.ContactType === 0) // phone
            return /^(\d{10})$/.test(val);
        else if (type.ContactType === 1)    // email
            return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val);
        else if (type.ContactType === 2)    // website
            return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(val);
        return false;
    },
    message: 'must be 10 chars'
};

ko.validation.rules['url'] = {
    validator: function (val, required) {
        if (!val) {
            return !required
        }
        val = val.replace(/^\s+|\s+$/, ''); //Strip whitespace
        //Regex by Diego Perini from: http://mathiasbynens.be/demo/url-regex
        return val.match(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i);
    },
    message: 'This field has to be a valid URL'
};

ko.validation.rules['oneElementAtLeastCheckBoxList'] = {
    validator: function (val) {
        var length = ko.utils.arrayFilter(val,
            function (e) {
                return e.IsChecked() === true;
            }).length;

        return length > 0;
    },
    message: 'At least one element must be added'
}

ko.validation.rules['isThereEmptyItem'] = {
    validator: function (val) {
        var length = ko.utils.arrayFilter(val,
            function (item) {
                return item.Title() === '' || item.Title() === undefined;
            }).length;

        return length === 0;
    },
    message: 'Title areas in items are required'
};

ko.validation.rules['isPeriodInActive'] = {
    validator: function (val) {
        var activatedPeriodsCount = ko.utils.arrayFilter(val, function (wp) {
            return wp.IsActive() === false;
        }).length;
        return activatedPeriodsCount !== 3;
    },

    message: 'There must be one active period at least'
}

ko.validation.rules['isAllPeriodsAreValid'] = {
    validator: function (val) {
        var validPeriodsCount = ko.utils.arrayFilter(val, function (wp) {
            if (wp.IsActive() === false)
                return true;
            return wp.SelectedFromHour().Hour < wp.SelectedToHour().Hour;
        }).length;
        return validPeriodsCount === 3;
    },

    message: 'In all the Periods, the start hour must be less than the end hour'
}

ko.validation.rules['isHolidayValid'] = {
    validator: function (val) {
        var aHoliday = ko.utils.arrayFirst(val, function (e) {
            return e.IsHoliday() === true;
        });

        if (aHoliday != null)
            return true;

        var aRestPeriod = ko.utils.arrayFirst(val, function (e) {
            return e.IsMorningPeriodRest() === true || e.IsEveningPeriodRest() === true || e.IsNightPeriodRest() === true;
        });

        if (aRestPeriod != null)
            return true;

        return false;
    },

    message: 'At Least One Holiday Or One Rest Period Must be choosed.'
}

ko.validation.rules['oneElementAtLeast'] = {
    validator: function (val) {
        var length = val.length;
        if (length === undefined)
            return false;
        return length > 0;
    },
    message: 'At least one element must be added'
}

ko.validation.rules['greaterThan'] = {
    validator: function (val, otherVal) {
        if (!val || otherVal === undefined)
            return false;

        if (val.isValid() === false || otherVal.isValid() === false)
            return false;

        return moment(val).isAfter(otherVal);
    },
    message: 'The field must be greater than From Date'
};

ko.validation.rules['lessThan'] = {
    validator: function (val, otherVal) {
        return val < otherVal;
    },
    message: 'The field must be less than {0}'
};

ko.validation.rules['areSame'] = {
    getValue: function (o) {
        return (typeof o === 'function' ? o() : o);
    },
    validator: function (val, otherField) {
        return val === this.getValue(otherField);
    },
    message: "Confirm password must match password"
};


ko.validation.registerExtenders();

function convertMomentToUnix(momVal) {
    //https://stackoverflow.com/a/47834838
    if (momVal === undefined)
        return '';
    return "/Date(" + momVal.valueOf() + ")/";
}

function formatThousandSeparator(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//http://stackoverflow.com/a/5344074
function copyJsonObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// for resource about the dirtyFlag
//http://www.knockmeout.net/2011/05/creating-smart-dirty-flag-in-knockoutjs.html
ko.dirtyFlag = function (root, isInitiallyDirty) {
    var result = function () { };
    var _initialState = ko.observable(ko.toJSON(root));
    var _isInitiallyDirty = ko.observable(isInitiallyDirty);

    result.isDirty = ko.computed(function () {
        return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
    });

    result.reset = function () {
        _initialState(ko.toJSON(root));
        _isInitiallyDirty(false);
    };

    return result;
};

ko.validation.init({
    insertMessages: false,
    errorMessageClass: 'error',
    errorElementClass: 'input-validation-error',
    messagesOnModified: true,
});

function validate(model, config) {
    config = config || { deep: true };
    var errors = ko.validation.group(model, config);
    if (errors().length !== 0) {
        errors.showAllMessages();
        return false;
    }
    return true;
}

function getNowInUTC() {
    var now = new Date();
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}

function convertJsonTime(dateTime) {
    return moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
}

function isStrEmpty(str) {
    return (str === null || !str || 0 === str.length || /^\s*$/.test(str));
}

ko.observableArray.fn.getPrevious = function (current) {
    var list = this();
    for (var i = 0; i < list.length; i++) {
        if (list[i] === current) {
            if (i > 0)
                return list[i - 1];
            else
                return undefined;
        }
    }
}

ko.observableArray.fn.getNext = function (current) {
    var list = this();
    for (var i = 0; i < list.length; i++) {
        if (list[i] === current) {
            if (i < list.length - 1)
                return list[i + 1];
            else
                return undefined;
        }
    }
}

ko.observableArray.fn.last = function () {
    var list = this();
    if (list.length > 0)
        return list[list.length - 1];
    return undefined;
}

function ShowSuccessMessage(message) {
    toastr.success(message);
};

function ShowErrorMessage(message) {
    toastr.error(message);
};

function ShowWarning(message) {
    toastr.warning(message);
};

function disposeComputedProperties() {
    for (var prop in self) {
        if (self.hasOwnProperty(prop) && ko.isComputed(self[prop])) {
            self[prop].dispose();
        }
    }
}