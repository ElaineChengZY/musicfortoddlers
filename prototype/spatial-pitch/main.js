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

      // Set the starting pitch using the current cursor position
    pitchBend(e);

    // play the note
    synth.triggerAttack(note);
    // add visual feedback
    buttonPressed.classList.add("active");

    // Track horizontal movement anywhere on the page
    document.addEventListener("mousemove", pitchBend);
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
    document.removeEventListener("mousemove", pitchBend);
}

gardenButton.addEventListener("mousedown", startNote);
document.addEventListener("mouseup", endNote);
document.addEventListener("mouseleave", endNote);
