/*
*============================================
* Table of contents:
---------------------------------------------
---------------------------------------------
** On Window Load
---------------------------------------------
- Preloader
---------------------------------------------

** On Document Ready
---------------------------------------------
// On Dom Load
// Adjust Header Menu On Scroll Down
// On click hide collapse menu
// Smooth Scrolling Effect
// countdown
// Hero Mockup Slider
// Adjusting the center position of mockup slider
// About Mockup Slider
// Testimonial Slick Carousel
// Team Carousel Slider
// Vertical News Ticker
// Wow js Init
// Counter Js 
*============================================
*/
(function($) {
    "use strict";

    // On Dom Load
    $(".embed-responsive iframe").addClass("embed-responsive-item");
    $(".carousel-inner .item:first-child").addClass("active");
    $('[data-toggle="tooltip"]').tooltip();

     //Adjust Header Menu On Scroll Down
    $(window).scroll(function() {
        var wScroll = $(this).scrollTop() + 100;
        var wh = $(window).height();

        if (wScroll > wh) {
            $('.navbar-default').addClass('fixed-topbar');
        } else {
            $('.navbar-default').removeClass('fixed-topbar');
        }
    });

    // On click hide collapse menu
    $(".navbar-nav li a").on('click', function(event) {
        $(".navbar-collapse").removeClass("collapse in").addClass("collapse").removeClass('open');
        $(".navbar-toggle").removeClass('open');

    });
    $(".dropdown-toggle").on('click', function(event) {
        $(".navbar-collapse").addClass("collapse in").removeClass("collapse");
        $(".navbar-toggle").addClass('open');
    });
    $('.navbar-toggle').on('click', function() {
        $(this).toggleClass('open');
    });

    // Smooth Scrolling Effect
    $('.smoothscroll').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;

        $('html, body').stop().animate({
            'scrollTop': $(target).offset().top - 95
        }, 1200);
    });

    // Adjusting the center position of mockup slider
    var wh = $(window).height(); // Getting the window height
    var sh = $('.hero-area-inner').height(); // Getting the hero-area-inner height
    var mt = (wh - sh) / 2;
    $('.hero-mockup-slider-area').css({
        'margin-top': mt + 'px'
    })

    

    // Wow js Init
    var wow = new WOW({
        boxClass: 'wow', // animated element css class (default is wow)
        animateClass: 'animated', // animation css class (default is animated)
        offset: 0, // distance to the element when triggering the animation (default is 0)
        mobile: true, // trigger animations on mobile devices (default is true)
        live: true, // act on asynchronously loaded content (default is true)
        callback: function(box) {
            // the callback is fired every time an animation is started
            // the argument that is passed in is the DOM node being animated
        },
        scrollContainer: null // optional scroll container selector, otherwise use window
    });
    wow.init();

}(jQuery));


// On Window Load
jQuery(window).load(function() {
    "use strict";
    // Preloader
    $('.preloader-area').fadeOut();
    $('.preloader-area').delay(350).fadeOut('slow');
    $('body').delay(550);
    $('.image-popup-link').magnificPopup({
        gallery: {
            enabled: true
        },
        type: 'image'
    });
});
