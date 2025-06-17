//
//  BackgroundTaskManager.swift
//  ameya
//
//  Created by VC on 18/12/24.
//

import Foundation
import BackgroundTasks
import UIKit
import HealthKit

@objc(BackgroundTaskManager)
class BackgroundTaskManager: NSObject {
  
  private var baseUrl = "https://dev-api.ameya.ca" // Development URL
  //private var baseUrl = "https://app-api.ameya.ca" // Production URL

  @objc static let shared = BackgroundTaskManager()
  let taskId = "ca.ameya.healthkitsync"

  @objc
  func registerRealtimeTask() {
    BGTaskScheduler.shared.register(forTaskWithIdentifier: self.taskId, using: nil) { task in
      print("Background task registered " + task.identifier)
        guard let task = task as? BGProcessingTask else { return }
        self.handleRealtimeTask(task: task)
    }
  }
  
  private func scheduleBackgroundTask() {
    // check if there is a pending task request or not
    BGTaskScheduler.shared.getPendingTaskRequests { request in
        print("\(request.count) BGTask pending.")
        print("Is Request empty? \(request.isEmpty)")
       guard request.isEmpty else { return }
        print("Create a new background task request")
        // Create a new background task request
        let request = BGProcessingTaskRequest(identifier: self.taskId)
        request.requiresNetworkConnectivity = true
        request.requiresExternalPower = false
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // Schedule the next task in 15 minutes
        
        do {
            // Schedule the background task
            try BGTaskScheduler.shared.submit(request)
            print("Background task scheduled successfully.\n")
        } catch {
            print("Unable to schedule background task: \(error.localizedDescription)")
        }
    }
  }

  func handleRealtimeTask(task: BGProcessingTask) {
    scheduleBackgroundTask()
    bgSyncOperation(task: task)
  }
  
  @objc
  func bgSyncOperation(task: BGProcessingTask) {
    task.expirationHandler = {
        print("Background task expired")
    }
    self.syncHealthData()
    print("Syncing Health data...")
    
    task.setTaskCompleted(success: true)
  }
  
//  @objc
//  func applicationWillEnterForeground() {
//    // Send lastSyncDateTime to React Native if available
//    if let lastSync = self.getLastSyncDateTime() {
//        NotificationCenter.default.post(
//            name: NSNotification.Name("LastSyncDateTime"),
//            object: nil,
//            userInfo: ["lastSyncDateTime": lastSync]
//        )
//    }
//  }
  
  // @objc
  // public func applicationDidEnterBackground() {
  //   scheduleBackgroundTask()
  // }
  
  // @objc
  // public func applicationWillTerminate() {
  //   BGTaskScheduler.shared.cancelAllTaskRequests()
  // }
  
  @objc
  public func getSyncMode() -> String? {
    return UserDefaults.standard.string(forKey: "syncMode")
  }
  
  @objc
  public func setSyncMode(_ syncMode: String) {
    UserDefaults.standard.set(syncMode, forKey: "syncMode")
  }

  @objc
  public func getLastSyncDateTime() -> String? {
    return UserDefaults.standard.string(forKey: "lastSyncDateTime")
  }

  @objc
  public func setLastSyncDateTime(_ lastSyncDateTime: String) {
    UserDefaults.standard.set(lastSyncDateTime, forKey: "lastSyncDateTime")
  }

  @objc
  public func getUserId() -> String? {
    return UserDefaults.standard.string(forKey: "userId")
  }

  @objc
  public func setUserId(_ userId: String) {
    UserDefaults.standard.set(userId, forKey: "userId")
  }

  // @objc
  // public func saveHealthData(_ data: String) {
  //   print("Saving health data: \(data)")
  //   UserDefaults.standard.set(data, forKey: "healthData")
  // }

  @objc
  public func getHealthData() -> String? {
    let group = DispatchGroup()
    var result: String?
    
    // Get userId from your storage/preferences
    guard let userId = getUserId() else {
        return nil
    }
    
    group.enter()
    HealthKitManager.shared.fetchHealthData(userId: userId) { healthData in
        result = healthData
        group.leave()
    }
    
    group.wait()
    return result
  }

  @objc
  public func getToken() -> String? {
    return UserDefaults.standard.string(forKey: "token")
  }

  @objc
  public func saveToken(_ token: String) {
    UserDefaults.standard.set(token, forKey: "token")
  }

  @objc
  public func postHealthData() {
    guard let url = URL(string: baseUrl + "/third-party/health-kit-integration") else {
        return
    }

    guard let token = getToken() else {
        return
    }
    print("token", token)

    guard let healthData = getHealthData() else {
        return
    }
    
    // Check if healthData is "[]" or empty
    if healthData == "[]" || healthData.isEmpty {
        return
    }
    print("healthData", healthData)

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let jsonData = healthData.data(using: .utf8)
    request.httpBody = jsonData
    print("payload \(String(describing: String(data: jsonData!, encoding: .utf8)))")

    let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
      do {
        if let error = error {
          return
        }

        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 201 {
          // UserDefaults.standard.removeObject(forKey: "healthData")
          self?.setLastSyncDateTime(Date().ISO8601Format())
        }
      }
    }

    task.resume()
  }

  @objc
  public func syncHealthData() {
    print("syncHealthData")
   guard shouldPerformSync() else {
       return
   }
    
    postHealthData()
  }

  @objc
  private func shouldPerformSync() -> Bool {
    print("shouldPerformSync")
    guard let syncMode = getSyncMode() else {
      return false  // If no sync mode is set, don't perform sync
    }
    
    let lastSyncDateTime = getLastSyncDateTime()  // This is already optional (String?)
    print("lastSyncDateTime: \(lastSyncDateTime ?? "")")
    
    guard let lastSync = lastSyncDateTime else {
      return true
    }
    
    let dateFormatter = ISO8601DateFormatter()
    guard let lastSyncDate = dateFormatter.date(from: lastSync) else {
      return true
    }
    
    let now = Date()
    
    if syncMode == "daily" {
      let calendar = Calendar.current
      return !calendar.isDate(lastSyncDate, inSameDayAs: now)
    } else if syncMode == "realtime" {
      let fifteenMinutes: TimeInterval = 15 * 60 // 15 minutes in seconds
      let timeSinceLastSync = now.timeIntervalSince(lastSyncDate)
      return timeSinceLastSync >= fifteenMinutes
    }
    
    return false
  }
}
