$(document).ready(function(){

	//Reset for links
	$( ".back, .comment-trigger" ).click(function( event ) {
		event.preventDefault();
	});

	//Owl carousel
	//Owl big carousel
	$("#owl-big-carousel").owlCarousel({
		navigation : true,
		navigationText : ['',''],
		singleItem : true,
		autoPlay: 3600,
		//Basic Speeds
		slideSpeed : 800,
		paginationSpeed : 1000,
		rewindSpeed : 1000
	});

	//Owl small carousel
	var owl = $("#owl-small-carousel");

	 owl.owlCarousel({
		items : 5, //5 items above 1000px browser width
		itemsDesktop : [1200,4], //4 items between 1000px and 901px
		itemsTablet: [600,2], //2 items between 600 and 0
		itemsMobile : false, // itemsMobile disabled - inherit from itemsTablet option
		navigation : true,
	 	navigationText : ['',''],
	 	autoPlay: 2600
	});
 
	//Comment trigger
	$('.comment-trigger').click(function() {
		$(this).closest('body').find('.comment-body-box').slideToggle('slow');
    });

    //Placeholders Fix for IE9
    $('input, textarea').placeholder();

});
