// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

// The synth will be created after the user enters the garden
let synth;

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

function startNote(e){
    // find which button was pressed
    let buttonPressed = e.target;
    // find the note associated with the button
    let note = buttonPressed.dataset.note;
    // play the note
    synth.triggerAttack(note);
    // add visual feedback
    buttonPressed.classList.add("active");
}

function endNote(e){
    let buttonPressed = e.target;
    let note = buttonPressed.dataset.note;
    synth.triggerRelease(note);
    // remove visual feedback
    buttonPressed.classList.remove("active");
}

gardenButton.addEventListener("mousedown", startNote);
gardenButton.addEventListener("mouseup", endNote);
gardenButton.addEventListener("mouseleave", endNote);
