/*
 *  Html5 Form Plugin - jQuery plugin
 *  HTML5 form Validation form Internet Explorer & Firefox
 *  Version 1.2  / English
 *  
 *  originally written by Matias Mancini http://www.matiasmancini.com.ar
 * 
 *  Copyright (c) 2010 Matias Mancini (http://www.matiasmancini.com.ar)
 *  Dual licensed under the MIT (MIT-LICENSE.txt)
 *  and GPL (GPL-LICENSE.txt) licenses.
 *
 *  Built for jQuery library
 *	http://jquery.com
 *
 */
(function($) {
	$.fn.html5form = function(options) {
		
		$(this).each(function() {
			
			// Default configuration properties
			var defaults = {
				async : true,
				method : $(this).attr('method'), 
				responseDiv : null,
				labels : 'show',
				colorOn : '#000000', 
				colorOff : '#a1a1a1', 
				action : $(this).attr('action'),
				messages : false,
				emptyMessage : false,
				emailMessage : false,
				allBrowsers : false 
			};   
			var opts = $.extend({}, defaults, options);
			
			// Filters latest WebKit versions only 
			if(!opts.allBrowsers) {
				if($.browser.webkit && parseInt($.browser.version)>=533) {
					return false;
				}
			}
						
			// Private properties
			var form = $(this);
			var required = [];
			var email = [];
			
			// Feature detection properties
			var autofocus = supports_autofocus();
			var placeholder = supports_placeholder();

			// Setup color & placeholder function
			function fillInput(input) {
				if(input.attr('placeholder')) {
					input.val(input.attr('placeholder'));
					input.css('color', opts.colorOff);
					if($.browser.mozilla) {
						input.css('-moz-box-shadow', 'none');   
					}
				} else {
					if(!input.data('value')) {
						if(input.val()!='') {
							input.data('value', input.val());   
						}
					} else {
						input.val(input.data('value'));
					}   
					input.css('color', opts.colorOn);
				}
			}
			
			// Label hiding (if required)
			if(opts.labels == 'hide') {
				$(this).find('label').hide();   
			}
			
			// Select event handler (just colors)
			$.each($('select', this), function() {
				$(this).css('color', opts.colorOff);
				$(this).change(function(){
					$(this).css('color', opts.colorOn);
				});
			});
						
			// For each textarea & visible input excluding button, submit, radio, checkbox and select
			$.each($(':input:visible:not(:button, :submit, :radio, :checkbox, select)', form), function(i) {
				var that = $(this);
				var isTextarea = $('textarea').filter(this).length > 0;
				
				// Setting color & placeholder
				if(!placeholder || isTextarea) {
					fillInput(that);
				}
				
				// Make array of required inputs
				if(this.required !== true) {
					required[i] = that;
				}
				
				// Make array of Email inputs			   
				if(this.getAttribute('type') == 'email') {
					email[i] = that;
				}
				
				// Handle placeholder if not supported natively
				
				// FOCUS event attach 
				// If input value == placeholder attribute will clear the field
				// If input type == url will not
				// In both cases will change the color with colorOn property				 
				that.bind('focus', function(ev) {
					if(!placeholder || isTextarea) {
						// prevent autofocus to work
						//ev.preventDefault();
						if(this.value == that.attr('placeholder')) {
							if(this.getAttribute('type') != 'url') {
								that.attr('value', '');   
							}
						}
						that.css('color', opts.colorOn);
					} else {
						if(this.getAttribute('type') == 'url') {
							that.attr('value', that.attr('placeholder'));   
						}
					}
				});
				
				// BLUR event attach
				// If input value == empty calls fillInput fn
				// if input type == url and value == placeholder attribute calls fn too
				that.bind('blur', function(ev) {
					if(!placeholder || isTextarea) {
						ev.preventDefault();
						if(this.value == '') {
							fillInput(that);
						} else {
							if((this.getAttribute('type') == 'url') && (that.val() == that.attr('placeholder'))) {
								fillInput(that);
							}
						}
					} else {
						if((this.getAttribute('type') == 'url') && (that.val() == that.attr('placeholder'))) {
							fillInput(that);
						}
					}
				});
				
				// Limits content typing to TEXTAREA type fields according to attribute maxlength
				if(isTextarea) {
					if(that.attr('maxlength') > 0) {
						that.keypress(function(ev) {
							var cc = ev.charCode || ev.keyCode;
							if(cc == 37 || cc == 39) {
								return true;
							}
							if(cc == 8 || cc == 46) {
								return true;
							}
							if(this.value.length >= that.attr('maxlength')) {
								return false;   
							}
							else{
								return true;
							}
						});
					}
				}
			});
			
			// Handle autofocus on the first defined element
			if(!autofocus) {
				var autofocusField = form.find('[autofocus]').first();
				if(autofocusField.autofocus !== true) {
					autofocusField.focus();
				}
			}
			
			$.each($(':submit', this), function() {
				$(this).bind('click', function(ev) {
									   
					var emptyInput = null;
					var emailError = null;
					var input = $(':input:visible:not(:button, :submit, :radio, :checkbox, select)', form);					
					
					// Search for empty fields & value same as placeholder
					// returns first input founded
					// Add messages for multiple languages
					$(required).each(function(key, value) {
						if(typeof value === 'undefined') {
							return true;
						}
						if(($(this).val() == $(this).attr('placeholder')) || ($(this).val() == '')) {
							emptyInput = $(this);
							if(opts.emptyMessage) {
								// Customized empty message
								$(opts.responseDiv).html('<p>'+opts.emptyMessage+'</p>');
							}
							else if(opts.messages=='es'){
								// Spanish empty message
								$(opts.responseDiv).html('<p>El campo '+$(this).attr('title')+' es requerido.</p>');
							}
							else if(opts.messages=='en'){
								// English empty message
								$(opts.responseDiv).html('<p>The '+$(this).attr('title')+' field is required.</p>');
							}
							else if(opts.messages=='it'){
								// Italian empty message
								$(opts.responseDiv).html('<p>Il campo '+$(this).attr('title')+' Ã© richiesto.</p>');
							}
							else if(opts.messages=='de'){
								// German empty message
								$(opts.responseDiv).html('<p>'+$(this).attr('title')+' ist ein Pflichtfeld.</p>');
							}
							else if(opts.messages=='fr'){
								// French empty message
								$(opts.responseDiv).html('<p>Le champ '+$(this).attr('title')+' est requis.</p>');
							}
							else if(opts.messages=='nl' || opts.messages=='be'){
								// Dutch messages
								$(opts.responseDiv).html('<p>'+$(this).attr('title')+' is een verplicht veld.</p>');
							}					 
							return false;
						}
						return emptyInput;
					});
						
					// check email type inputs with regular expression
					// return first input founded
					$(email).each(function(key, value) {
						if(typeof value === 'undefined') {
							return true;
						}
						if($(this).val().search(/[\w-\.]{3,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/i)) {
							emailError = $(this);
							return false;
						}
						return emailError;
					});
					
					// Submit form ONLY if emptyInput & emailError are null
					// if async property is set to false, skip ajax
					if(!emptyInput && !emailError) {
						
						// Clear all empty value fields before Submit 
						$(input).each(function() {
							if($(this).val() == $(this).attr('placeholder')) {
								$(this).val('');
							}
						}); 
						
						// Submit data by Ajax
						if(opts.async) {
							var formData=$(form).serialize();
							$.ajax({
								url : opts.action,
								type : opts.method,
								data : formData,
								success : function(data){
									if(opts.responseDiv){
										$(opts.responseDiv).html(data);   
									}
									// Reset form
									$(input).val('');
									$.each(form[0], function(){
										fillInput($(this).not(':hidden, :button, :submit, :radio, :checkbox, select'));
										$('select', form).each(function(){
											$(this).css('color', opts.colorOff);
											$(this).children('option:eq(0)').attr('selected', 'selected');
										});
										$(':radio, :checkbox', form).removeAttr('checked');
									});  
								}
							});   
						} else {
							$(form).submit();
						}
					} else {
						if(emptyInput) {
							$(emptyInput).focus().select();			  
						}
						else if(emailError) {
							// Customized email error messages (Spanish, English, Italian, German, French, Dutch)
							if(opts.emailMessage) {
								$(opts.responseDiv).html('<p>'+opts.emailMessage+'</p>');
							}
							else if(opts.messages == 'es') {
								$(opts.responseDiv).html('<p>Ingrese una direcci&oacute;n de correo v&aacute;lida por favor.</p>');
							}
							else if(opts.messages == 'en') {
								$(opts.responseDiv).html('<p>Please type a valid email address.</p>');
							}
							else if(opts.messages == 'it') {
								$(opts.responseDiv).html("<p>L'indirizzo e-mail non &eacute; valido.</p>");
							}
							else if(opts.messages == 'de') {
								$(opts.responseDiv).html("<p>Bitte eine g&uuml;ltige E-Mail-Adresse eintragen.</p>");
							}
							else if(opts.messages == 'fr') {
								$(opts.responseDiv).html("<p>Entrez une adresse email valide s&rsquo;il vous plait.</p>");
							}
							else if(opts.messages == 'nl' || opts.messages == 'be') {
								$(opts.responseDiv).html('<p>Voert u alstublieft een geldig email adres in.</p>');
							}
							$(emailError).select();
						} else {
							alert('Unknown Error');						
						}
					}
					return false;
				});
			});
		});
	}
	
	// Feature detection utilities
	// Autofocus
	function supports_autofocus() {
		var i = document.createElement('input');
		return 'autofocus' in i;
	}
	
	function supports_placeholder() {
		var i = document.createElement('input');
		return 'placeholder' in i;
	}
})(jQuery);
