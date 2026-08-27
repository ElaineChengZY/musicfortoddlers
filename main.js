// browser loads HTML > dialog opens > user enters garden > audio starts > garden button plays a note

// Find our intro dialog and its start button
const introDialog = document.getElementById("intro-dialog");
const introDialogStartButton = document.getElementById("intro-dialog-start");

// Find the temporary garden button
const gardenButton = document.getElementById("garden-button");

// Initialise one simple synthesizer and connect it to the speakers
const synth = new Tone.Synth().toDestination();

// Dialog
introDialog.showModal();

// Tone
// Start the audio system, then close the dialog
async function toneInit()
{
    await Tone.start();
    introDialog.close();
}

// Play the note stored in the clicked button's data-note attribute
function playDataNote(e)
{
    const buttonClicked = e.target;
    const note = buttonClicked.dataset.note;
    synth.triggerAttackRelease(note, "4n");
}

// Initialise audio when the user enters the garden
introDialogStartButton.addEventListener("click", toneInit);

// Run playDataNote when the garden button is clicked
gardenButton.addEventListener("click", playDataNote);
