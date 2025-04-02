const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const isPackaging = process.argv.includes('package') || process.argv.includes('make');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './src/images/logo',
    asarUnpack: ['**/better-sqlite3/**'],
  },
  makers: [
    { name: '@electron-forge/maker-squirrel', config: {
      iconUrl: 'https://raw.githubusercontent.com/1fifly/session-tracker-app/refs/heads/main/src/images/logo.ico?token=GHSAT0AAAAAADBPHPIFOLTBJ4NAPQCHMHUKZ7NRVFA',
      setupIcon: './src/images/logo.ico'
    } },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'] },
    { name: '@electron-forge/maker-deb', config: {} },
    { name: '@electron-forge/maker-rpm', config: {} },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: { js: './src/preload.js' },
            },
          ],
        },
      },
    },
    ...(isPackaging
      ? [
          {
            name: '@electron-forge/plugin-fuses',
            config: {
              version: FuseVersion.V1,
              [FuseV1Options.RunAsNode]: false,
              [FuseV1Options.EnableCookieEncryption]: true,
              [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
              [FuseV1Options.EnableNodeCliInspectArguments]: false,
              [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
              [FuseV1Options.OnlyLoadAppFromAsar]: true,
            },
          },
        ]
      : []),
  ],
};