This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

### Reactotron Debugging Steps

Reactotron is a powerful tool for debugging React Native applications. Follow these steps to integrate and use Reactotron:

### Install Reactotron

1. Reactotron added to your project.(skip)
2. Install Reactotron App:
   - Download the latest version of the [Reactotron desktop app](https://github.com/infinitered/reactotron/releases?q=reactotron-app&expanded=true) from the Reactotron releases page.
   - Install and open the app.
3. Start Debugging
   - Run your application (Metro bundler must be running).
   - Open the Reactotron app on your desktop.
   - You should see logs, network requests, and other debugging information from your app in Reactotron.
4. Additional Resources
   - Learn more about Reactotron in the official [Reactotron documentation](https://docs.infinite.red/reactotron/quick-start/react-native/).

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Ameya - Project Layout (React Native)

- @types - Type declarations to extend third party library types
- Framework - Using React Native CLI for more customization options for native Android and IOS compontents
- app - Routes are React Native Router that are composed of interactors, blocks, and components.
- assets - Static assets including fonts, icons, and images
- blocks - Domain specific components composed of other blocks and components
- components - Generic base components that begin with two letter prefix of project (to avoid clashing or confusing the names with library components).
- contexts - React context providers data
- api - Network calls grouped by context in an object literal (e.g. AuthApi, AccountApi, etc) - Axios Library
- mutations - React Query mutation hooks grouped by context that invoke corresponding functions from the api.
- queries - React Query query hooks grouped by context that invoke corresponding functions from the api. Query keys are defined and colocated with their corresponding queries.
- domain - Types and zod validation schemas for domain models, along with constants.
- hooks - Custom hooks
- i18n - i18n-next translation files and hook
- interactors - Components that make network calls composed of blocks and components.
- stores - Redux Tool Kit
- tests - Test files
- themes - Restyle theming, Native Wind
- utils - Utility helpers

