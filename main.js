import { setTimeout } from 'timers/promises'
import IO from './io.js'
import OpenAI from 'openai'
import open from 'open'
import fs from 'fs'

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

async function generateText(input) {
    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 256,
        stream: true,
        n: 1,
        temperature: .7,
        messages: [
            {
                role: 'user',
                content: input,
            },
        ],
    })

    IO.write('GPT: ')
    for await (const message of response)
        await IO.writeRunning(message.choices[0]?.delta?.content)
    IO.writeLine()
}

async function main() {
    await setTimeout(100)

    let input

    while (true) {
        input = await IO.read('User: ')
        if (input === 'exit') {
            break
        }

        await generateText(input)
    }

    IO.close()
}

main()
