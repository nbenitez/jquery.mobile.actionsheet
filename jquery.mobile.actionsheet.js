/*
 * jquery.mobile.actionsheet v1
 *
 * Copyright (c) 2011, Stefan Gebhardt and Tobias Seelinger
 * Dual licensed under the MIT and GPL Version 2 licenses.
 * 
 * Date: 2011-05-03 17:11:00 (Tue, 3 May 2011)
 * Revision: 1.1
 */
(function($,window){
	$.widget("mobile.actionsheet",$.mobile.widget,{
		wallpaper: undefined,
		content: undefined,
		hidden: false,
		style: undefined,
		use_slide: false,
		_init: function() {
			var self = this;
			var hid = this.element.attr('data-sheethidden');
			if (typeof(hid) != 'undefined' && hid.toLowerCase() == 'true') {
				this.hidden = true;
			}
			this.style = this.element.attr('data-sheetstyle');
			hid = this.element.attr('data-sheetuseslide');
			if (typeof(hid) != 'undefined' && hid.toLowerCase() == 'true') {
				this.use_slide = true;
			}
			this.content = ((typeof this.element.jqmData('sheet') !== 'undefined')
				? $('#' + this.element.jqmData('sheet'))
				: this.element.next('div'))
				.addClass('ui-actionsheet-content');
			if( this.content.parents( ':jqmData(role="content")' ).length === 0 ) {
				// sheet-content is not part of the page-content,
				// maybe it's part of the page-header: move it to page-content!
				var currentContent = 
					this.content.parents(':jqmData(role="page")').children(':jqmData(role="content")');
				this.content.remove().appendTo(currentContent);
			}
			//setup command buttons
			this.content.find(':jqmData(role="button")').filter(':jqmData(rel!="close")')
				.addClass('ui-actionsheet-commandbtn')
				.bind('tap', function(){
					self.reset();
				});
			//setup close button
			this.content.find(':jqmData(rel="close")')
				.addClass('ui-actionsheet-closebtn')
				.bind('tap', function(){
					self.close();
				});
			this.element.bind('tap', function(){
				self.open();
			});
			if( this.element.parents( ':jqmData(role="content")' ).length !== 0 ) {
				this.element.buttonMarkup();
				if (this.hidden) {
					this.element.hide();
				} else {
					this.element.buttonMarkup();
				}
			}
			}
		},
		open: function() {
			this.element.unbind('tap'); //avoid twice opening
			
			var cc= this.content.parents(':jqmData(role="content")');
			this.wallpaper= $('<div>', {'class':'ui-actionsheet-wallpaper'})
				.appendTo(cc)
				.show();
 
			window.setTimeout(function(self) {
				self.wallpaper.bind('tap', function() {
					self.close();
				});
			}, 500, this);

			this._positionContent();

			$(window).bind('orientationchange.actionsheet',$.proxy(function () {
				this._positionContent();
			}, this));
			
			if( $.support.cssTransitions && !this.use_slide) {
				this.content.animationComplete(function(event) {
					$(event.target).removeClass("ui-actionsheet-animateIn");
				});
				this.content.addClass("ui-actionsheet-animateIn").show();
			} else {
				this.content.show("slide", { direction: "down" }, 400);
			}
		},
		close: function(cb) {
			var self = this;
			if (cb == null) {
				cb = function(){};
			}
			this.wallpaper.unbind('tap');
			$(window).unbind('orientationchange.actionsheet');
			if( $.support.cssTransitions && !this.use_slide) {
				this.content.addClass("ui-actionsheet-animateOut");
				this.wallpaper.remove();
				this.content.animationComplete(function() {
					self.reset
					cb();
				});
			} else {
				this.wallpaper.remove();
				if (this.use_slide) {
					this.content.hide("slide", { direction: "down" }, 400, cb);
				} else {
					this.content.fadeOut(400, cb);
				}
				this.element.bind('tap', function(){
					self.open();
				});
			}
		},
		reset: function() {
			this.wallpaper.remove();
			this.content
				.removeClass("ui-actionsheet-animateOut")
				.removeClass("ui-actionsheet-animateIn")
				.hide();
			var self= this;
			this.element.bind('tap', function(){
				self.open();
			});
		},
		is_opened: function() {
			return $('.ui-actionsheet-wallpaper').length > 0;
		},
		_positionContent: function() {
			var height = $(window).height(),
				width = $(window).width(),
				scrollPosition = $(window).scrollTop();
			if (typeof(this.style) != 'undefined' && this.style.toLowerCase() == 'android') {
				this.content.css({
					'top': (height - this.content.height()),
					'left': 0,
					'width': width
				});
			} else {
				this.content.css({
					'top': (scrollPosition + height / 2 - this.content.height() / 2),
					'left': (width / 2 - this.content.width() / 2)
				});
			}
		}
	});

	$( ":jqmData(role='page')" ).live( "pagecreate", function() { 
		$( ":jqmData(role='actionsheet')", this ).each(function() {
			$(this).actionsheet();
		});
	});

}) (jQuery,this);
