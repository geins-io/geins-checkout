# Geins Checkout

A modern, fun, and developer-friendly checkout solution for Geins e-commerce backend. Use it to generate sells and manage transactions even if you don’t have a full storefront, or use it as the Checkout for your storefront.

Built on the [Geins SDK](https://github.com/geins-io/geins-sdk), Geins Checkout is all about making life easier for developers. Whether you opt for our hosted version or choose to clone and self-host this repository, you get a plug-and-play solution that prioritizes developer happiness.

## Features

- **Universal Checkout:** A complete checkout solution for ecommerce — even without a storefront.
- **Custom Branding:** Tweak details to match your unique look and feel.
- **Payment Methods Galore:** Integrates with almost every payment provider available.
- **Built on Geins SDK:** Leverages our powerful SDK to streamline your checkout experience.
- **Flexible Deployment:** Use our hosted version or clone the repo to run it on your own infrastructure.
- **Developer Happiness:** Designed with a focus on simplicity, flexibility, and fun.

## Latest Release

The latest version released is **v0**. It was released on **2025-04-03**.

## Usage Options

There are two ways to use Geins Checkout:

1. **Hosted Version:** Use our hassle-free, cloud-hosted version: [Geins Checkout](https://checkout.geins.services/)
2. **Self-Hosted:** Clone this repository and deploy it on your own server or preferred platform.

## Getting Started - Hosted Version

### Prerequisites

- A Geins account
- A generated [checkout token](#configure-your-checkout-token)

### Configure your Checkout Token

The checkout works with the help of a generated checkout token. You can generate a checkout token in two ways:

1. Using the Geins SDK
2. Using the form in the Geins SDK documentation

Read how and generate your token [here](https://sdk.geins.dev/guide/examples/generate-checkout-token.html)

### Using the Checkout Token

Once you have generated your token, you can visit your checkout by using the following URL:

**https://checkout.geins.services/{YOUR_CHECKOUT_TOKEN}**

## Getting Started - Self-Hosted

### Prerequisites

- Node.js (v20 or above)
- Package manager (npm, yarn, pnpm, etc.)
- A Geins account
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

<!-- Badges -->

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
