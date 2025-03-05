# Geins Checkout

## Development of v0

### Todo

- [ ] Copy cart if settings says so
- [x] Render logo from the `logo` field in checkout settings
- [ ] Fix image urls from - https://labs.commerce.services/product/raw/ (Add base img url to token!) + create one proxy domain for all images since we need to whitleist the domain for nuxtImage
- [ ] Address inputs and validation in components
- [ ] Add a way to add custom fields to the checkout form
- [ ] Proofing for external checkout rendering (avarda?).
- [ ] Structure of repository and components
- [ ] Add VAT sums to cart summary
- [ ] Use Types from `@geins/types`
- [ ] Debug mode with logging to console
- [x] Re-do styles so that it integrates with tailwind/shadcn instead of basic css
- [x] Update to a more modern design that works with most branding

### Before v0 release

- [ ] Add tests
- [ ] Add documentation
- [ ] Add README.md

### After v0 release

- [ ] Ability to change the cart in the checkout
- [ ] Leave message on order
- [ ] Add a discount code to the order
