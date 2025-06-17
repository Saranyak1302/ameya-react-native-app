//
//  HealthKitManager.m
//  ameya
//
//  Created by VC on 23/01/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(HealthKitManager, NSObject)

RCT_EXTERN_METHOD(requestAuthorization: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(fetchHealthData:(NSString *)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
