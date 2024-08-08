import { setTimeout } from 'node:timers/promises'
import IO from './io.js'
import OpenAI from 'openai'
import open from 'open'
import fs from 'fs'

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})
const io = new IO()
const timeoutMs = 300

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

    io.write('GPT: ')
    for await (const message of response)
        await io.writeRunning(message.choices[0]?.delta?.content)
    io.writeLine()
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
        io.write('\r                    ')
        io.write('\rLoading')
        await setTimeout(timeoutMs)
        io.write('.')
        await setTimeout(timeoutMs)
        io.write('.')
        await setTimeout(timeoutMs)
        io.write('.')
        await setTimeout(timeoutMs)
    }

    const url = response.data[0].url
    await open(url) // launch the browser with the image

    let save = ''
    while (save !== 'y' && save !== 'n') {
        save = (await io.read('Save picture? (y/n): '))
            .trim()
            .toLowerCase()
    }
    if (save === 'n') {
        io.writeLine()
        return
    }

    const picResponse = await fetch(url)
    const datestamp = new Date()
        .toLocaleString()
        .replace(/(\/|\.)/g, '-')
        .replace(/,/g, '')
        .replace(/ /g, '_')

    fs.mkdirSync('./pictures', { recursive: true })
    const filename = `./pictures/${datestamp}.png`

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

    await picResponse.body.pipeTo(writableStream)
}

async function main() {
    await setTimeout(100)

    let input

    while (true) {
        input = await io.read('User: ')
        if (input === 'exit') {
            break
        }

        // await generateText(input)
        await generatePicture(input)
    }

    io.close()
}

main()
