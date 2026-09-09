// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

// The synth will be created after the user enters the garden
let synth;

//keep track of whether the garden note is currently playing
let noteIsPlaying = false;

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

function changeVolume(e){
    //find the cursor's vertical postiion
    //top of page =0
    //bottom of page =1
    let percentageDownPage = e.clientY / window.innerHeight;
    // Convert vertical position into volume
    //
    // Top = 0 dB
    // Middle = about -6 dB
    // Bottom = -12 dB
    let volumeAmount = 0 - (percentageDownPage * 12);

    // Change the synth volume
    synth.volume.value = volumeAmount;

}

function startNote(e){
    // find which button was pressed
    let buttonPressed = e.target;
    // find the note associated with the button
    let note = buttonPressed.dataset.note;

    // note is playing
    noteIsPlaying = true;

    // Set the starting volume based on
    // the current vertical cursor position
    changeVolume(e);

    // play the note
    synth.triggerAttack(note);
    // add visual feedback
    buttonPressed.classList.add("active");
    // Track vertical mouse movement anywhere on the page
    document.addEventListener("mousemove", changeVolume);
}

function endNote(e){
    // Do nothing if a note is not currently playing
    if(noteIsPlaying === false)
    {
        return;
    }

    let note = gardenButton.dataset.note;
    synth.triggerRelease(note);
    // remove visual feedback
    gardenButton.classList.remove("active");
    // Note is no longer playing
    noteIsPlaying = false;

    // Stop tracking mouse movement
    document.removeEventListener("mousemove", changeVolume);
}

gardenButton.addEventListener("mousedown", startNote);
document.addEventListener("mouseup", endNote);
document.addEventListener("mouseleave", endNote);
window.addEventListener("blur", endNote);
