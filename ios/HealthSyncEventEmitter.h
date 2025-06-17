#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface HealthSyncEventEmitter : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)shared;
- (void)startObserving;
- (void)stopObserving;
- (void)notifyHealthDataSyncError;

@end 