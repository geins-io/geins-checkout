export default defineNuxtRouteMiddleware(async ({ params, path }) => {
  // Assign value to token
  const { token } = useCheckoutToken();
  token.value = params?.token?.toString() || '';

  // Redirect to home if no token
  if (path !== '/' && token.value === '') {
    return navigateTo('/');
  }
});
