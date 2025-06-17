//
//  BackgroundTaskManager.m
//  ameya
//
//  Created by VC on 18/12/24.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BackgroundTaskManager, NSObject)

RCT_EXTERN_METHOD(setSyncMode:(NSString *)syncMode)
RCT_EXTERN_METHOD(saveToken:(NSString *)token)
RCT_EXTERN_METHOD(setLastSyncDateTime:(NSString *)lastSyncDateTime)
RCT_EXTERN_METHOD(setUserId:(NSString *)userId)
RCT_EXTERN_METHOD(syncHealthData)
@end
