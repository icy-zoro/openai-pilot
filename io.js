import { createInterface } from 'readline';
import { setTimeout } from 'timers/promises';

export default class IO {
    static #rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    /**
     * A function that reads a line from the console
     * @param {string} question A prompt to put into the console
     * @returns {Promise<string>} A promise that resolves with the user's input
     */
    static async read(question = '') {
        return await new Promise((resolve) => {
            this.#rl.question(question, resolve)
        })
    }

    /**
     * A function that writes a message to the console
     * @param {string} message A message to write to the console
     * @returns {void}
     */
    static write(message = '') {
        process.stdout.write(message)
    }

    /**
     * A function that writes a message to the console one character at a time
     * @param {string} message A message to write to the console
     * @param {*} timeout A timeout to wait before writing the next character
     * @returns {void}
     */     
    static async writeRunning(message = '', timeout = 5) {
        if (!message || message.length === 0) {
            return
        }
        for (const char of message) {
            IO.write(char)
            await setTimeout(timeout)
        }
    }

    /**
     * A function that writes a message to the console and ends the line
     * @param {string} message A message to write to the console
     * @returns {void}
     */
    static writeLine(message = '') {
        console.log(message)
    }

    /**
     * A function that closes the readline interface
     * @returns {void}
     */
    static close() {
        this.#rl.close()
    }
}
