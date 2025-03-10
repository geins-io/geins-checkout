# Geins Checkout

## Development of v0

### Todo

- [ ] Copy cart if settings says so
- [x] Render logo from the `logo` field in checkout settings
- [x] Fix image urls from - https://labs.commerce.services/product/raw/ (Add base img url to token!) + create one proxy domain for all images since we need to whitleist the domain for nuxtImage
- [x] Address inputs and validation in components
- [ ] Fix so that all external checkouts works properly
- [ ] Special Avarda implementations
- [ ] Structure of repository and components
- [ ] Use Types from `@geins/types`
- [ ] Debug mode with logging to console
- [x] Re-do styles so that it integrates with tailwind/shadcn instead of basic css
- [x] Update to a more modern design that works with most branding
- [ ] Confirm page branding and functions
- [ ] Two steps for Geins Pay
- [ ] Cart summary component
- [ ] Set a good font for the checkout

### Before v0 release

- [ ] Add tests
- [ ] Add documentation
- [ ] Add README.md

### After v0 release

- [ ] Ability to change the cart in the checkout
- [x] Leave message on order (payment method 18)
- [ ] Add a discount code to the order
- [ ] Add a way to add custom fields to the checkout form
