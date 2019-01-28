(function ($) {
    "use strict";

    $(document).ready(function () {
    
        /*---------------------------------------------------
            Magnific PopUp
        ----------------------------------------------------*/
        $('.popup-video').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false,
            disableOn: 300
        });

    });

    /*---------------------------------------------------
        Smooth Scroll
    ----------------------------------------------------*/
    $(document).on('click', '.navbar.bootsnav ul.nav li:not(.to-page) a, .demo-heading-content a, .attr-nav a, .get-started-button', function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);

    });

    $('.navbar-nav > li').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active');
    });


    /*---------------------------------------------------
        Site Preloader
    ----------------------------------------------------*/
    

    $(window).load(function () {
        $('.preloader').fadeOut('slow', function () { $(this).remove(); });
    });

    var OwlCurosel = function() {
		var owl = $('.owl-images');
		owl.owlCarousel({
			margin:10,
			rewind: true,
			autoplay:true,
			autoplayTimeout:3000,
			autoplayHoverPause:true,
			responsive:{
				0:{
					items:1
				},
				600:{
					items:2
				},
				1000:{
					items:3
				}
            },
            rtl: true,
		});
		$('.play').on('click',function(){
			owl.trigger('play.owl.autoplay',[3000])
		})
		$('.stop').on('click',function(){
			owl.trigger('stop.owl.autoplay')
		})

    };
    
    OwlCurosel();

    // Set affix offset
    var offset = $('#section-background').height();
    $('.bootsnav').attr('data-offset-top', offset);

    function menuToggle() {
        var featuresArea = $('.after-hero');
        var homeSectionHeight = $('#section-background').height();

        $(window).on('scroll', function () {
            if ($(window).scrollTop() > homeSectionHeight) {
                $('.navbar').addClass('navbar-fixed-top');
                featuresArea.css('padding-top', $('.navbar').height() + 90);
            } else {
                $('.navbar').removeClass('navbar-fixed-top');
                featuresArea.css('padding-top', 90);
            };
        });
    }

    menuToggle();

}(jQuery));