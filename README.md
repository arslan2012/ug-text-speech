<p align="center">
  <a href="https://nextjs-fastapi-starter.vercel.app/">
    <img src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" height="96">
    <h3 align="center">Uyghur Text Speech Converter</h3>
  </a>
</p>

<p align="center">Simple Uyghur Text Speech Converter that uses <a href="https://fastapi.tiangolo.com/">FastAPI</a> as the API backend.</p>

<br/>

## Demo

https://nextjs-fastapi-starter.vercel.app/

## Deploy Your Own

You can clone & deploy it to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farslan2012%2Fug-text-speech%2Ftree%2Fmain)

## Developing Locally

You can clone & create this repo with the following command

```bash
npx create-next-app nextjs-fastapi --example "https://github.com/digitros/nextjs-fastapi"
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

## References
Code used to convert different script/alphabets: https://github.com/neouyghur/ScriptConverter4Uyghur/blob/master/converter.py

Text-to-Speech: https://huggingface.co/facebook/mms-tts-uig-script_arabic

Speech-to-Text: https://github.com/gheyret/uyghur-asr-ctc
