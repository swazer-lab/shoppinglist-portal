"use strict";
$(document).ready(function () {

    $('[data-toggle="tooltip"]').tooltip();


    if ($.fn.select2 !== undefined)
        $.fn.select2.defaults.set("language", "ar");

    

    $('input.form-control').on('keyup', function () {

        var formInput = $(this);
        if (formInput.val().length == 1) {
            var x = new RegExp("[\x00-\x80]+"); // is ascii

            var isAscii = x.test(formInput.val());

            if (isAscii) {
                formInput.css("direction", "ltr");
            }
            else {
                formInput.css("direction", "rtl");
            }
        }
    });

    //Stop the slider from auto slider

    $('#Carousel').carousel({
        interval: false,
    }).on('slide.bs.carousel', function (e, direction) {
        var nextH = $(e.relatedTarget).outerHeight();
        $(this).find('.active.item').parent().animate({ height: nextH }, 1000);
    });

    //Active Step 
    $('.step').on('click', function () {
        if (!$(this).hasClass('active')) {
            $('.step').not($(this)).removeClass('active');
            $(this).addClass('active');
        }
    });

    //setLicenseListHeight();
});

//http://stackoverflow.com/a/506004
function redirect(url) {
    window.location.href = url;
}

function ShowSuccessMessage(message) {
    toastr.options = {
        positionClass: "toast-top-left",
    };
    toastr.success(message);
};

function ShowFailMessage(message) {
    toastr.options = {
        positionClass: "toast-top-left",
    };

    if (typeof message === 'string') {
        toastr.error(message);
    } else if (typeof message === 'object' && typeof message.message === 'string') {
        toastr.error(message.message);
    } else {
        toastr.error('حدث خطأ أثناء تنفيذ العملية');
    }
};

function fixHindiNumber(el) {
    var d = convertNumberToEnglish($(el).val());
    $(el).val(d);
}

function forceOnlyNumber(e) {
    -1 !== $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) || (/65|67|86|88/.test(e.keyCode) && (e.ctrlKey === true || e.metaKey === true)) && (!0 === e.ctrlKey || !0 === e.metaKey) || 35 <= e.keyCode && 40 >= e.keyCode || (e.shiftKey || 48 > e.keyCode || 57 < e.keyCode) && (96 > e.keyCode || 105 < e.keyCode) && e.preventDefault()
}

function convertNumberToEnglish(num) {
    return num.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function (d) {
        return (d.charCodeAt(0) - 1632);
    });
}

function setLicenseListHeight() {
    var paginationElementsExists = $('.pagination-list').has('li').length;
    if (paginationElementsExists) {
        $('.table-container').css("height", "92%");
    } else {
        $('.table-container').height("height", "100%");
    }
}

function getCurrentPage() {
    var li = $('.pagination-list').has('li').length;
    if (li === 0)
        return 1;

    var d = $('.pagination-list li span').data('page');
    return d;
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
}