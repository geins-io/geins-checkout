# Geins Checkout

## Development of v0

### Todo

- [x] Copy cart if settings says so
- [x] Render logo from the `logo` field in checkout settings
- [x] Fix image urls from - https://labs.commerce.services/product/raw/ (Add base img url to token!) + create one proxy domain for all images since we need to whitleist the domain for nuxtImage
- [x] Address inputs and validation in components
- [x] Leave message on order (payment method 18)
- [ ] Structure of repository and components
- [x] Use Types from `@geins/types`
- [ ] Debug mode with logging to console
- [x] Re-do styles so that it integrates with tailwind/shadcn instead of basic css
- [x] Update to a more modern design that works with most branding
- [x] Confirm page branding and functions
- [x] Two steps for Geins Pay
- [x] Sale prices in cart
- [x] Cart summary component
- [ ] Set a good font for the checkout
- [x] Change order in url
- [x] Global inc/ex vat state set from token settings
- [x] Address country from market

### Before v0 release

- [ ] Add tests
- [ ] Add documentation
- [ ] Add README.md

### After v0 release

- [ ] Ability to change the cart in the checkout
- [ ] Add a discount code to the order
- [ ] Add a way to add custom fields to the checkout form
- [ ] User authentication
- [ ] Show sku in cart
- [ ] Special Avarda implementations
- [ ] Fix so that all external checkouts works properly
- [ ] See to that all available payment methods are working as intended, redirecting to correct page
