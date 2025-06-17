#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>
#import <TSBackgroundFetch/TSBackgroundFetch.h>
#import <UIKit/UIKit.h>
#import <ameya-Swift.h>
// #import <BackgroundTasks/BackgroundTasks.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"ameya";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  // [REQUIRED] Register BackgroundFetch
  [[TSBackgroundFetch sharedInstance] didFinishLaunching];
  self.initialProps = @{};
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  
  // Configure background fetch
  [application setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
  
  // // Register background task with identifier
  // [[BGTaskScheduler sharedScheduler] registerForTaskWithIdentifier:@"ca.ameya.healthkitsync"
  //                                                      usingQueue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)
  //                                                   launchHandler:^(BGTask *task) {
  //   [[BackgroundTaskManager shared] handleRealtimeTask:task];
  // }];
  [[BackgroundTaskManager shared] registerRealtimeTask];

  // [[NSNotificationCenter defaultCenter] addObserver:[BackgroundTaskManager shared]
  //                                          selector:@selector(applicationDidEnterBackground)
  //                                              name:UIApplicationDidEnterBackgroundNotification
  //                                            object:nil];

  // [[NSNotificationCenter defaultCenter] addObserver:[BackgroundTaskManager shared]
  //                                        selector:@selector(applicationWillTerminate)
  //                                            name:UIApplicationWillTerminateNotification
  //                                          object:nil];

  // [[NSNotificationCenter defaultCenter] addObserver:[BackgroundTaskManager shared]
  //                                        selector:@selector(applicationWillEnterForeground)
  //                                            name:UIApplicationWillEnterForegroundNotification
  //                                          object:nil];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
 return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Add background fetch handler
- (void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  // Notify JavaScript to perform background sync
  [[NSNotificationCenter defaultCenter] postNotificationName:@"BackgroundFetchTriggered" object:nil];
  completionHandler(UIBackgroundFetchResultNewData);
}

@end
