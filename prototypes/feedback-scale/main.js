// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

// init our system
const synth = new Tone.PolySynth();

// Dialog
introDialog.showModal();

//Tone
// Start the audio system, then close the dialog
async function toneInit()
{
    await Tone.start();
    synth.connect(Tone.Destination);
    introDialog.close();
}

// Initialise audio when the user enters the garden
introDialogCloseButton.addEventListener("click", toneInit);

// Play the note stored in the clicked button's data-note attribute
function playDataNote(e)
{
    let buttonClicked = e.target;
    let note = buttonClicked.dataset.note;
    synth.triggerAttackRelease(note, "4n");
}

// The click listener is no longer needed because the note is controlled by press and release
// gardenButton.addEventListener("click", playDataNote);

function startNote(e)
{
    // Find which button was pressed
    let keyPressed = e.target;
    // Find the note associated with the button
    let note = keyPressed.dataset.note;
    // Start playing the note
    synth.triggerAttack(note);
    // Add a class for visual feedback later
    keyPressed.classList.add("active");
}

function endNote(e)
{
    let keyPressed = e.target;
    let note = keyPressed.dataset.note;
    synth.triggerRelease(note);
    // Remove visual feedback
    keyPressed.classList.remove("active");
}

// Start, stop, and safely release the garden note
gardenButton.addEventListener("mousedown", startNote);
gardenButton.addEventListener("mouseup", endNote);
gardenButton.addEventListener("mouseleave", endNote);