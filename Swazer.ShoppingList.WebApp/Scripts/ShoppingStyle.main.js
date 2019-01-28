jQuery(function ($) {
    'use strict';

    /*==============================================================*/
    // Table of index
    /*==============================================================*/

    /*==============================================================
    # Menu add class
    # Magnific Popup
    # WoW Animation
    ==============================================================*/

    // ----------------------------------------------
    // # Demo Chooser
    // ----------------------------------------------
    (function () {
        $('.demo-chooser .toggler').on('click', function (event) {
            event.preventDefault();
            $(this).closest('.demo-chooser').toggleClass('opened');
        })
    }());
    /*==============================================================*/
    // # Preloader
    /*==============================================================*/

    (function () {
        $(window).load(function () {
            $('.preloader').fadeOut('slow', function () { $(this).remove(); });
        });
    }());

    /*==============================================================*/
    //Mobile Toggle Control
    /*==============================================================*/

    $(function () {
        var navMain = $("#mainmenu");
        navMain.on("click", "a", null, function () {
            navMain.collapse('hide');
        });
    });

    /*==============================================================*/
    // Menu add class
    /*==============================================================*/
    (function () {
        // this is the original function
        
        function menuToggle() {
            var whatsDiv = $('#whatsit');
            var homeSectionHeight = $('#home-section').height();
            
                $(window).on('scroll', function () {
                    if ($(window).scrollTop() > homeSectionHeight) {
                        $('.navbar').addClass('navbar-fixed-top');
                        whatsDiv.css('padding-top', $('.navbar').height() + 90);
                    } else {
                        $('.navbar').removeClass('navbar-fixed-top');
                        whatsDiv.css('padding-top', 90);
                    };
                });
        }

        menuToggle();
    }());

    $('#mainmenu').onePageNav({
        currentClass: 'active',
    });

    /*==============================================================*/
    // WoW Animation
    /*==============================================================*/
    new WOW().init();

    /*==============================================================*/
    // Owl Carousel
    /*==============================================================*/

    //$("#team-slider").owlCarousel({
    //    pagination: false,
    //    navigation: true,
    //    navigationText: [
		  //"<span class='team-slider-left'><i class=' fa fa-angle-left '></i></span>",
		  //"<span class='team-slider-right'><i class=' fa fa-angle-right'></i></span>"
    //    ]
    //});

    $("#screenshot-slider").owlCarousel({
        rewind: true,
        autoplay: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            1000: {
                items: 4
            }
        },
    });

    /*==============================================================*/
    // Magnific Popup
    /*==============================================================*/

    (function () {
        $('.image-link').magnificPopup({
            gallery: {
                enabled: true
            },
            type: 'image'
        });
        $('.feature-image .image-link').magnificPopup({
            gallery: {
                enabled: false
            },
            type: 'image'
        });
        $('.image-popup').magnificPopup({
            type: 'image'
        });

        $('.video-link').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,

            fixedContentPos: false
        });

    }());
});