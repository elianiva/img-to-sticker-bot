import { create, Client, decryptMedia, Message } from "@open-wa/wa-automate"
import mime from "mime-types"
import fetch from "node-fetch"
import bent from "bent"
import { spawn } from "child_process"
import Brainly from "brainly-scraper-ts"

function start(client: Client) {
  client.onMessage(async (message: Message) => {
    if (message.caption === "/sticker" && message.mimetype) {
      console.log("Loading...")
      const filename: string = `${message.t}.${mime.extension(
        message.mimetype
      )}`

      try {
        console.log("Decrypting...")
        const mediaData = await decryptMedia(message)
        const imageBase64: string = `data:${
          message.mimetype
        };base64,${mediaData.toString("base64")}`

        client.sendImageAsSticker(message.from, imageBase64)
        console.log("sticker sent!")
      } catch (err) {
        throw new Error(err.message)
      }
    }

    if (message.caption === "/sauce" && message.mimetype) {
      console.log("Loading...")
      const filename: string = `${message.t}.${mime.extension(
        message.mimetype
      )}`

      try {
        console.log("Searching...")
        const mediaData = await decryptMedia(message)
        const imageBase64: string = `data:${
          message.mimetype
        };base64,${mediaData.toString("base64")}`

        const raw = await fetch("https://trace.moe/api/search", {
          method: "POST",
          body: JSON.stringify({ image: imageBase64 }),
          headers: { "Content-Type": "application/json" }
        })

        const parsedResult = await raw.json()
        const { anime, episode } = parsedResult.docs[0]

        const content = `*Anime Found!*

*Title:* ${anime}
*Episode:* ${episode} `
        client.sendImage(message.from, imageBase64, filename, content)
        console.log("Sent!")
      } catch (err) {
        throw new Error(err.message)
      }
    }

    if (message.body.includes("/corona")) {
      console.log("fetching...")
      const keyword = message.body
        .replace(/\/corona/, "")
        .toLowerCase()
        .trim()
      const URL = "http://corona.coollabs.work"
      const data = await fetch(`${URL}/country/${keyword}`)
      const parsed = await data.json()
      if (parsed.message) {
        client.sendText(message.from, "Wrong country, try with another one.")
        return null
      }
      const { Country_Region, Confirmed, Deaths, Recovered, Active } = parsed
      const content = `*Current COVID-19 Data*

*Country:* ${Country_Region}
*Confirmed:* ${Confirmed}
*Deaths:* ${Deaths}
*Recovered:* ${Recovered}
*Active:* ${Active}

*Stay At Home :)*`

      client.reply(message.from, content, message.chatId)
      console.log("Sent!")
    }

    if (message.body.includes("/nulis")) {
      console.log("writing...")
      client.sendText(message.from, "sabar njir, masih nulis botnya")
      const text = message.body.replace(/\/nulis/, "")
      const split = text.replace(/(\S+\s*){1,10}/g, "$&\n")
      const fixedHeight = split.split("\n").slice(0, 25).join("\\n")
      console.log(split)
      spawn("convert", [
        "./assets/paper.jpg",
        "-font",
        "Indie-Flower",
        "-size",
        "700x960",
        "-pointsize",
        "18",
        "-interline-spacing",
        "3",
        "-annotate",
        "+170+222",
        fixedHeight,
        "./assets/result.jpg"
      ])
        .on("error", () => console.log("error"))
        .on("exit", () => {
          client.sendImage(
            message.from,
            "./assets/result.jpg",
            "result.jpg",
            ""
          )
          console.log("done")
        })
    }

    if (message.body.includes("/brainly")) {
      console.log("fetching...")
      const keyword = message.body.replace(/\brainly/, "")
      try {
        const data = await Brainly.getData(keyword)
        const result: any[] = []
        ;(data.result as any).map((data: any) => {
          result.push(`Pertanyaan: ${data.question}
Jawaban: ${data.answers.map(
            (answer: any) =>
              `${answer.text}${
                answer.attachments.length
                  ? `(${answer.attachments.join(" ")})`
                  : ""
              }`
          )}

--------------
`)
        })

        client.sendText(message.from, result.join("\n"))
      } catch (err) {
        throw new Error(err)
      }
    }

    if (message.body.includes("define")) {
      const keyword = message.body.replace(/define/, "")
      const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5)
      try {
        const data = await fetch(
          `http://api.urbandictionary.com/v0/define?term=${keyword.trim()}`
        )
        const parsed = await data.json()
        const definition = shuffle(parsed.list)[0].definition.replace(
          /[\[\]]/g,
          "*"
        )
        client.sendText(message.from, `${definition}`)
      } catch (err) {
        console.log(err)
      }
    }

    if (message.body.includes("/anime")) {
      console.log("fetching...")
      const keyword = message.body.replace(/\/anime/, "")
      try {
        const data = await fetch(
          `https://api.jikan.moe/v3/search/anime?q=${keyword}`
        )
        const parsed = await data.json()
        if (!parsed) {
          client.sendText(
            message.from,
            "Anime not found, try again with another keyword."
          )
          console.log("Sent!")
          return null
        }

        const {
          title,
          synopsis,
          episodes,
          url,
          rated,
          score,
          image_url
        } = parsed.results[0]
        const content = `*Anime Found!*

*Title:* ${title}
*Episodes:* ${episodes}
*Rating:* ${rated}
*Score:* ${score}

*Synopsis:* ${synopsis}

*URL*: ${url}`

        const image = await bent("buffer")(image_url)
        const base64 = `data:image/jpg;base64,${image.toString("base64")}`

        client.sendImage(message.from, base64, title, content)
        console.log("Sent!")
      } catch (err) {
        console.error(err.message)
      }
    }

    if (message.body === "まだ見ぬ世界") {
      for (let i = 0; i < 10000; i++) {
        await client.sendText(message.from, `${i}`)
      }
    }

    if (message.body === "/test") {
      client.sendTextWithMentions(message.from, "something")
    }

    if (message.body === "/help") {
      const help = `Bot Command List:
- help
- anime
- sticker
- covid
- nulis
- sauce

Usage:
- /help
- /anime oregairu
- /nulis some random words go here
- /covid indonesia
- Send an image with /sticker caption to convert it to sticker
- Send an anime image with /sauce caption to find the anime title
`
      client.sendText(message.from, help)
    }
  })
}

create()
  .then((client: Client) => start(client))
  .catch(err => console.log(err))
