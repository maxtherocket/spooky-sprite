var SpookyEl = require('spooky-element');
var mixes = require('mixes');
var extend = require('extend');
var gsap = require('gsap');
var ModifiersPlugin = require('gsap/src/minified/plugins/ModifiersPlugin.min');
var prefix = require('prefix');

var applyPrefix = function(obj, prop, val){
	obj[prop] = val;
	obj[prefix(propr)] = val;
}

var Controller = function(el){
	this._frame = 0;
	this.el = el;
};
mixes(Controller, {

	frame: {
		set: function(val){
			this._frame = val;
			if (this.el.frames){
				var frameData = this.el.frames[this._frame];
				if (frameData){
					var cssObj = {};
					if (this.el.width && this.el.height){
						if (this.el.data.stretch){
							var scaleX = this.el.width / frameData.frame.w;
							var scaleY = this.el.height / frameData.frame.h;

							cssObj[this.el.propertyPrefix+'Position'] = (-frameData.frame.x*scaleX)+'px' + ' ' + (-frameData.frame.y*scaleY)+'px';
							cssObj[this.el.propertyPrefix+'Size'] = (this.el.meta.size.w*scaleX)+'px' + ' ' + (this.el.meta.size.h*scaleY)+'px';
						}
					} else {
						cssObj = {
							backgroundPosition: (-frameData.frame.x)+'px' + ' ' + (-frameData.frame.y)+'px',
							width: (frameData.frame.w)+'px',
							height: (frameData.frame.h)+'px',
						};
					}
					this.el.css(cssObj);
				}
			}
		},
		get: function(){
			return this._frame;
		}
	}

});

var SpookySprite = function(el, data){
	
		data = extend({
			fps: 24,
			stretch: true
		}, data);

    SpookyEl.call(this, el);

    this.data = data;
    this._frame = 0;

    this.width = this.data.width;
    this.height = this.data.height;

    if (this.data.mask){
    	this.maskMode = true;
    	this.propertyPrefix = 'mask';
    	this.view = (this.data.mask._isSpookyElement) ? this.data.mask.view : this.data.mask;
    } else {
    	this.propertyPrefix = 'background';
    }

    console.log('data:', data);

    this.loop = this.loop.bind(this);

    if (this.data.data){
    	this.frames = this.data.data.frames;
    	this.meta = this.data.data.meta;
    	this.totalFrames = this.frames.length;
    }
    if (this.view && this.data.sprite){
    	console.log('this.view:', this.view);
    	var cssObj = {};
    	cssObj[this.propertyPrefix+'Image'] = 'url('+this.data.sprite+')';
    	cssObj[this.propertyPrefix+'Repeat'] = 'no-repeat';
    	cssObj[this.propertyPrefix+'Position'] = '0px 0px';
    	cssObj[this.propertyPrefix+'Size'] = this.meta.size.w+'px' + ' ' + this.meta.size.h+'px';
    	if (!this.maskMode){
    		cssObj['overflow'] = 'hidden';
    	}
    	this.css(cssObj);
    }

    // Go to the first frame
    if (this.frames){
    	this.frame = 0;
    }

    this.controller = new Controller(this);

}
SpookySprite.prototype = Object.create(SpookyEl.prototype);

mixes(SpookySprite, {

	// "frame": {
	//     "x": 3840,
	//     "y": 2880,
	//     "w": 1280,
	//     "h": 720
	// },

	loop: function(dt){

	},

	play: function(loop, onComplete, ease){
		ease = ease || Linear.easeNone;
		this.playTimeline = gsap.fromTo(this.controller, this.totalFrames/this.data.fps, {frame:0}, {frame:this.totalFrames-1, ease:ease, onComplete:onComplete, modifiers:{
			frame: function(val){
				return Math.round(val);
			}
		}});
		if (loop){
			this.playTimeline.repeat(-1);
		}
	},

	pause: function(){
		if (this.playTimeline){
			this.playTimeline.paused(true);
		}
	},

	destroy: function(){
		if (this.playTimeline){
			this.playTimeline.kill();
		}
		if (!this.maskMode){
			this.remove();
		}
	},

	resize: function(w,h){
		this.width = w;
		this.height = h;
		if (!this.maskMode){
			this.css({
				width: this.width,
				height: this.height
			});
		}
	}

});

module.exports = SpookySprite;