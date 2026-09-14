// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");

// find the garden button
const gardenButton = document.getElementById ("garden-button");

// The synth will be created after the user enters the garden
let synth;

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

function startNote(e){
    // find which button was pressed
    let buttonPressed = e.target;
    // find the note associated with the button
    let note = buttonPressed.dataset.note;
    // play the note
    synth.triggerAttack(note);
    // add visual feedback
    buttonPressed.classList.add("active");

    // Start musical note feedback
    startMusicNotes();
}

function endNote(e){
    
    let buttonPressed = e.target;
    let note = buttonPressed.dataset.note;
    synth.triggerRelease(note);
    // remove visual feedback
    buttonPressed.classList.remove("active");
    // Stop creating new musical notes
    // Existing notes are NOT removed here
    stopMusicNotes();
}

gardenButton.addEventListener("mousedown", startNote);
gardenButton.addEventListener("mouseup", endNote);
gardenButton.addEventListener("mouseleave", endNote);
