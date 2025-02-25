export default defineNuxtRouteMiddleware(async ({ params, path }) => {
  // Assign value to token
  const { token, initSettings } = useCheckoutToken();
  token.value = params?.token?.toString() || '';

  await initSettings();

  // Redirect to home if no token
  if (path !== '/' && token.value === '') {
    return navigateTo('/');
  }
});
