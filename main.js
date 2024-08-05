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

async function generatePicture(input) {
    let response, loading = true

    client.images.generate({
        prompt: input,
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'hd',
        n: 1,
    }).then((res) => {
        response = res
        loading = false
    })

    while (loading) {
        IO.write('\r                    ')
        IO.write('\rLoading')
        IO.write('\rLoading.')
        await setTimeout(500)
        IO.write('.')
        await setTimeout(500)
        IO.write('.')
        await setTimeout(500)
    }

    const url = response.data[0].url
    await open(url) // launch the browser with the image
    // IO.writeLine(`Picture: ${url}`)

    let save = ''
    while (save !== 'y' && save !== 'n') {
        save = (await IO.read('Save picture? (y/n): '))
            .trim()
            .toLowerCase()
    }
    if (save === 'y') {
        fs.mkdirSync('./pictures', { recursive: true })
        const filename = `./pictures/${new Date().toLocaleString()}.png`
        const stream = fs.createWriteStream(filename, {
            flags: 'w',
        })
        const writableStream = new WritableStream({
            write(chunk) {
                stream.write(chunk)
            },
            close() {
                stream.end()
            }
        })
        const response = await fetch(url)
        await response.body.pipeTo(writableStream)
    }
}

async function main() {
    await setTimeout(100)

    let input

    while (true) {
        input = await IO.read('User: ')
        if (input === 'exit') {
            break
        }

        // await generateText(input)
        await generatePicture(input)
    }

    IO.close()
}

main()
