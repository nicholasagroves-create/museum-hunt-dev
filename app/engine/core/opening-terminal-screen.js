function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomTypeSpeed() {
  return 24 + Math.random() * 34;
}

function getTerminalHumAudio() {
  return document.getElementById("terminal-hum-audio");
}

function getTerminalTypingAudio() {
  return document.getElementById("terminal-typing-audio");
}

function startHum() {
  const humAudio = getTerminalHumAudio();
  if (!humAudio) return;

  humAudio.volume = 0.25;
  humAudio.loop = true;

  if (humAudio.paused) {
    humAudio.currentTime = 0;
    humAudio.play().catch(() => {});
  }
}

function stopHum() {
  const humAudio = getTerminalHumAudio();
  if (!humAudio) return;

  humAudio.pause();
  humAudio.currentTime = 0;
}

function startTypingSound() {
  const typingAudio = getTerminalTypingAudio();
  if (!typingAudio) return;

  typingAudio.volume = 0.35;

  if (typingAudio.paused) {
    typingAudio.currentTime = 0;
    typingAudio.play().catch(() => {});
  }
}

function stopTypingSound() {
  const typingAudio = getTerminalTypingAudio();
  if (!typingAudio) return;

  typingAudio.pause();
  typingAudio.currentTime = 0;
}

async function typeCharacters(element, text) {
  startTypingSound();

  for (let i = 0; i < text.length; i += 1) {
    element.textContent += text.charAt(i);
    await wait(randomTypeSpeed());
  }

  stopTypingSound();
}

async function animateLoadingEllipses(lineElement, fullText) {
  const lastSpaceIndex = fullText.lastIndexOf(" ");

  let leadingText = "";
  let trailingWord = fullText;

  if (lastSpaceIndex !== -1) {
    leadingText = fullText.slice(0, lastSpaceIndex + 1);
    trailingWord = fullText.slice(lastSpaceIndex + 1);
  }

  const leadingSpan = document.createElement("span");
  leadingSpan.textContent = leadingText;

  const trailingGroup = document.createElement("span");
  trailingGroup.style.display = "inline-block";
  trailingGroup.style.whiteSpace = "nowrap";

  const trailingWordSpan = document.createElement("span");
  trailingWordSpan.textContent = trailingWord;

  const dotsSpan = document.createElement("span");
  dotsSpan.textContent = "";
  dotsSpan.style.display = "inline-block";
  dotsSpan.style.width = "3ch";
  dotsSpan.style.whiteSpace = "pre";

  trailingGroup.appendChild(trailingWordSpan);
  trailingGroup.appendChild(dotsSpan);

  lineElement.innerHTML = "";
  if (leadingText) {
    lineElement.appendChild(leadingSpan);
  }
  lineElement.appendChild(trailingGroup);

  const cycles = 2 + Math.floor(Math.random() * 2);

  for (let cycle = 0; cycle < cycles; cycle += 1) {
    dotsSpan.textContent = ".";
    await wait(280);

    dotsSpan.textContent = "..";
    await wait(280);

    dotsSpan.textContent = "...";
    await wait(280);

    if (cycle === cycles - 1) {
      await wait(340);
      return;
    }

    dotsSpan.textContent = "";
    await wait(220);
  }
}

function formatResearcherId(value) {
  const cleaned = value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);

  if (cleaned.length <= 4) {
    return cleaned;
  }

  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

function maskPin(value) {
  return "•".repeat(value.length);
}

export async function renderOpeningTerminalScreen(onComplete) {
  const root = document.getElementById("opening-flow-root");

  if (!root) return;

  root.innerHTML = `
    <main class="opening-terminal-screen">
      <div class="opening-terminal-window opening-flow-fade-in" id="opening-terminal-window">
        <div class="opening-terminal-output" id="opening-terminal-output"></div>

        <div class="opening-terminal-prompt" id="opening-terminal-prompt">
          <span class="opening-terminal-prompt-label">&gt;</span>
          <span class="opening-terminal-prompt-text">ENTER RESEARCHER ID</span>
          <span id="opening-terminal-input-display"></span>
          <span class="opening-terminal-cursor"></span>
        </div>

        <input
          id="opening-terminal-input"
          class="opening-terminal-hidden-input"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="characters"
          spellcheck="false"
          maxlength="8"
        />
      </div>
    </main>
  `;

  const bootLines = [
    { type: "title", value: "MUSEUM EXPEDITION ARCHIVE v0.9.4" },
    { type: "title", value: "RECOVERED ACCESS NODE" },
    { type: "spacer", value: "" },
    { type: "loading", value: "Initializing secure research terminal" },
    { type: "loading", value: "Loading archive index" },
    { type: "loading", value: "Restoring damaged session fragments" },
    { type: "text", value: "Connection established." },
    { type: "spacer", value: "" }
  ];

  const output = document.getElementById("opening-terminal-output");
  const hiddenInput = document.getElementById("opening-terminal-input");
  const inputDisplay = document.getElementById("opening-terminal-input-display");
  const prompt = document.getElementById("opening-terminal-prompt");
  const terminalWindow = document.getElementById("opening-terminal-window");

  if (!output || !hiddenInput || !inputDisplay || !prompt || !terminalWindow) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      terminalWindow.classList.add("is-visible");
    });
  });

  prompt.style.visibility = "hidden";
  startHum();

  await wait(1400);

  for (const lineData of bootLines) {
    const line = document.createElement("div");
    line.className = lineData.type === "spacer"
      ? "opening-terminal-line opening-terminal-line--spacer"
      : "opening-terminal-line";

    output.appendChild(line);

    if (lineData.type === "spacer") {
      await wait(140);
      continue;
    }

    await typeCharacters(line, lineData.value);

    if (lineData.type === "loading") {
      await animateLoadingEllipses(line, lineData.value);
      await wait(180);
    } else {
      await wait(260);
    }
  }

  await wait(350);
  prompt.style.visibility = "visible";
  hiddenInput.focus();

  const terminalState = {
    researcherId: "",
    createdPin: "",
    stage: "researcher-id"
  };

  async function addTypedLine(text) {
    const line = document.createElement("div");
    line.className = "opening-terminal-line";
    output.appendChild(line);
    await typeCharacters(line, text);
    return line;
  }

  async function addTypedLoadingLine(text) {
    const line = document.createElement("div");
    line.className = "opening-terminal-line";
    output.appendChild(line);
    await typeCharacters(line, text);
    await animateLoadingEllipses(line, text);
    return line;
  }

  function addStaticLine(text) {
    const line = document.createElement("div");
    line.className = text === "" ? "opening-terminal-line opening-terminal-line--spacer" : "opening-terminal-line";
    line.textContent = text;
    output.appendChild(line);
  }

  function setPrompt(promptText, inputMode = "text") {
    const promptLabel = document.querySelector(".opening-terminal-prompt-text");
    if (!promptLabel) return;

    promptLabel.textContent = promptText;
    hiddenInput.value = "";
    inputDisplay.textContent = "";
    hiddenInput.setAttribute("inputmode", inputMode);
    hiddenInput.focus();
  }

  terminalWindow.addEventListener("click", () => {
    hiddenInput.focus();
  });

  hiddenInput.addEventListener("input", () => {
    if (terminalState.stage === "researcher-id") {
      const formattedValue = formatResearcherId(hiddenInput.value);
      hiddenInput.value = formattedValue;
      inputDisplay.textContent = formattedValue;
      return;
    }

    if (terminalState.stage === "create-pin" || terminalState.stage === "confirm-pin") {
      const pin = hiddenInput.value.replace(/\D/g, "").slice(0, 4);
      hiddenInput.value = pin;
      inputDisplay.textContent = maskPin(pin);
    }
  });

  hiddenInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (terminalState.stage === "researcher-id") {
      const researcherId = hiddenInput.value.trim();
      if (researcherId.length !== 8) return;

      addStaticLine(`> ENTER RESEARCHER ID ${researcherId}`);
      terminalState.researcherId = researcherId;
      terminalState.stage = "create-pin";
      setPrompt("CREATE 4-DIGIT PIN", "numeric");
      return;
    }

    if (terminalState.stage === "create-pin") {
      const pin = hiddenInput.value.trim();
      if (pin.length !== 4) return;

      addStaticLine(`> CREATE 4-DIGIT PIN ${maskPin(pin)}`);
      terminalState.createdPin = pin;
      terminalState.stage = "confirm-pin";
      setPrompt("CONFIRM 4-DIGIT PIN", "numeric");
      return;
    }

    if (terminalState.stage === "confirm-pin") {
      const pin = hiddenInput.value.trim();
      if (pin.length !== 4) return;

      if (pin !== terminalState.createdPin) {
        addStaticLine("PIN MISMATCH. RE-ENTER NEW PIN.");
        terminalState.createdPin = "";
        terminalState.stage = "create-pin";
        setPrompt("CREATE 4-DIGIT PIN", "numeric");
        return;
      }

      terminalState.stage = "verified";
      hiddenInput.blur();
      prompt.style.visibility = "hidden";

      await wait(260);
      await addTypedLine("Credentials verified.");
      await wait(420);
      await addTypedLoadingLine("Loading Expedition Archive");
      await wait(240);
      await addTypedLoadingLine("Launching Interface");
      await wait(680);

      const flowRoot = document.getElementById("opening-flow-root");
      if (flowRoot) {
        flowRoot.classList.add("is-fading-out");
      }

      stopHum();

setTimeout(() => {
  if (typeof onComplete === "function") {
    onComplete({
      researcherId: terminalState.researcherId,
      pin: terminalState.createdPin
    });
  }
}, 900);
    }
  });
}