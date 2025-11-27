// LRU Page Replacement Simulation Script

// Get reference to simulation area
const simulationArea = document.getElementById("simulationArea");

// Pre-fill with placeholders (15 columns)
for (let i = 0; i < 15; i++) {

    // Create placeholder column
    const col = document.createElement("div");

    // Add classes and inner HTML
    col.classList.add("column", "placeholder");

    // Placeholder content
    col.innerHTML = `
        <div class="refTitle">Ref: -</div> 
        <div class="framesBox"></div> 
        <div class="status">-</div> 
    `;

    // Append to simulation area
    simulationArea.appendChild(col);
}

// Parse input references (numbers or strings)
function parseReferences(input) {

    // Split by spaces or commas, filter out empty strings, convert to numbers if possible
    return input
        .split(/[\s,]+/) // Split by spaces or commas
        .filter(x => x !== "") // Remove empty strings
        .map(x => isNaN(x) ? x : Number(x)); // Convert to number if possible
}

// Handle simulate button click
document.getElementById("simulateBtn").addEventListener("click", () => {

    // Get and validate inputs
    const raw = document.getElementById("references").value.trim();

    // Show popup if reference string is empty
    if (!raw) {
        showPopup("Enter a reference string!");
        return;
    }

    // Parse references and frames
    const references = parseReferences(raw);
    const frames = parseInt(document.getElementById("frames").value);

    // Validate frames input and show popup if invalid number of pages is entered
    if (isNaN(frames) || frames <= 0) {
        showPopup("Enter a valid number of pages!");
        return;
    }

    // Start LRU simulation
    simulateLRU(references, frames);
});

// Allow Enter key to trigger simulation
document.addEventListener("keypress", function (e) {

    // Check if Enter key is pressed
    if (e.key === "Enter") {

        // Trigger simulate button click
        document.getElementById("simulateBtn").click();
    }
});

// Sleep function for delays
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// LRU Simulation Function
async function simulateLRU(refs, frames) {

    // Reset memory and counters
    const memory = [];

    // Track usage order for LRU
    const usedRecently = new Map();

    // Hit and miss counters
    let hits = 0, misses = 0;

    // Get simulation container
    const container = document.getElementById("simulationArea");

    // Clear previous content
    container.innerHTML = "";

    // Pre-create columns
    const columns = refs.map(ref => {

        // Create column element
        const col = document.createElement("div");

        // Add class
        col.classList.add("column");

        // Column content
        col.innerHTML = `
            <div class="refTitle">Ref: <b>${ref}</b></div>
            <div class="framesBox"></div>
            <div class="status"></div>
        `;

        // Append to container
        container.appendChild(col);

        return col;
    });

    // Simulate each reference
    for (let step = 0; step < refs.length; step++) {

        // Current reference and column
        const ref = refs[step];
        const col = columns[step];

        // Highlight current column
        columns.forEach(c => c.classList.remove("active"));
        col.classList.add("active");

        // Scroll automatically
        col.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

        // Store memory state before update
        const before = [...memory];
        let isHit = memory.includes(ref);

        // LRU Logic
        if (isHit) {

            // It's a hit
            hits++;

            // Update usage order
            usedRecently.delete(ref);

            // Mark as recently used
            usedRecently.set(ref, step);
        } else {

            // It's a miss
            misses++;

            // If there's space, add directly
            if (memory.length < frames) {

                // Add to memory
                memory.push(ref);
            } else {

                // Find LRU page (first in Map)
                const lru = usedRecently.keys().next().value;

                // Find index and replace
                const index = memory.indexOf(lru);

                // Replace in memory
                memory[index] = ref;

                // Remove LRU from usage tracking
                usedRecently.delete(lru);
            }

            // Mark current reference as recently used
            usedRecently.set(ref, step);
        }

        // Update frames display
        const framesBox = col.querySelector(".framesBox");
        framesBox.innerHTML = "";

        // Fill frames from top → bottom
        for (let i = 0; i < frames; i++) {

            // Create frame div
            const div = document.createElement("div");

            // Add frame class
            div.classList.add("frame");

            // Fill with memory content or placeholder
            if (i < memory.length) {

                // Set text content
                div.textContent = memory[i];

                // Determine hit or miss for this frame
                if (isHit) {
                    div.classList.add("hit");  // ALWAYS add hit class
                } else if (before[i] !== memory[i]) {
                    div.classList.add("miss"); // Only add miss if memory changed
                }
            } else {

                // Empty frame placeholder
                div.textContent = "-";
                div.style.opacity = "0.4";
            }

            // Append to frames box
            framesBox.appendChild(div);

            // Staggered animation
            setTimeout(() => div.classList.add("show"), 80 * i);
        }

        // Update status display
        const status = col.querySelector(".status");
        status.textContent = isHit ? "Hit" : "Miss";
        status.className = isHit ? "status hit" : "status miss";

        // Wait a bit before next step
        await sleep(1500);
    }

    // Instead, use the separate container:
    const totalContainer = document.getElementById("totalCounterContainer");
    totalContainer.innerHTML = ""; // clear previous

    // Animate totals
    let displayHits = 0, displayMisses = 0;
    const increment = 1;
    while(displayHits < hits || displayMisses < misses){
        if(displayHits < hits) displayHits += increment;
        if(displayMisses < misses) displayMisses += increment;
        totalStreams = displayHits + displayMisses;
        totalContainer.innerHTML = `<p> <b>Total Hits:</b> ${displayHits} <br><b>Total Misses:</b> ${displayMisses} <br><b>Total Streams:</b> ${totalStreams}</p>`;
        await sleep(50);
    }
}

// Popup display function
function showPopup(message) {

    // Get popup elements
    const popup = document.getElementById("cutePopup");
    const msg = document.getElementById("popupMessage");

    // Set message and show
    msg.textContent = message;
    popup.style.display = "flex";
}

// Close popup on button click
document.getElementById("closePopupBtn").addEventListener("click", () => {
    // Hide popup
    document.getElementById("cutePopup").style.display = "none";
});

