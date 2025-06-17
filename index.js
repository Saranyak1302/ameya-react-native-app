/**
 * @format
 */
if (__DEV__) {
  require('./ReactotronConfig');
}
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

import {syncService} from './src/services/health/syncService';
import BackgroundFetch from 'react-native-background-fetch';
// const MyHeadlessTask = async taskData => {
//   // Do something in the background.
//   // For example, fetch new data or sync with the server.
//   //const dbData = await getDataFromAsync();
//   //const serverResponse = await sendDataToServer(dbData);
//   //displayPushNotification();

//   BackgroundFetch.finish(taskData);
// };
let MyHeadlessTask1 = () => {
  module.exports = async taskData => {};
};
let MyHeadlessTask = async event => {
  // Get task id from event {}:
  let taskId = event.taskId;
  let isTimeout = event.timeout; // <-- true when your background-time has expired.
  if (isTimeout) {
    // This task has exceeded its allowed running-time.
    // You must stop what you're doing immediately finish(taskId)
    //BackgroundFetch.finish(taskId);
    return;
  }

  syncService.performSync();

  // Perform an example HTTP request.
  // Important:  await asychronous tasks when using HeadlessJS.
  // let response = await fetch('https://reactnative.dev/movies.json');
  // let responseJson = await response.json();

  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  //BackgroundFetch.finish(taskId);
};
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);
//AppRegistry.registerHeadlessTask('HealthConnectTask', () => MyHeadlessTask);
AppRegistry.registerComponent(appName, () => App);
