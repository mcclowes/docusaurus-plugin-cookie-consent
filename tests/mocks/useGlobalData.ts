export default function useGlobalData() {
  return {
    'docusaurus-plugin-cookie-consent': {
      default: {
        options: {
          title: 'Single consent dialog',
          storageKey: 'root-test-consent',
        },
      },
    },
  }
}
