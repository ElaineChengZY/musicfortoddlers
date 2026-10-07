// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

const flowerTarget = document.getElementById("flower-target");

let isNearTarget = false;

// The synth will be created after the user enters the garden
let synth;

// Keep track of dragging
let startPointerX = 0;
let startPointerY = 0;

let currentObjectX = 0;
let currentObjectY = 0;

let startObjectX = 0;
let startObjectY = 0;

// Used to keep the object inside the screen
let originalLeft = 0;
let originalTop = 0;
let objectWidth = 0;
let objectHeight = 0;
// Used to repeatedly create musical notes while holding
let noteInterval;


// Dialog
introDialog.showModal();

// Tone
// Start the audio system after a valid user action
async function toneInit()
{
    await Tone.start();

    synth = new Tone.PolySynth();
    synth.connect(Tone.Destination);

    introDialog.close();
}

// Run toneInit when Enter Garden is clicked
introDialogCloseButton.addEventListener("click", toneInit);

// Create one musical note
function createMusicNote()
{
    // Create a new span
    const musicNote = document.createElement("span");
    musicNote.classList.add("music-note");
    musicNote.setAttribute("aria-hidden", "true");

    // Rotate through different musical symbols
    const symbols = ["♪", "♫", "♪"];
    const positions = ["note-left", "note-middle", "note-right"];

    // Work out which note style to use
    const existingNotes = gardenButton.querySelectorAll(".music-note").length;
    const noteNumber = existingNotes % 3;

    musicNote.textContent = symbols[noteNumber];
    musicNote.classList.add(positions[noteNumber]);

    // Add the note to the button
    gardenButton.appendChild(musicNote);

    // Remove it only after its animation is completely finished
    musicNote.addEventListener("animationend", function()
    {
        musicNote.remove();
    });
}

// Start creating musical note feedback
function startMusicNotes()
{
    // Immediately create three notes when the user presses
    createMusicNote();
    createMusicNote();
    createMusicNote();

    // Continue creating notes while the button is held
    noteInterval = setInterval(function()
    {
        createMusicNote();
    }, 350);
}


// Stop creating NEW notes
function stopMusicNotes()
{
    clearInterval(noteInterval);
}





function playDataNote(e)
{
    console.log(e);
    let buttonClicked = e.currentTarget;
    let note = buttonClicked.dataset.note;
    synth.triggerAttackRelease(note, "8n");
}

// Keep track of whether the garden note is currently playing
let noteIsPlaying = false;

function pitchBend(e)
{
    // Find the cursor's horizontal position as a value from 0 to 1
    let percentageAcrossPage = e.clientX / window.innerWidth;

    // Convert the position into a range from -600 to +600 cents
    let detuneAmount = (percentageAcrossPage * 1200) - 600;

    // Change the pitch of the synth
    synth.set({
        detune: detuneAmount
    });
}

function startNote(e){
    // find which button was pressed
    let buttonPressed = e.target;
    // find the note associated with the button
    let note = buttonPressed.dataset.note;

    noteIsPlaying = true;

    // Remember where the pointer started
    startPointerX = e.clientX;
    startPointerY = e.clientY;

    // Remember where the object was before this drag
    startObjectX = currentObjectX;
    startObjectY = currentObjectY;

    // Record the object's original position and size
    let rect = gardenButton.getBoundingClientRect();

    originalLeft = rect.left - currentObjectX;
    originalTop = rect.top - currentObjectY;

    objectWidth = rect.width;
    objectHeight = rect.height;

      // Set the starting pitch using the current cursor position
    pitchBend(e);

    // play the note
    synth.triggerAttack(note);
    // add visual feedback
    gardenButton.classList.add("active");
    gardenButton.classList.add("dragging");

    // Start musical note feedback
    startMusicNotes(); 

    /// Keep receiving pointer events while dragging
    gardenButton.setPointerCapture(e.pointerId);
}

// Move garden object
function moveObject(e)
{
    if(noteIsPlaying === false)
    {
        return;
    }

    // Find how far the pointer moved
    let movementX =
        e.clientX - startPointerX;

    let movementY =
        e.clientY - startPointerY;

    // Work out the new position
    let newObjectX =
        startObjectX + movementX;

    let newObjectY =
        startObjectY + movementY;

    // Keep the object inside the visible browser area
    let minX = -originalLeft;

    let maxX =
        window.innerWidth
        - originalLeft
        - objectWidth;

    let minY = -originalTop;

    let maxY =
        window.innerHeight
        - originalTop
        - objectHeight;

    currentObjectX =
        Math.max(minX, Math.min(newObjectX, maxX));

    currentObjectY =
        Math.max(minY, Math.min(newObjectY, maxY));

    // Move the object visually in X and Y
    gardenButton.style.transform =
        `translate(${currentObjectX}px, ${currentObjectY}px)`;


    pitchBend(e);

    // Check whether the flower is close to the shadow
let flowerRect = gardenButton.getBoundingClientRect();
let targetRect = flowerTarget.getBoundingClientRect();

// Find the centre of the flower
let flowerCentreX =
    flowerRect.left + flowerRect.width / 2;

let flowerCentreY =
    flowerRect.top + flowerRect.height / 2;

// Find the centre of the shadow
let targetCentreX =
    targetRect.left + targetRect.width / 2;

let targetCentreY =
    targetRect.top + targetRect.height / 2;

// Measure the distance between them
let distance = Math.sqrt(
    Math.pow(flowerCentreX - targetCentreX, 2) +
    Math.pow(flowerCentreY - targetCentreY, 2)
);

// When the flower gets close to the target
if(distance < 50)
{
    isNearTarget = true;

    gardenButton.classList.add("near-target");
    flowerTarget.classList.add("ready");
}
else
{
    isNearTarget = false;

    gardenButton.classList.remove("near-target");
    flowerTarget.classList.remove("ready");
}
}


function endNote(e){
    // Do nothing if a note is not currently playing
    if(noteIsPlaying === false)
    {
        return;
    }

    let note = gardenButton.dataset.note;

    // Snap the flower into the shadow if it is close enough
if(isNearTarget === true)
{
    let targetRect = flowerTarget.getBoundingClientRect();

    let targetCentreX =
        targetRect.left + targetRect.width / 2;

    let targetCentreY =
        targetRect.top + targetRect.height / 2;

    // Work out the exact position needed
    // to centre the flower on the shadow
    currentObjectX =
        targetCentreX - originalLeft - objectWidth / 2;

    currentObjectY =
        targetCentreY - originalTop - objectHeight / 2;

    // Add snapping animation
    gardenButton.classList.add("snapping");

    gardenButton.style.transform =
        `translate(${currentObjectX}px, ${currentObjectY}px)`;

    gardenButton.classList.add("matched");
    flowerTarget.classList.add("matched");

    flowerTarget.classList.remove("ready");

    // Remove the snapping class after animation finishes
    setTimeout(function()
    {
        gardenButton.classList.remove("snapping");
    }, 200);
}

 // Start musical note feedback
    stopMusicNotes(); 

    // Stop the note
    synth.triggerRelease(note);

    // Remove visual feedback
    gardenButton.classList.remove("active");
    gardenButton.classList.remove("dragging");

    noteIsPlaying = false;

   // Release pointer capture
    if(gardenButton.hasPointerCapture(e.pointerId))
    {
        gardenButton.releasePointerCapture(e.pointerId);
    }
    
}

gardenButton.addEventListener("pointerdown", startNote);
gardenButton.addEventListener("pointermove", moveObject);
gardenButton.addEventListener("pointerup", endNote);
gardenButton.addEventListener("pointercancel", endNote);

