class Terminal {
    /** @type {string[]} */
    #log = [];
    /** @type {string[]} */
    #history = [];
    /** @type {number} */
    #historyIndex = 0;
    /** @type {HTMLInputElement} */
    #inputElement;
    /** @type {HTMLElement} */
    #logsElement;
    /** @type {{[key: string]: () => void}} */
    #commands = {};
    /** @type {string} */
    #commandTyped = "";

    /**
     * @param {HTMLElement} terminalElement
     */
    constructor(terminalElement) {
        this.#inputElement = terminalElement.querySelector("#terminal #input");
        this.#logsElement = terminalElement.querySelector("#terminal #log");

        let notTyping = 0;
        this.#inputElement.addEventListener("keydown", async (e) => {
            notTyping++;
            switch (e.key) {
                case "ArrowUp":
                    if (this.#historyIndex <= 0) break;
                    this.#historyIndex -= 1;
                    this.#inputElement.value =
                        this.#history[this.#historyIndex];
                    break;
                case "ArrowDown":
                    if (this.#historyIndex >= this.#history.length) break;
                    this.#historyIndex += 1;
                    this.#inputElement.value =
                        this.#historyIndex === this.#history.length
                            ? this.#commandTyped
                            : this.#history[this.#historyIndex];
                    break;
                case "Enter":
                    const command = this.#inputElement.value;
                    this.#historyIndex = this.#history.length;
                    this.#history.push(command);
                    this.#inputElement.value = "";
                    this.#run(command);
                    break;
            }

            await sleep(400);
            if ((notTyping -= 1) >= 1) return;
            // code there will be run only after the user has stopped typing

            this.#commandTyped = this.#inputElement.value;
            console.log("after typing: ", this);
        });
    }

    addCommand(name, action) {
        if (this.#commands[name]) {
            throw new Error(`Command ${name} already exists.`);
        }
        this.#commands[name] = action;
    }
    changeCommand(name, action) {
        if (!this.#commands[name]) {
            throw new Error(`Command ${name} does not exist.`);
        }
        this.#commands[name] = action;
    }
    removeCommand(name) {
        if (!this.#commands[name]) {
            throw new Error(`Command ${name} does not exist.`);
        }
        delete this.#commands[name];
    }

    #run(command) {
        if (!this.#commands[command]) {
            this.error(`Command ${command} does not exist.`);
            return;
        }

        this.#commands[command]();
    }

    log(...args) {
        console.log("logged:", ...args);
        this.#logsElement.innerHTML = `<p>${args.join("\n")}</p>` +
            this.#logsElement.innerHTML;
    }
    warn(...args) {
        console.warn("logged:", ...args);
        this.#logsElement.innerHTML = `<p class="warn">${
            args.join(
                "\n",
            )
        }</p>` + this.#logsElement.innerHTML;
    }
    error(...args) {
        console.error("logged:", ...args);
        this.#logsElement.innerHTML = `<p class="error">${
            args.join(
                "\n",
            )
        }</p>` + this.#logsElement.innerHTML;
    }
}

const terminal = new Terminal(document.body.querySelector("#terminal"));
terminal.addCommand("warn", () => terminal.warn("warning"));
