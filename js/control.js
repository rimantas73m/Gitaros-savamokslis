function CursorControl() {
			var self = this;
			
			self.onStart = function() {
				var svg = document.querySelector("#paper svg");
				var cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
				cursor.setAttribute("class", "abcjs-cursor");
				cursor.setAttributeNS(null, 'x1', 0);
				cursor.setAttributeNS(null, 'y1', 0);
				cursor.setAttributeNS(null, 'x2', 0);
				cursor.setAttributeNS(null, 'y2', 0);
				svg.appendChild(cursor);
			};
		
			self.onEvent = function(ev) {
				if (ev.measureStart && ev.left === null)
					return; // this was the second part of a tie across a measure line. Just ignore it.
				var lastSelection = document.querySelectorAll("#paper svg .highlight");
				for (var k = 0; k < lastSelection.length; k++)
					lastSelection[k].classList.remove("highlight");
				var el = document.querySelector.innerHTML = "<div class='label'>Current Note:</div>" + JSON.stringify(ev, null, 4);
				for (var i = 0; i < ev.elements.length; i++ ) {
					var note = ev.elements[i];
					for (var j = 0; j < note.length; j++) {
						note[j].classList.add("highlight");
					}
				}
				var cursor = document.querySelector("#paper svg .abcjs-cursor");
				if (cursor) {
					cursor.setAttribute("x1", ev.left - 2);
					cursor.setAttribute("x2", ev.left - 2);
					cursor.setAttribute("y1", ev.top);
					cursor.setAttribute("y2", ev.top + ev.height);
				}
			};
			self.onFinished = function() {
				var els = document.querySelectorAll("svg .highlight");
				for (var i = 0; i < els.length; i++ ) {
					els[i].classList.remove("highlight");
				}
			};
		}
		var cursorControl = new CursorControl();
		
		
		var tuneNames = [ "4Pamoka" ];
		var currentTune = 0;
	
		function clickListener(abcElem) {
			var output = "currentTrackMilliseconds: " + abcElem.currentTrackMilliseconds + "<br>" +
				"midiPitches: " + JSON.stringify(abcElem.midiPitches, null, 4) + "<br>" +
				"gracenotes: " + JSON.stringify(abcElem.gracenotes, null, 4) + "<br>" +
				"midiGraceNotePitches: " + JSON.stringify(abcElem.midiGraceNotePitches, null, 4) + "<br>";
		
				return;
			ABCJS.synth.playEvent(lastClicked, abcElem.midiGraceNotePitches, synthControl.visualObj.millisecondsPerMeasure()).then(function (response) {
				console.log("note played");
			}).catch(function (error) {
				console.log("error playing note", error);
			});
		}
		var abcOptions = {
			add_classes: true,
			clickListener: self.clickListener
		};
		function load() {
		
			document.querySelector(".start").addEventListener("click", start);
			if (ABCJS.synth.supportsAudio()) {
				synthControl = new ABCJS.synth.SynthController();
				synthControl.load("#audio", cursorControl, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
			} else {
				document.querySelector("#audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
			}
			setTune(false);
		}
		function download() {
			if (synthControl)
				synthControl.download(tuneNames[currentTune] + ".wav");
		}
		function start() {
			if (synthControl)
			
				synthControl.play();
		}
		function setTune(userAction) {
			var visualObj = ABCJS.renderAbc("paper", abc[currentTune], abcOptions)[0];
			// TODO-PER: This will allow the callback function to have access to timing info - this should be incorporated into the render at some point.
			var midiBuffer = new ABCJS.synth.CreateSynth();
			midiBuffer.init({ visualObj: visualObj });
			if (synthControl) {
				synthControl.setTune(visualObj, userAction).then(function (response) {
					console.log("Audio successfully loaded.")
				}).catch(function (error) {
					console.warn("Audio problem:", error);
				});
			}
		}
		