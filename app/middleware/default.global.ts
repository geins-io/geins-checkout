export default defineNuxtRouteMiddleware(async ({ params, path }) => {
  const { token, setCurrentVersion } = useCheckoutToken();
  // Assign value to token from url param
  token.value = params?.token?.toString() || '';
  // Set current version from url param
  setCurrentVersion(path.split('/')[1]);

  // Redirect to home if no token
  if (path !== '/' && token.value === '') {
    return navigateTo('/');
  }
});
