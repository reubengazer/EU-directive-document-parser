// General PopOvers (start)
$('.EurlexPopover').popover({
	template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-title"></div><div class="popover-content"></div></div>',
	html: true
})
// General PopOvers (end)

// General Tooltips (start)
$('.EurlexTooltip').tooltip()
// General Tooltips (end)

// Form Help Tooltips (start)
// Initiate
$(function () {
	$('.FormHelpTooltip').tooltip({
		trigger: 'click hover',
		delay: {"show": 100, "hide": 200},
		html: true
	})
});

// Keep only one open
$(document).on('click', function (e) {
	$('[data-toggle="tooltip"]').each(function () {
		if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.tooltip').has(e.target).length === 0) {
			(($(this).tooltip('hide').data('bs.tooltip') || {}).inState || {}).click = false
		}
	});
});

// Keep open on mouseover
var originalLeave = $.fn.tooltip.Constructor.prototype.leave;
$.fn.tooltip.Constructor.prototype.leave = function (obj) {
	var self = obj instanceof this.constructor ?
		obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
	var container, timeout;

	originalLeave.call(this, obj);

	if (obj.currentTarget) {
		container = $(obj.currentTarget).siblings('.tooltip')
		timeout = self.timeout;
		container.one('mouseenter', function () {
			clearTimeout(timeout);
			container.one('mouseleave', function () {
				$.fn.tooltip.Constructor.prototype.leave.call(self, self);
			});
		})
	}
};

// Disable click on link
$('.FormHelpTooltip').click(function (event) {
	event.preventDefault();
});
// Form Help Tooltips (end)

// Slide dropdowns (start)
$('.dropdown').on('show.bs.dropdown', function (e) {
	$(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
});
$('.dropdown').on('hide.bs.dropdown', function (e) {
	$(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
});
// Slide dropdowns (end)

// Disable QuickSearch and AdvancedSearch textarea 'enter' key (start)
$('#QuickSearchField, .AdvancedSearchTextarea').bind('keypress', function (e) {
	if ((e.keyCode || e.which) == 13) {
		$(this).parents('form').submit();
		return false;
	}
});
// Disable QuickSearch and AdvancedSearch textarea 'enter' key (end)

// Show/Hide QuickSearch options (start)
function ShowHideQS() {
	$('div.QuickSearchOptions').fadeIn('medium').removeClass('sr-only').addClass('in');
	$(document).bind('focusin.QuickSearchOptions click.QuickSearchOptions', function (e) {
		if ($(e.target).closest('.QuickSearchOptions, #QuickSearchField, .QuickSearchBtn').length) return;
		$(document).unbind('.QuickSearchOptions');
		$('div.QuickSearchOptions').addClass('sr-only').removeClass('in');
	});
};
$('#QuickSearchField').on('focus', ShowHideQS);
$('.QuickSearchBtn').on('keydown', ShowHideQS);

$('.NavSearchHome .QuickSearchBtn').focus(function () {
	$('div.QuickSearchOptions').addClass('sr-only').removeClass('in');
});
// Show/Hide QuickSearch options (end)

// Distinctive Quick Searches (start)
$(document).ready(function () {
	initRelatedForms();
});

function initRelatedForms() {
	var $forms = $('.DistinctiveForm'),
		isActivated = false;

	var isHomePage = window.location.pathname.indexOf("homepage") >= 0;

	if (isHomePage) {
		$("input, textarea", $forms).each(function () {
			$currentForm = $(this).closest('.DistinctiveForm');

			if (!($currentForm.attr('id') === ('quick-search') || this.type === 'hidden')) {
				if (this.value) {
					disableFormsFields($currentForm);
				}
			}
		});
	} else {
		$("input, textarea", $forms).each(function () {
			$currentForm = $(this).closest('.DistinctiveForm');

			if (!($currentForm.attr('id') === ('quick-search') || this.type === 'hidden')) {
				if (this.value) {
					var QSform = $('.DistinctiveForm.QSF').get();
					disableFormFields($currentForm, QSform);
					$('div.QuickSearchOptions').fadeIn('medium').removeClass('sr-only').addClass('in');
					$(document).bind('focusin.QuickSearchOptions click.QuickSearchOptions', function (e) {
						if ($(e.target).closest('.QuickSearchOptions, #QuickSearchField, .QuickSearchBtn').length) return;
						$(document).unbind('.QuickSearchOptions');
						$('div.QuickSearchOptions').addClass('sr-only').removeClass('in');
					});
				}
			}
		});
	}

	if ($forms.length < 1)
		return;

	$("input, textarea", $forms).on('input', function () {
		var $this = $(this),
			value = this.value,
			$currentForm = $this.closest('.DistinctiveForm'),
			isQuickSearch = ($currentForm.hasClass('QSF')) ? true : false;


		if (value === "") {
			if (isEmptyFields($currentForm)) {
				enableFormsFields($currentForm);
				if (!isQuickSearch) {
					isActivated = false;
				}
			}
		} else {
			disableFormsFields($currentForm);
			if (!isQuickSearch) {
				isActivated = true;
			}
		}

	});

	$("select", $forms).change(function () {
		var $this = $(this),
			index = this.selectedIndex,
			$currentForm = $this.closest('.DistinctiveForm'),
			isQuickSearch = ($currentForm.hasClass('QSF')) ? true : false;

		if (index == 0) {
			if (isEmptyFields($currentForm)) {
				enableFormsFields($currentForm);
				if (!isQuickSearch) {
					isActivated = false;
				}
			}
		} else {
			disableFormsFields($currentForm);
			if (!isQuickSearch) {
				isActivated = true;
			}
		}

	});

	$('html').click(function (event) {
		if (!$(event.target).closest('.QuickSearchOptions').length && !$(event.target).closest('.QSF').length && !$(event.target).closest('.FindResultsBy').length) {
			if (isActivated)
				clearQSFForms();
		}
	});

	function isEmptyFields($form) {
		var isClear = true;

		$("input:visible, textarea", $form).each(function () {
			var $this = $(this);

			if ($this.val() !== '') {
				isClear = false;
				return false;
			}
		});

		$("select", $form).each(function () {
			if (this.selectedIndex != 0) {
				isClear = false;
				return false;
			}

		});

		return isClear;
	}

	function disableFormFields($exceptForm1, $exceptForm2) {
		$('.DistinctiveForm').not($exceptForm1).not($exceptForm2).find('input, textarea, select, button').prop('disabled', true);
		$('.DistinctiveForm').not($exceptForm1).not($exceptForm2).find('a').css('visibility', 'hidden');
		$('.DistinctiveForm').not($exceptForm1).not($exceptForm2).find('.DistinctiveFormMessage').fadeIn();
	}

	function disableFormsFields($exceptForm) {
		$('.DistinctiveForm').not($exceptForm).find('input, textarea, select, button').prop('disabled', true);
		$('.DistinctiveForm').not($exceptForm).find('a').css('visibility', 'hidden');
		$('.DistinctiveForm').not($exceptForm).find('.DistinctiveFormMessage').fadeIn();
	}

	function enableFormsFields($exceptForm) {
		$('.DistinctiveForm').not($exceptForm).find('input, textarea, select, button').prop('disabled', false);
		$('.DistinctiveForm').not($exceptForm).find('a').css('visibility', '');
		$('.DistinctiveForm').not($exceptForm).find('.DistinctiveFormMessage').fadeOut();
	}

	/* Applies to 'Quick Search' form and 'Find results by' widgets.
	 * If any point in the screen is clicked, enable them if disabled, and clear their content (except for hidden input elements).
	 * Exception: If the 'Quick Search' textarea has a value, it isn't cleared and the 'Find results by' widgets remain disabled.
	 */
	function clearQSFForms() {
		if ($('.QSF').find('textarea').val() == ''){
			$('.DistinctiveForm').each(function () {
				var $form = $(this);
				$("select", $form).prop('disabled', false).find('option').eq(0).prop('selected', true);
				$("input, textarea, button", $form).prop('disabled', false);
				$("input[type!='hidden']", $form).val('');
				$('.DistinctiveForm').find('a').css('visibility', '');
				$('.DistinctiveForm').find('.DistinctiveFormMessage').fadeOut();
			});
		}
	}
}

// Distinctive Quick Searches (end)

// Enable links in TreeMenu with <span class="TMLink"> (start)
$(".TMLink").click(function (e) {
	e.stopPropagation();
	window.location = $(this).parent().attr('href');
});
// Enable links in TreeMenu with <span class="TMLink"> (end)

// Initialize tree menu and News page left menu (start)
if ($(".TreeMenu").length) {
	$(".TreeMenu").metisMenu({
		activeClass: 'Expanded'
	});
}
if ($(".CompactStaticMenu").length) {
	$(".CompactStaticMenu").metisMenu({
		activeClass: 'Expanded'
	});
}

$(window).bind('resize load', function () {
	if ($(".TreeMenu").length) {
			$(".NoAccordionTreeMenu").metisMenu({
				activeClass: 'Expanded',
				toggle: false
			});
	}
	if ($(".CompactStaticMenu").length) {
		$(".NoAccordionTreeMenu").metisMenu({
			activeClass: 'Expanded',
			toggle: false
		});
}
});
// Initialize tree menu and News page left menu (end)

// Expert Search Trees (start)
$(".ExpertSearchTree").metisMenu({
	toggle: false,
	activeClass: 'Expanded'
});

$("#ExpandAllTree").click(function (e) {
	$('.ExpertSearchTree .has-arrow').parent('li').addClass('Expanded');
	$('.ExpertSearchTree a[aria-expanded="false"]').attr('aria-expanded', 'true');
	$('.ExpertSearchTree ul[aria-expanded="false"]').attr('aria-expanded', 'true').addClass('in').removeAttr('style');
});
$("#CollapseAllTree").click(function (e) {
	$('.ExpertSearchTree .has-arrow').parent('li').removeClass('Expanded');
	$('.ExpertSearchTree a[aria-expanded="true"]').attr('aria-expanded', 'false');
	$('.ExpertSearchTree ul[aria-expanded="true"]').attr('aria-expanded', 'false').removeClass('in');
});

$(".ExpertSearchValueTree").metisMenu({
	toggle: false,
	activeClass: 'Expanded'
});

// Expert Search Trees (end)


// Set various homepage equal heights (start)
$(window).bind('resize load', function () {
	var windowSize = window.innerWidth;

	if (windowSize > 991) {
		$(".HomeOJ").css({'min-height': ($(".NavSearchHome").innerHeight() + $(".Promo").innerHeight() + 20 + 'px')});
		$(".MenuBlock2").css({'min-height': ($(".MenuBlock3").innerHeight() + 1 + 'px')});
		$(".MenuBlock1").css({'min-height': ($(".MenuBlock3").innerHeight() + $(".MenuBlock4").innerHeight() + 24 + 'px')});
		$("#QSByDocNumber .panel-body").css({'min-height': ($(".MenuBlock3").innerHeight() - $("#QSByCelexTitle").innerHeight() - 30 + 'px')});
		$("#QSByCelex .panel-body").css({'min-height': ($(".MenuBlock3").innerHeight() - $("#QSByDocNumberTitle").innerHeight() - 30 + 'px')});
	} else if (windowSize > 767) {
		$(".HomeOJ").css({'min-height': ($(".FindResultsBy").innerHeight() + 'px')});
		$(".MenuBlock1").css({'min-height': ($(".MenuBlock2").innerHeight() + $(".MenuBlock3").innerHeight() + 25 + 'px')});
		$("#QSByCelex .panel-body").css({'min-height': ($(".HomeOJ").innerHeight() - $("#QSByDocNumberTitle").innerHeight() - 33 + 'px')});
	} else {
		$(".HomeOJ").css({'min-height': 'auto'});
		$(".MenuBlock2").css({'min-height': 'auto'});
		$(".MenuBlock1").css({'min-height': 'auto'});
		$("#QSByCelex .panel-body").css({'min-height': 'auto'});
	}
});
// Set various homepage equal heights (end)

// Collapse panel on-resize in search results and display ViewMoreInfo button correctly (start)
$(window).bind('resize', function () {
    if (window.innerWidth < 992) {
        $('.SearchResult .CollapsePanel-sm').each(function (i, e) {
        	var aria = $('.ViewMoreInfo', e).attr("aria-expanded");
            if (aria == 'true') {
                $('.collapse', e).addClass('in');
            } else {
                $('.collapse', e).removeClass('in');
            }
        });
    } else {
        $('.SearchResult .CollapsePanel-sm .collapse').addClass('in');
        $('.SearchResult .CollapsePanel-sm .panel-title a').removeClass('collapsed');
        $('.SearchResult .CollapsePanel-sm .panel-title a').attr('aria-expanded', 'true');
    }
});
// Collapse panel on-resize in search results and display ViewMoreInfo button correctly (end)

// Megamenu (start)
// Set Megamenu width
$(window).resize(function () {
	$(".MegaMenu").css({'width': ($(".NavSearch").width() + 'px')});
});
$(window).trigger('resize');

// Keep Megamenu open when clicking on it
$('.MegaMenu').on('click', function (e) {
	e.stopPropagation();
});

// Close Megamenu when focus is on the Quick Search (for keyboard users)
$('#QuickSearchField').focusin(function () {
	$('.MegaMenu').slideUp(200);
});
// Megamenu (end)

// Offcanvas menu (start)
$(document).ready(function () {
	$('[data-toggle="offcanvas"]').click(function () {
		$('.row-offcanvas').toggleClass('active')
	});
    $('#helpMenu1 a.faqLink,#helpMenu1 span.TMLink,#helpMenu2 span.TMLink').click(function () {
    	//Deactivate transition
        $(".row-offcanvas").addClass('notransition');
        //remove active class
        $('.row-offcanvas').toggleClass('active');
        //activate transition
        $(".row-offcanvas")[0].offsetHeight; // Trigger a reflow, flushing the CSS changes
        $(".row-offcanvas").removeClass('notransition');
    });
});
// Offcanvas menu (end)

// Expand collapse all page panels (start)
$("#ExpandAll").click(function (e) {
	$(".PagePanel .panel-collapse").not(".childPanel").collapse("show");
	$(".AdvancedSearchPanel .panel-collapse").not(".childPanel").collapse("show");
});

$("#CollapseAll").click(function (e) {
	$(".PagePanel .panel-collapse").not(".childPanel").collapse("hide");
	$(".AdvancedSearchPanel .panel-collapse").not(".childPanel").collapse("hide");
});
// Expand collapse all page panels (end)

// Diable click on unavailable publication format languages (start)
$(".PubFormat .disabled a").click(function (event) {
	event.preventDefault();
});
// Diable click on unavailable publication format languages (end)

// Affix sidebar (start)
/* Separate call for document.ready to avoid affix sidebar stuck on bottom, when page is scrolled to bottom and refreshed
 * Doesn't work in Firefox, extra click needed.
 */
$(document).ready(function () {
	setAffixSidebar();
	$(document).click();
});
$(window).bind('resize', function () {
	setAffixSidebar();
});

function setAffixSidebar() {
	var headerHeight = $('header').outerHeight() + $('.NavSearch').outerHeight() + $('.SiteBreadcrumb').outerHeight() + $('.PageTitle').outerHeight() - 20;
	var footerHeight = $('footer').outerHeight() + 40;
	if (window.innerWidth > 991) {
		$('#AffixSidebar').affix({
			offset: {
				top: headerHeight,
				bottom: footerHeight
			}
		});

		// Update SidebarWrapper width (in desktop)
		$('#AffixSidebar').width($('.AffixSidebarWrapper').width() - 10);
	}

	// Update SidebarWrapper width (in mobile)
	$('#AffixSidebar').width($('.AffixSidebarWrapper').width());	
}
//Affix sidebar (end)

/* MODALS CODE  */

// Modal body scroll (start)
function setModalMaxHeight(element) {
	// alert("setModalMaxHeight() called")
	this.$element = $(element);
	this.$content = this.$element.find('.modal-content');
	var borderWidth = this.$content.outerHeight() - this.$content.innerHeight();
	var dialogMargin = window.innerWidth < 768 ? 20 : 60;
	var contentHeight = $(window).height() - (dialogMargin + borderWidth);
	var headerHeight = this.$element.find('.modal-header').outerHeight() || 0;
	var footerHeight = this.$element.find('.modal-footer').outerHeight() || 0;
	var fixedContentHeight = this.$element.find('.FixedModalContent').outerHeight() || 0;
	var modalActionsHeight = this.$element.find('.ModalActions').outerHeight() || 0;
	var maxHeight = contentHeight - (headerHeight + footerHeight + fixedContentHeight + modalActionsHeight);

	this.$content.css({
		'overflow': 'hidden'
	});

	this.$element
		.find('.modal-body').css({
		'max-height': maxHeight,
		'overflow-y': 'auto',
		'overflow-x': 'hidden'
	});

	this.$element
		.find('.modal-content').css({
		'padding-bottom': modalActionsHeight
	});
}

// This event fires immediately when the show instance method is called.
// If caused by a click, the clicked element is available as the relatedTarget property of the event.
$('.modal').on('show.bs.modal', function () {
	// alert("show.bs.modal triggered")
	$(this).show();
	setModalMaxHeight(this);
});

/*Hide modal - related functionalities */
// This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
$('#myModal').on('hidden.bs.modal', function (e) {
	modalCleanup();
})

$(window).resize(function () {
	if ($('.modal.in').length != 0) {
		setModalMaxHeight($('.modal.in'));
	}
	/* ONLY for the Webservice Template modal: Override bootstrap default that sets width:auto for xs-screen,
	 * as it causes the modal to drop below the viewport, because of overflow in the <pre> child element.
	 * Margin value=168 selected to work smoothly with the fixed width:600px for larger screens.*/
	if (window.innerWidth < 768) {
		$(".modal-dialog:has(.singleInline64)").width(window.innerWidth - 168);
	}
	else{
		$(".modal-dialog:has(.singleInline64)").width(600);
	}
});
// Modal body scroll (end)


// Set defaults of spinner plugging
$(document).ready(function () {
	if ($.LoadingOverlaySetup) {
		$.LoadingOverlaySetup({
			color: "rgba(17, 34, 68, 0.8)",
			image: "",
			fontawesome: "fa fa-spinner fa-spin spinner-font ",
			fade: [400, 10]
		});
	}
});

/* END MODALS CODE  */


// Back to top (start)
$(document).ready(function () {
	var offset = 300;
	var duration = 300;
	$(window).scroll(function () {
		if ($(this).scrollTop() > offset) {
			$('.EurlexTop').fadeIn(duration);
		} else {
			$('.EurlexTop').fadeOut(duration);
		}
	});
	$('.EurlexTop').click(function (event) {
		event.preventDefault();
		$('html, body').animate({scrollTop: 0}, duration);
		return false;
	})
});

$(window).bind('resize load', function () {
	$(".EurlexTop").css({'right': (($(document).width() - $("footer").innerWidth()) / 2 + 'px')});
});
// Back to top (end)

// Custom input type="file" (start)
$(function () {
	$(document).on('change', ':file', function () {
		var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});

	$(document).ready(function () {
		$(':file').on('fileselect', function (event, numFiles, label) {

			var input = $(this).parents('.input-group').find(':text'),
				log = numFiles > 1 ? numFiles + ' files selected' : label;

			if (input.length) {
				input.val(log);
			} else {
				if (log) alert(log);
			}
		});
	});
});
// Custom input type="file" (end)

// AutoGrow Textareas (start) [see plugin]
$(document).ready(
	function () {
		if ($('.AutoGrow').length) {
			$('.AutoGrow').autoResize({minRows: 1, maxRows: 5});
		}
	});
// AutoGrow Textareas (end)

// Add gradient background to responsive tables when their content becomes scrollable
$(window).bind('resize load', function () {
	$('.table-responsive').each(function(){
		if($(this)[0].scrollWidth > $(this)[0].clientWidth){
			updateGradients(this, "rightGradient");
	    }
	    else{
	    	updateGradients(this, null);
	    }
	});
});
$('.table-responsive').on('scroll', function() {
	//If table content is scrollable
	if($(this).innerWidth() < $(this)[0].scrollWidth) {
		if($(this).scrollLeft() == 0){
	    	updateGradients(this, "rightGradient");
	    }	
		else if($(this).scrollLeft() + $(this).innerWidth() == $(this)[0].scrollWidth){
	    	updateGradients(this, "leftGradient");
	    }
		else{
			updateGradients(this, "bothGradients");
		}
	}
});
//For the 'View/Hide Search button' in My Saved Searches, which alters the table's scrollWidth
$('.nowrap.fieldHelp').click(function() {
	var table = $(this).closest('.table-responsive');
	if($(table).innerWidth() < $(table)[0].scrollWidth) {
		if ($(table).scrollLeft() == 0){
			updateGradients(table, "rightGradient");
		}
	}
	else {
		updateGradients(table, null);
	}
});

function updateGradients(table, gradientToAdd){
	$(table).removeClass("bothGradients");
	$(table).removeClass("rightGradient");
	$(table).removeClass("leftGradient");
	if (gradientToAdd != null){
		$(table).addClass(gradientToAdd);
	}
}
// Add gradient background to responsive tables when their content becomes scrollable(end)