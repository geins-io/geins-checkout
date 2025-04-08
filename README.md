<picture>
  <source media="(prefers-color-scheme: dark)" srcset="app/assets/logos/geins-white.svg">
  <img width="150px" alt="Geins logo" src="app/assets/logos/geins.svg">
</picture>
<br>

# Geins Checkout

A modern and developer-friendly checkout solution for Geins e-commerce backend. Use it to manage transactions with or without a storefront. Geins Checkout is designed to be simple, flexible, and easy to integrate into your existing systems.

Built on the [Geins SDK](https://github.com/geins-io/geins-sdk), Geins Checkout is all about making life easier for developers. Whether you opt for our hosted version or choose to clone and self-host this repository, you get a plug-and-play solution.

## MAKE A DEMO PURCHASE 💸

### ➡️ [Geins Checkout](https://checkout-qa.geins.services/v0/checkout/eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJjYXJ0SWQiOiJjY2MxOGMxZS1lYWIyLTQwOTEtYTBjZC0zZTIwZWQ2MDYyMWEiLCJ1c2VyIjp7ImlkIjowLCJlbWFpbCI6IiIsImFkZHJlc3MiOnsicGhvbmUiOiIiLCJtb2JpbGUiOiIiLCJjb21wYW55IjoiIiwiZmlyc3ROYW1lIjoiIiwibGFzdE5hbWUiOiIiLCJhZGRyZXNzTGluZTEiOiIiLCJhZGRyZXNzTGluZTIiOiIiLCJhZGRyZXNzTGluZTMiOiIiLCJ6aXAiOiIiLCJjYXJlT2YiOiIiLCJjaXR5IjoiIiwic3RhdGUiOiIiLCJjb3VudHJ5IjoiIiwiZW50cnlDb2RlIjoiIn19LCJjaGVja291dFNldHRpbmdzIjp7ImlzQ2FydEVkaXRhYmxlIjpmYWxzZSwiY29weUNhcnQiOnRydWUsInNlbGVjdGVkUGF5bWVudE1ldGhvZElkIjoxOCwic2VsZWN0ZWRTaGlwcGluZ01ldGhvZElkIjoxLCJjdXN0b21lclR5cGUiOiJQRVJTT04iLCJyZWRpcmVjdFVybHMiOnsiY2FuY2VsIjoiaHR0cHM6Ly93d3cuZ2VpbnMuaW8vIiwiY29udGludWUiOiJodHRwczovL3d3dy5nZWlucy5pby8ifSwiYnJhbmRpbmciOnsidGl0bGUiOiIiLCJpY29uIjoiIiwibG9nbyI6Imh0dHBzOi8vZG9jcy5nZWlucy5pby9pbWcvbG9nby1ibGFjay5zdmciLCJzdHlsZXMiOnsibG9nb1NpemUiOiIyLjVyZW0iLCJyYWRpdXMiOiI0cHgiLCJiYWNrZ3JvdW5kIjoiI2Y3ZjdmNyIsImZvcmVncm91bmQiOiIjMTMxMzEzIiwiY2FyZCI6IiNmZmZmZmYiLCJjYXJkRm9yZWdyb3VuZCI6IiMxMzEzMTMiLCJhY2NlbnQiOiIjMTMxMzEzIiwiYWNjZW50Rm9yZWdyb3VuZCI6IiNmZmZmZmYiLCJib3JkZXIiOiIjZWJlYmViIiwic2FsZSI6IiNmZjAwMDAiLCJlcnJvciI6IiNiODAwMDAifX19LCJnZWluc1NldHRpbmdzIjp7ImVudmlyb25tZW50IjoicHJvZCIsImFwaUtleSI6IkJENjc5RkYwLTA1QkUtNDg3Ni1CNTRDLUYxNkRGREI4RTk2NyIsImFjY291bnROYW1lIjoibGFicyIsImNoYW5uZWwiOiIxIiwidGxkIjoic2UiLCJsb2NhbGUiOiJzdi1TRSIsIm1hcmtldCI6InNlIn19)

## Features

- 🌐 **Universal Checkout:** A complete checkout solution for Geins e-commerce — with or without a storefront.
- 🎨 **Custom Branding:** Tweak details to match your unique look and feel.
- 💳 **Payment Methods Galore:** Integrates with almost every payment provider available.
- 🛠️ **Built on Geins SDK:** Leverages our powerful SDK to streamline your checkout experience.
- 🚀 **Flexible Usage:** Use our hosted version or clone the repo to run it on your own infrastructure.
- 😊 **Developer Happiness:** Designed with a focus on simplicity and flexibility

## Latest Release

The latest version released is **v0**. It was released on **2025-04-03**.

## Usage Options

There are two ways to use Geins Checkout:

1. **Hosted Version:** Use our hassle-free, hosted version: [Geins Checkout](https://checkout.geins.services/)
2. **Self-Hosted:** Clone this repository and deploy it on your own server or preferred platform.

## Getting Started - Hosted Version

### Prerequisites

- A [Geins](https://geins.io) account
- A generated [checkout token](#configure-your-checkout-token)

### Configure your Checkout Token

The checkout works with the help of a generated checkout token. You can generate a checkout token in two ways:

1. Using the Geins SDK
2. Using the form in the Geins SDK documentation

Read how and generate your token ✨[here](https://sdk.geins.dev/guide/examples/generate-checkout-token.html)✨

### Using the Checkout Token

Once you have generated your token, you can visit your checkout by using the following URL:

**https://checkout.geins.services/{YOUR_CHECKOUT_TOKEN}**

## Getting Started - Self-Hosted

### Prerequisites

- Node.js (v20 or above)
- Package manager (npm, yarn, pnpm, etc.)
- A [Geins](https://geins.io) account
- A generated [checkout token](#configure-your-checkout-token)

### Setup steps

1. **Clone this repo**

   ```bash
   git clone https://github.com/geins-io/geins-checkout.git
   cd geins-checkout
   ```

2. **Install Dependencies**

   ```bash
   # npm
   npm install

   # yarn
   yarn install
   ```

3. **Set Up Environment Variables**

   Create an `.env` file in the project root and configure the following variables:

   ```ini
   GEINS_DEBUG=true
   LATEST_VERSION=v0
   BASE_URL=https://localhost:3000
   PRODUCT_IMAGE_DOMAIN=commerce.services
   PRODUCT_IMAGE_BASE_URL=https://{ACCOUNT_NAME}.{DOMAIN}/product/raw/
   ```

4. **Start the Development Server**

   ```bash
   # npm
   npm run dev

   # yarn
   yarn dev
   ```

   Your checkout will be available at **http://localhost:3000/{YOUR_CHECKOUT_TOKEN}**.

## Build with

- **Framework:** [Nuxt.js](https://nuxt.com)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **UI Library:** [shadcn-vue](https://www.shadcn-vue.com)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)

## Contributing

Contributions to this repo are very welcome!

## License

This project is licensed under the MIT License.

## Acknowledgements

Built with love on top of the [Geins SDK](https://github.com/geins-io/geins-sdk).
