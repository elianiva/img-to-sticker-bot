## Image to sticker bot

This is a super simple bot using [@open-wa/wa-automate](https://github.com/open-wa/wa-automate-nodejs) to convert image to sticker.

### Run

Simply run

```
ts-node index.ts
```

If you don't have `ts-node` installed, just rename it to `index.js`, remove the types, and change the es imports to cjs imports.

### Usage

Send an image with `/sticker` caption to the number that you used to scan the qrcode and it will send back the image as a sticker. Works with square image only, otherwise it'll get cropped.

This bot is dead simple I don't want to put any license to it. Steal it if you want lmao i don't really care :p

Also, this bot became quite a mess since the last time I wrote this readme and I can't be bothered to write the whole feature so good luck exploring the code ;)
