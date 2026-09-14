// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

// The synth will be created after the user enters the garden
let synth;
let filter;
let noteIsPlaying = false;

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
    synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "triangle"
    },
    envelope: {
            attack: 0.08,
            decay: 0.1,
            sustain: 0.7,
            release: 0.3
    }
});

// Start with a soft, muffled sound
    filter = new Tone.Filter(300, "lowpass");

// Make the timbre change easier to hear
filter.Q.value = 1.5;

// Sound travels from the synth, through the filter, to the speakers
    synth.connect(filter);
    filter.connect(Tone.Destination);

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


function changeTimbre(e)
{
    // Find the centre of the page
    let centreX = window.innerWidth / 2;
    let centreY = window.innerHeight / 2;

    // Measure the cursor's distance from the centre
    let distanceX = e.clientX - centreX;
    let distanceY = e.clientY - centreY;

    let distanceFromCentre = Math.sqrt(
        (distanceX * distanceX) +
        (distanceY * distanceY)
    );

    // Use half of the shortest screen dimension as the maximum distance
    let maximumDistance =
        Math.min(window.innerWidth, window.innerHeight) / 2;

    // Convert the distance into a value from 0 to 1
    let percentageFromCentre =
        distanceFromCentre / maximumDistance;

    // Prevent the value from becoming greater than 1
    percentageFromCentre =
        Math.min(percentageFromCentre, 1);

    // Convert the position into a filter range from 300 Hz to 5000 Hz
    let filterFrequency =
        300 + (percentageFromCentre * 3700);

    // Change the sound brightness
    filter.frequency.value = filterFrequency;
}

function startNote(e){
    // Find which button was pressed
    let buttonPressed = e.target;

    // Find the note associated with the button
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

    // Set the starting timbre from the current cursor position
    changeTimbre(e);

    // Start playing the note
    synth.triggerAttack(note);

    // Add visual feedback
    gardenButton.classList.add("active");
    gardenButton.classList.add("dragging");

      // Keep receiving pointer events while dragging
    gardenButton.setPointerCapture(e.pointerId);
}

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

    // Work out the object's new position
    let newObjectX =
        startObjectX + movementX;

    let newObjectY =
        startObjectY + movementY;

    // Keep object inside the visible screen
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

    // Move the object visually
    gardenButton.style.transform =
        `translate(${currentObjectX}px, ${currentObjectY}px)`;

    // Distance from centre changes timbre
    changeTimbre(e);
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
