
(function () {
    var style_sheet =
    '.output { ' +
    '    visibility: visible; ' +
    '    font-size:20px; ' +
    '    padding-top:10px; ' +
    '    padding-bottom:10px; ' +
    '    min-height: 20px; ' +
    '} ' +
    '.control_wrapper { ' +
    '} ' +
    '.control_wrapper label{ ' +
    '    width:60px; ' +
    '    display:inline-block; ' +
    '    text-align:right; ' +
    '} ' +
    '.control_wrapper span{ ' +
    '    width:60px; ' +
    '    display:inline-block;    ' +
    '    text-align:left; ' +
    '} ' +
    '.reader_controls:hover .control_wrapper { ' +
    '    visibility:visible; ' +
    '} ' +
    '.control_wrapper input[type=range]{ ' +
    ' width:100px; ' +
    '}'+
    '.control_wrapper input[type=button]{ ' +
    ' width:75px; ' +
    '}';


    var control_html =
        '<div class="output"></div>' +
        '<div class="control_wrapper">' +
        '<div class="button_bar">' +
        '<input type="button" class="start" value="To Start" />' +
        '<input type="button" class="play" value="Play" />' +
        '<input type="button" class="pause" value="Pause" />' +
        '<input type="button" class="close" value="Close" />' +
        '</div>' +
        '<div class="position_bar">' +
        '<label for="position_slider">Position</label>' +
        '<input type="range" name="position_slider" class="position_slider" min=0" max="1" value="0" />'+
        '<span class="show_position">0%</span>' +
        '</div>' +
        '<div class="speed_bar">' +
        '<label for="speed">Speed</label>' +
        '<input type="range" name="speed" class="speed" min="1" max="600" value="300" /> '+
        '<span class="wpm"></span>' +
        '</div>' +
        '<div class="font_size_bar">' +
        '<label for="font_size">Font Size</label>' +
        '<input type="range" name="fontsize" class="font_size" min="20" max="166" value="16" />'+
        '<span class="show_size">20px</span>' +
        '</div>';

    var applyStyle = function (el, style) {
        for (var s in style) {
            el.style[s] = style[s];
        }
        return el;
    }

    var queryforEach =function(query, func){
        return Array.prototype.forEach.call(
            document.querySelectorAll(query),
            func);
    }

    var appendStyleSheet = function(styles){
       var css = document.createElement('style');
      css.type = 'text/css';

      if (css.styleSheet) css.styleSheet.cssText = styles;
      else css.appendChild(document.createTextNode(styles));

      document.getElementsByTagName("head")[0].appendChild(css);
    }
    var Reader = function (text_el, layout, finish_callback) {
        "use strict";
        if (!this || this === window) {
            return new Reader(text_el, layout, finish_callback);
        }
        var controls = document.createElement('div');
        controls.classList.add('reader_controls');
        applyStyle(controls, {
            fontSize: '16px',
            textAlign: 'center',
            position: 'absolute',
            visibility: 'visible',
            backgroundColor:'rgba(255,255,255,0.95)'
        });
        controls.innerHTML = control_html;
        document.getElementsByTagName('body')[0].appendChild(controls);
        text_el.classList.add('source_text');

        applyStyle(controls, layout);
        var output = controls.getElementsByClassName('output')[0],
            bg = controls.getElementsByClassName("bg")[0],
            speed = controls.getElementsByClassName("speed")[0],
            toStart = controls.getElementsByClassName("start")[0],
            play = controls.getElementsByClassName("play")[0],
            pause = controls.getElementsByClassName("pause")[0],
            close = controls.getElementsByClassName("close")[0],
            wpm = controls.getElementsByClassName("wpm")[0],
            position_slider = controls.getElementsByClassName("position_slider")[0],
            font_size = controls.getElementsByClassName("font_size")[0],
            show_size = controls.getElementsByClassName("show_size")[0],
            show_position = controls.getElementsByClassName("show_position")[0],
            interval,
            text,
            processElement = function (el) {
                return {
                    array: el.textContent.replace(/^\s+|\s+$/g, '').split(' '),
                    position: 0
                };
            };
        this.showWord = function () {
            output.innerHTML = text.array[text.position];
            show_position.innerHTML = ((text.position/text.array.length*100)|0)+"%"
            position_slider.value = text.position;
        }.bind(this);

        this.showSpeed = function () {
            wpm.innerHTML = speed.value + " wpm";
        }.bind(this);

        this.readPosition = function () {
            text.position = position_slider.value|0;
            this.showWord();
            this.pauseReading();
        }.bind(this);

        this.changeFontSize = function () {
            output.style['font-size'] = font_size.value + 'px';
            show_size.innerHTML = font_size.value + 'px';
        }.bind(this);

        this.loop = function(){
            this.showWord();
            text.position = (text.position + 1) % text.array.length;
        }.bind(this);

        this.run = function () {
            this.pauseReading();
            this.showSpeed();
            interval = setInterval(this.loop, 1 / speed.value * 1000 * 60);
        }.bind(this);

        this.goToBeginning = function () {
            text.position = 0;
            output.innerHTML = text.array[text.position];
        }.bind(this);

        this.startReading = function () {
            this.run();
            pause.style.display='';
            play.style.display='none';
        }.bind(this);

        this.pauseReading = function () {
            clearInterval(interval);
            play.style.display='';
            pause.style.display='none';
        }.bind(this);

        this.change = function () {
            this.run();
        }.bind(this);

        this.listeners = function () {
            toStart.addEventListener("click", this.goToBeginning);
            play.addEventListener("click", this.startReading);
            pause.addEventListener("click", this.pauseReading);
            close.addEventListener("click", this.destroy);
            speed.addEventListener("change", this.change);
            position_slider.addEventListener("input", this.readPosition);
            font_size.addEventListener("change", this.changeFontSize);
        }.bind(this);

        this.destroy = function (event) {
            event.stopPropagation();
            this.pauseReading();
            text_el.classList.remove('source_text');
            controls.parentNode.removeChild(controls);
            if (finish_callback) {
                finish_callback();
            }
        }.bind(this);
        text = processElement(text_el);
        position_slider.max = text.array.length-1;
        this.listeners();
        this.showSpeed();
        this.pauseReading();
        this.goToBeginning();
        this.showWord();
    };


    var overlay, $el, reading;
    var clean = function () {
        if (overlay) {
            overlay.remove();
        }
    }
    appendStyleSheet(style_sheet);
    queryforEach('div:not(.hov_overlay),p:not(.hov_overlay)', function (node) {
        node.addEventListener('mouseenter', function (e) {
            if (reading) return;
            e.stopPropagation();
            clean();
            overlay = document.createElement('div');
            overlay.classList.add('hov_overlay');
            ;
            style = {
                'position': 'absolute',
                    'left': node.getBoundingClientRect().left + document.body.scrollLeft + "px",
                    'top': node.getBoundingClientRect().top + document.body.scrollTop + "px",
                    'width': node.offsetWidth + "px",
                    'height': node.offsetHeight + "px",
                    "box-shadow": "0 0 21px 10px #0F0",
                    "z-index": 14999,
                    "opacity": 0.5,
                    "display": "inline-block",
                    "pointer-events": "none",
                    "cursor": "pointer"
            };
            applyStyle(overlay, style);
            document.body.appendChild(overlay);
        });
        node.addEventListener('mouseleave', function (e) {
                if (reading) return
                e.stopPropagation();
                clean();
            });
        node.addEventListener('click', function () {
            if (reading) return;
            reading = Reader(node, {
                'left': node.getBoundingClientRect().left + document.body.scrollLeft+ "px",
                    'top': node.getBoundingClientRect().top + document.body.scrollTop+ "px",
                    'width': node.offsetWidth + "px"
            },
            function () {
                reading = null;
            });
            clean();
        });
    });
})();
