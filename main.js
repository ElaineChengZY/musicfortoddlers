// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

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



function playDataNote(e)
{
    console.log(e);
    let buttonClicked = e.target;
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
}


function endNote(e){
    // Do nothing if a note is not currently playing
    if(noteIsPlaying === false)
    {
        return;
    }

    let note = gardenButton.dataset.note;

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

