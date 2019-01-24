/*
 *
 *   INSPINIA - Utility method used by the application as wide
 *   Add by 'Hakam Fostok'
 *   This script is not part of the Insipina style. But it used with support some features we done in the project.
 *
 */

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

// if some html loaded after the page finished loading (this could be happend in case we request some of the html by ajax request)
// then the jquery.validation.unobstrive will not work on this html (which loaded by the ajax request)
// and this function is used to fix the jquery.validation.unobstrive (make it working on the dynamic loaded html)
// if you did not understand what I mean by that see this StackOverflow answer to understand the whole problem
// http://stackoverflow.com/a/5783020/4390133
function fixJQueryValidation(selector) {
    var form = $(selector);

    form.removeData("validator");
    form.removeData("unobtrusiveValidation");
    $.validator.unobtrusive.parse(form);
}

// this function is scrolling inside the html page to specific
function scrollToDiv(divId, movingPeriod) {
    // if the user did not provide value to the moving period
    // so we will set it by default to 1000 ms (1 second)
    if (isUndefined(movingPeriod)) {
        movingPeriod = 1000;
    }

    if (isBreakpoint('xs') || isBreakpoint('sm')) {
        $('html, body').animate({
            scrollTop: $("#" + divId).offset().top
        }, movingPeriod);
    }
}

// determine if a variable is equal to 'undefined' or not.
function isUndefined(variable) {
    if (typeof variable === "undefined") {
        return true;
    }
    return false;
}

// abort the ajax request if it has not finished yet.
function abortAjaxRequestIfNotFinishedYet(xhr) {
    if (xhr && xhr.readyState != 4) {
        xhr.abort();
    }
}

//$(document).on('submit', 'form .validate-all-tabs', function (eventObject) {
//    var form = $(this);
//    validatingAllTabs(form, eventObject);
//})

// this function solve the following problem.
// when we have more than one tab inside the form, then only the inputs inside the 'active' tab (the tab which showing at time of submitting the form)
// will be validated, and the other inputs inside the other tabs (tabs which not shown at the time of submitting the form) will not be validated.
// so if we want to validate all the inputs inside ALL tabs, then we need to call this function at the 'form.submit' event.
function validatingAllTabs(form, eventObject) {

    var validator = form.data("validator");
    if (isUndefined(validator) == false) {

        // this statement WILL work if your ARE using 'unobtrusive validation'
        // see this answer http://stackoverflow.com/a/11053251/4390133
        validator.settings.ignore = "";

        // this statement MAY work if your are NOT using 'unobtrusive validation'
        //form.validate({ ignore: '' });

        var isvalid = form.valid();
        if (isvalid == false)
            eventObject.preventDefault();
    }
}

function handleError(data) {
    toastr.error(data.responseJSON);
}