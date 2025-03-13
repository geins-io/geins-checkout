export default defineNuxtRouteMiddleware(async ({ params, path }) => {
  const { token, initSettingsFromToken, setCurrentVersion } = useCheckoutToken();
  // Assign value to token from url param
  token.value = params?.token?.toString() || ''; // Set current version from url param
  console.log('🚀 ~ defineNuxtRouteMiddleware ~ token.value:', token.value);

  if (path !== '/' && token.value === '') {
    console.log('NAVIGATE TO ROOT - NO TOKEN');
    //return navigateTo('/');
  }

  if (token.value) {
    const settingsInitiated = await initSettingsFromToken();
    if (!settingsInitiated) {
      //return navigateTo('/');
      console.log('NAVIGATE TO ROOT - SETTINGS');
    }
  }

  setCurrentVersion(path.split('/')[1]);
});
