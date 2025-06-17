#import "HealthSyncEventEmitter.h"

@implementation HealthSyncEventEmitter {
    BOOL hasListeners;
}

static HealthSyncEventEmitter *_shared = nil;

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

+ (instancetype)shared {
    // If shared instance doesn't exist yet, create it
    if (_shared == nil) {
        _shared = [[HealthSyncEventEmitter alloc] init];
    }
    return _shared;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _shared = self;
        hasListeners = NO;
    }
    return self;
}

// Will be called when this module's first listener is added.
-(void)startObserving {
    hasListeners = YES;
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(notifyHealthDataSyncError)
                                               name:@"HealthKitErrorNotification"
                                             object:nil];
}

// Will be called when this module's last listener is removed.
-(void)stopObserving {
    hasListeners = NO;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)notifyHealthDataSyncError {    
    // Always post the notification
    // [[NSNotificationCenter defaultCenter] postNotificationName:@"HealthKitErrorNotification" object:nil];

    // Only send the event if we have listeners
    if (hasListeners) {
        [self sendEventWithName:@"HealthKitErrorNotification" body:@{@"error": @"HealthKit authorization error"}];
    }
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"HealthKitErrorNotification"];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
