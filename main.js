// browser loads html page > browser load js > open the dialog > user closes dialog > audio system loads > user click sound button

// find our dialog
const introDialog = document.getElementById("intro-dialog");
//find the close button
const introDialogCloseButton = document.getElementById("intro-dialog-close");
const assetTray = document.querySelector(".asset-tray");
const garden = document.querySelector(".garden");

// The synth will be created after the user enters the garden
let synth;
let activeObject = null;
const layoutUpdates = [];

// These are the existing target centres on the original background.
const positions = {
    flower: { x: 0.87, y: 0.75 },
    bee: { x: 0.24, y: 0.32 },
    bird: { x: 0.50, y: 0.22 },
    ladybug: { x: 0.21, y: 0.62 },
    snail: { x: 0.64, y: 0.84 },

    "purple-flower": { x: 0.46, y: 0.73 },
    "pink-tulip": { x: 0.66, y: 0.60 },
    butterfly: { x: 0.80, y: 0.34 },

    log: { x: 0.13, y: 0.79 },
    mushrooms: { x: 0.31, y: 0.84 },
    pond: { x: 0.52, y: 0.60 },
    rocks: { x: 0.37, y: 0.52 },

    "white-daisy": { x: 0.10, y: 0.56 },
    "pink-flower-bush": { x: 0.86, y: 0.53 },
    fence: { x: 0.52, y: 0.46 }
};

// Dialog
introDialog.showModal();
introDialog.addEventListener("cancel", function(e)
{
    // Keep the entry button available until audio has started.
    if (!synth) e.preventDefault();
});

// Tone
// Start the audio system after a valid user action
async function toneInit()
{
    introDialogCloseButton.disabled = true;
    try
    {
        await Tone.start();
        synth = new Tone.PolySynth();
        synth.connect(Tone.Destination);
        introDialog.close();
    }
    catch (error)
    {
        introDialog.querySelector("p").textContent =
            "Audio could not start. Check your connection and try again.";
        console.error(error);
    }
    finally
    {
        introDialogCloseButton.disabled = false;
    }
}

// Run toneInit when Enter Garden is clicked
introDialogCloseButton.addEventListener("click", toneInit);

// find the garden button
document.querySelectorAll(".garden-object").forEach(function(gardenButton)
{

const matchingTarget = document.querySelector(
    `.target[data-match="${gardenButton.dataset.match}"]`
);
const position = positions[gardenButton.dataset.match];

/*
    Keep a small slot in the tray when its object moves into the garden.
    This prevents the other objects and the scroll position from jumping.
    */
    const traySlot = document.createElement("div");
    traySlot.className = "tray-slot";
    gardenButton.before(traySlot);
    traySlot.appendChild(gardenButton);

    let pointerId = null;
    let startPointerX = 0;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;
    let wasMatched = false;
    // Remember where a matched object is placed on the background.
    let placedPosition = null;
    let noteInterval;
    let noteNumber = 0;
    let snapTimer;


// Create one musical note
 function createMusicNote()
    {
        const musicNote = document.createElement("span");
        const symbols = ["♪", "♫", "♪"];
        const directions = ["note-left", "note-middle", "note-right"];
        const index = noteNumber % symbols.length;
        noteNumber += 1;

        musicNote.classList.add("music-note", directions[index]);
        musicNote.setAttribute("aria-hidden", "true");
        musicNote.textContent = symbols[index];
        gardenButton.appendChild(musicNote);
        musicNote.addEventListener("animationend", function()
        {
            musicNote.remove();
        }, { once: true });
    }

// Start creating musical note feedback
function startMusicNotes()
{
    // Immediately create three notes when the user presses
    createMusicNote();
    createMusicNote();
    createMusicNote();

    // Continue creating notes while the button is held
    noteInterval = setInterval(createMusicNote, 350);
}


// Stop creating NEW notes
function stopMusicNotes()
{
    clearInterval(noteInterval);
}

/*
    Left and right movement changes pitch relative to the object's base note.
    Starting each drag at zero detune preserves the identity of each object.
    */
    function pitchBend(e)
    {
        const movementX = e.clientX - startPointerX;
        let detuneAmount = movementX / window.innerWidth * 1200;
        detuneAmount = Math.max(-600, Math.min(detuneAmount, 600));
        synth.set({ detune: detuneAmount });
    }

    function moveToPointer(e)
    {
        const width = gardenButton.offsetWidth;
        const height = gardenButton.offsetHeight;
        const maxX = Math.max(0, window.innerWidth - width);
        const maxY = Math.max(0, window.innerHeight - height);
        const left = Math.max(0, Math.min(e.clientX - pointerOffsetX, maxX));
        const top = Math.max(0, Math.min(e.clientY - pointerOffsetY, maxY));

        gardenButton.style.left = `${left}px`;
        gardenButton.style.top = `${top}px`;
    }

    function isNearTarget()
    {
        const objectRect = gardenButton.getBoundingClientRect();
        const targetRect = matchingTarget.getBoundingClientRect();
        const differenceX =
            objectRect.left + objectRect.width / 2
            - targetRect.left - targetRect.width / 2;
        const differenceY =
            objectRect.top + objectRect.height / 2
            - targetRect.top - targetRect.height / 2;

        // Allow a more forgiving drop distance for young children.
        return Math.hypot(differenceX, differenceY) < 80;
    }

    function alignToTarget()
    {
        const rect = matchingTarget.getBoundingClientRect();
        gardenButton.style.left =
            `${rect.left + rect.width / 2 - gardenButton.offsetWidth / 2}px`;
        gardenButton.style.top =
            `${rect.top + rect.height / 2 - gardenButton.offsetHeight / 2}px`;
    }

    function startNote(e)
    {
        if (!synth || activeObject !== null || e.button !== 0) return;

        e.preventDefault();
        clearTimeout(snapTimer);
        gardenButton.classList.remove("snapping");

        const rect = gardenButton.getBoundingClientRect();
        const grabX = (e.clientX - rect.left) / rect.width;
        const grabY = (e.clientY - rect.top) / rect.height;
        wasMatched = gardenButton.classList.contains("matched");

         /*
        Move the actual button outside the scrolling tray before capturing
        the pointer. It can then cross into the garden without being clipped.
        */
        document.body.appendChild(gardenButton);
        gardenButton.classList.add("floating");
        gardenButton.classList.remove("matched", "near-target");
        pointerOffsetX = grabX * gardenButton.offsetWidth;
        pointerOffsetY = grabY * gardenButton.offsetHeight;
        startPointerX = e.clientX;
        pointerId = e.pointerId;
        activeObject = gardenButton;

        moveToPointer(e);
        pitchBend(e);
        synth.triggerAttack(gardenButton.dataset.note);
        gardenButton.classList.add("active", "dragging");
        startMusicNotes();
        gardenButton.setPointerCapture(pointerId);
    }

// Move garden object
function moveObject(e)
    {
        if (e.pointerId !== pointerId) return;

        moveToPointer(e);
        pitchBend(e);
        const nearTarget = isNearTarget();
        gardenButton.classList.toggle("near-target", nearTarget);
        matchingTarget.classList.toggle("ready", nearTarget);
    }

    /*
Keep the object inside the garden and remember its position
relative to the original background image.
*/
function rememberPlacement()
{
    const gardenRect = garden.getBoundingClientRect();
    const objectRect = gardenButton.getBoundingClientRect();
    const width = gardenButton.offsetWidth;
    const height = gardenButton.offsetHeight;

    const left = Math.max(
        0,
        Math.min(objectRect.left - gardenRect.left, gardenRect.width - width)
    );

    const top = Math.max(
        0,
        Math.min(objectRect.top - gardenRect.top, gardenRect.height - height)
    );

    gardenButton.style.left = `${gardenRect.left + left}px`;
    gardenButton.style.top = `${gardenRect.top + top}px`;

    const scale = Math.max(gardenRect.width / 1920, gardenRect.height / 1080);
    const cropX = (1920 * scale - gardenRect.width) / 2;
    const cropY = (1080 * scale - gardenRect.height) / 2;

    placedPosition = {
        x: (left + width / 2 + cropX) / (1920 * scale),
        y: (top + height / 2 + cropY) / (1080 * scale)
    };
}

    
    

    function finishDrag(allowMatch)
    {
        if (pointerId === null) return;

        const matchedNow = allowMatch && isNearTarget();
        const releasedPointerId = pointerId;
        pointerId = null;
        activeObject = null;
        stopMusicNotes();
        synth.releaseAll();
        gardenButton.classList.remove("active", "dragging", "near-target");
        matchingTarget.classList.remove("ready");

        if (gardenButton.hasPointerCapture(releasedPointerId))
        {
            gardenButton.releasePointerCapture(releasedPointerId);
        }

      if (wasMatched)
{
    // Previously matched objects can be placed anywhere in the garden.
    gardenButton.classList.add("matched");
    rememberPlacement();
}
else if (matchedNow)
{
    // The first successful match still snaps to the shadow.
    gardenButton.classList.add("matched");
    matchingTarget.classList.add("matched");

    alignToTarget();
    rememberPlacement();
}
        else
        {
            // An unmatched object returns to its small slot after a missed drop.
            traySlot.appendChild(gardenButton);
            gardenButton.classList.remove("floating", "matched");
            gardenButton.style.left = "";
            gardenButton.style.top = "";
            gardenButton.querySelectorAll(".music-note").forEach(function(note)
            {
                note.remove();
            });
        }
    }

    function endNote(e)
    {
        if (e.pointerId !== pointerId) return;
        if (e.type === "pointerup") moveToPointer(e);
        finishDrag(e.type === "pointerup");
    }

    /*
    Match the background's centred cover scaling and keep targets visible.
    Matched buttons use viewport coordinates outside the scrolling tray.
    */
    function updateGardenLayout()
    {
        if (pointerId !== null) finishDrag(false);
        clearTimeout(snapTimer);
        gardenButton.classList.remove("snapping", "near-target");
        matchingTarget.classList.remove("ready");

        const gardenWidth = garden.clientWidth;
        const gardenHeight = garden.clientHeight;
        const scale = Math.max(gardenWidth / 1920, gardenHeight / 1080);
        const cropX = (1920 * scale - gardenWidth) / 2;
        const cropY = (1080 * scale - gardenHeight) / 2;
        const targetWidth = matchingTarget.offsetWidth;
        const targetHeight = matchingTarget.offsetHeight;

        let left = position.x * 1920 * scale - cropX - targetWidth / 2;
        let top = position.y * 1080 * scale - cropY - targetHeight / 2;
        left = Math.max(0, Math.min(left, Math.max(0, gardenWidth - targetWidth)));
        top = Math.max(0, Math.min(top, Math.max(0, gardenHeight - targetHeight)));

        matchingTarget.style.right = "auto";
        matchingTarget.style.left = `${left}px`;
        matchingTarget.style.top = `${top}px`;

        if (gardenButton.classList.contains("matched") && placedPosition)
{
    const gardenRect = garden.getBoundingClientRect();
    const width = gardenButton.offsetWidth;
    const height = gardenButton.offsetHeight;

    let placedLeft =
        placedPosition.x * 1920 * scale - cropX - width / 2;

    let placedTop =
        placedPosition.y * 1080 * scale - cropY - height / 2;

    placedLeft = Math.max(
        0,
        Math.min(placedLeft, gardenWidth - width)
    );

    placedTop = Math.max(
        0,
        Math.min(placedTop, gardenHeight - height)
    );

    gardenButton.style.left = `${gardenRect.left + placedLeft}px`;
    gardenButton.style.top = `${gardenRect.top + placedTop}px`;
}
    }

    layoutUpdates.push(updateGardenLayout);
    gardenButton.addEventListener("pointerdown", startNote);
    gardenButton.addEventListener("pointermove", moveObject);
    gardenButton.addEventListener("pointerup", endNote);
    gardenButton.addEventListener("pointercancel", endNote);
    gardenButton.addEventListener("lostpointercapture", function()
    {
        finishDrag(false);
    });
    window.addEventListener("blur", function()
    {
        finishDrag(false);
    });
});

/*
Measure the real tray height, including the browser's scrollbar.
This keeps the garden flush with the tray on different desktop systems.
*/
function updateAllLayouts()
{
    document.documentElement.style.setProperty(
        "--tray-height", `${assetTray.offsetHeight}px`
    );
    layoutUpdates.forEach(function(updateLayout)
    {
        updateLayout();
    });
}

updateAllLayouts();
window.addEventListener("resize", updateAllLayouts);
const trayObserver = new ResizeObserver(updateAllLayouts);
trayObserver.observe(assetTray);

// A regular mouse wheel also lets desktop users browse the horizontal tray.
assetTray.addEventListener("wheel", function(e)
{
    if (e.ctrlKey || assetTray.scrollWidth <= assetTray.clientWidth) return;
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;

    let movement = e.deltaY;
    if (e.deltaMode === 1) movement *= 16;
    if (e.deltaMode === 2) movement *= assetTray.clientWidth;
    const previousScroll = assetTray.scrollLeft;
    assetTray.scrollLeft += movement;
    if (assetTray.scrollLeft !== previousScroll) e.preventDefault();
}, { passive: false });
