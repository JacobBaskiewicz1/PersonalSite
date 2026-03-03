var blip1 = new Audio('Assets/sound/blip/blipSelect.wav');
var blip2 = new Audio('Assets/sound/blip/blipSelect(1).wav');
var blip3 = new Audio('Assets/sound/blip/blipSelect(2).wav');
var blip4 = new Audio('Assets/sound/blip/blipSelect(3).wav');
var blip5 = new Audio('Assets/sound/blip/blipSelect(4).wav');
var blip6 = new Audio('Assets/sound/blip/blipSelect(5).wav');
var blip7 = new Audio('Assets/sound/blip/blipSelect(6).wav');
const blips = [blip1, blip2, blip3, blip4, blip5, blip6, blip7];

var bloop = new Audio("Assets/sound/other/bloop.wav");
bloop.volume = 0.4;

var hasBeenActivated = false;

(function(){
	document.addEventListener('DOMContentLoaded', function(){
		var yes = document.getElementById('blobbertChess');
		var img = document.getElementById('speechImg');
		var txtBox = document.getElementById('speechText');
            if (yes && img && txtBox) {
                yes.addEventListener('click', function(){
                    if(hasBeenActivated) return;
                    bloop.play();
                    hasBeenActivated = true;
                    img.classList.remove('hidden');
                    txtBox.classList.remove('hidden');
                    var text = "I don't know how to play chess! Check this out though";
                    typeText(txtBox, text);
                    // wait time to activate spin animation
                    var waitTime = 5;
                    setTimeout(function(){
                        var blobbert = document.getElementById('blobbert');
                        if (blobbert) {
                            blobbert.classList.add('spin');
                            setTimeout(function(){ blobbert.classList.remove('spin'); }, 4000);
                        }
                    }, Math.round(waitTime * 1000));
                });
            }

            var projectTabs = document.querySelectorAll('.project-tab');
            var projectSections = document.querySelectorAll('.project-section');
            if (projectTabs.length && projectSections.length) {
                var activateTab = function(targetId){
                    projectTabs.forEach(function(tab){
                        var isActive = tab.dataset.target === targetId;
                        tab.classList.toggle('active', isActive);
                        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    });
                    projectSections.forEach(function(section){
                        section.classList.toggle('active', section.id === targetId);
                    });
                };

                projectTabs.forEach(function(tab){
                    tab.addEventListener('click', function(){
                        activateTab(tab.dataset.target);
                    });
                    tab.addEventListener('keydown', function(event){
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            activateTab(tab.dataset.target);
                        }
                    });
                });

                var initialTarget = window.location.hash.replace('#', '');
                if (initialTarget) {
                    activateTab(initialTarget);
                }
            }

            var playplaceImage = document.getElementById('playplaceCarouselImage');
            var playplacePrev = document.getElementById('playplacePrev');
            var playplaceNext = document.getElementById('playplaceNext');
            if (playplaceImage && playplacePrev && playplaceNext) {
                var playplaceImages = [
                    'Assets/Playplace/1.png',
                    'Assets/Playplace/2.png',
                    'Assets/Playplace/3.png',
                    'Assets/Playplace/4.png',
                    'Assets/Playplace/5.png'
                ];
                var playplaceIndex = 0;

                var updatePlayplaceImage = function(){
                    playplaceImage.src = playplaceImages[playplaceIndex];
                };

                playplacePrev.addEventListener('click', function(){
                    playplaceIndex = (playplaceIndex - 1 + playplaceImages.length) % playplaceImages.length;
                    updatePlayplaceImage();
                });

                playplaceNext.addEventListener('click', function(){
                    playplaceIndex = (playplaceIndex + 1) % playplaceImages.length;
                    updatePlayplaceImage();
                });
            }

            var unauthorizedImage = document.getElementById('unauthorizedCarouselImage');
            var unauthorizedPrev = document.getElementById('unauthorizedPrev');
            var unauthorizedNext = document.getElementById('unauthorizedNext');
            if (unauthorizedImage && unauthorizedPrev && unauthorizedNext) {
                var unauthorizedImages = [
                    'Assets/Unauthorized/1.jpg',
                    'Assets/Unauthorized/2.png',
                    'Assets/Unauthorized/3.png',
                    'Assets/Unauthorized/4.png'
                ];
                var unauthorizedIndex = 0;

                var updateUnauthorizedImage = function(){
                    unauthorizedImage.src = unauthorizedImages[unauthorizedIndex];
                };

                unauthorizedPrev.addEventListener('click', function(){
                    unauthorizedIndex = (unauthorizedIndex - 1 + unauthorizedImages.length) % unauthorizedImages.length;
                    updateUnauthorizedImage();
                });

                unauthorizedNext.addEventListener('click', function(){
                    unauthorizedIndex = (unauthorizedIndex + 1) % unauthorizedImages.length;
                    updateUnauthorizedImage();
                });
            }
	});
})();

function typeText(element, text) {
    var speed = 70; // type at 60ms per char
    element.textContent = '';
    var index = 0;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
            const randomInt = Math.floor(Math.random() * (7 - 1 + 1));
            console.log(randomInt);
            const blipToPlay = blips[randomInt];
            blipToPlay.volume = 0.2;
            blipToPlay.play();
        }
    }
    
    type();
}

