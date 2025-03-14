export default defineNuxtRouteMiddleware(async ({ params, path }) => {
  const { token, initSettingsFromToken, setCurrentVersion } = useCheckoutToken();

  token.value = params?.token?.toString() || '';

  if (path !== '/' && token.value === '') {
    return navigateTo('/');
  }

  if (token.value) {
    const settingsInitiated = await initSettingsFromToken();
    if (!settingsInitiated) {
      return navigateTo('/');
    }
  }

  setCurrentVersion(path.split('/')[1]);
});
