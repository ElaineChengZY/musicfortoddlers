// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogStartButton = document.getElementById("intro-dialog-start");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

// init our system
const synth = newTone.synth().toDestination();

// Dialog
introDialog.showModal();

//Tone
// Start the audio system, then close the dialog
async function toneInit()
{
    await Tone.start();
    introDialog.close();
}

// Play the note stored in the clicked button's data-note attribute
function playDataNote(e){

}