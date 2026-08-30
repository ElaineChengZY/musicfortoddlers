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

// Dialog
introDialog.showModal();

// Tone
// Start the audio system after a valid user action
async function toneInit()
{
    await Tone.start();
    synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "sawtooth"
    }
});

// Start with a soft, muffled sound
    filter = new Tone.Filter(700, "lowpass");

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
        700 + (percentageFromCentre * 2800);

    // Change the sound brightness
    filter.frequency.value = filterFrequency;
}

function startNote(e){
    // Find which button was pressed
    let buttonPressed = e.target;

    // Find the note associated with the button
    let note = buttonPressed.dataset.note;

    noteIsPlaying = true;

    // Set the starting timbre from the current cursor position
    changeTimbre(e);

    // Start playing the note
    synth.triggerAttack(note);

    // Add visual feedback
    buttonPressed.classList.add("active");

    // Track movement anywhere on the page
    document.addEventListener("mousemove", changeTimbre);
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

    noteIsPlaying = false;

    // Stop tracking movement
    document.removeEventListener("mousemove", changeTimbre);
}

gardenButton.addEventListener("mousedown", startNote);
document.addEventListener("mouseup", endNote);
document.addEventListener("mouseleave", endNote);
window.addEventListener("blur", endNote);
