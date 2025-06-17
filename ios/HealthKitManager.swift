import Foundation
import HealthKit

@objc(HealthKitManager)
class HealthKitManager: NSObject {
    private let healthStore = HKHealthStore()
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    @objc static let shared = HealthKitManager()
    
    struct HealthMetric {
        let identifier: HKQuantityTypeIdentifier
        let unit: HKUnit
        let type: String
        let activityType: String
    }
    
    private let metrics: [HealthMetric] = [
        HealthMetric(
            identifier: .stepCount,
            unit: HKUnit.count(),
            type: "steps",
            activityType: "STEPS"
        ),
        HealthMetric(
            identifier: .heartRate,
            unit: HKUnit.count().unitDivided(by: .minute()),
            type: "heartRate",
            activityType: "HEART_RATE"
        ),
        HealthMetric(
            identifier: .restingHeartRate,
            unit: HKUnit.count().unitDivided(by: .minute()),
            type: "restingHeartRate",
            activityType: "RESTING_HEART_RATE"
        ),
        HealthMetric(
            identifier: .heartRateVariabilitySDNN,
            unit: HKUnit.secondUnit(with: .milli),
            type: "heartRateVariability",
            activityType: "HEART_RATE_VARIABILITY"
        ),
        HealthMetric(
            identifier: .respiratoryRate,
            unit: HKUnit.count().unitDivided(by: .minute()),
            type: "respiratoryRate",
            activityType: "RESPIRATORY_RATE"
        ),
        HealthMetric(
            identifier: .appleExerciseTime,
            unit: HKUnit.minute(),
            type: "exerciseMinutes",
            activityType: "EXERCISE_MINUTES"
        )
    ]
    
    @objc
    func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        let typesToRead: Set<HKObjectType> = Set(metrics.map { 
            HKObjectType.quantityType(forIdentifier: $0.identifier)! 
        }).union([HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!])
        
        healthStore.requestAuthorization(toShare: nil, read: typesToRead, completion: completion)
    }
    
    @objc(requestAuthorization:rejecter:)
    func requestAuthorizationRN(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        requestAuthorization { success, error in
            if success {
                resolve(true)
            } else {
                reject("ERROR", "Failed to get HealthKit authorization", error)
            }
        }
    }
    
    @objc(fetchHealthData:resolver:rejecter:)
    func fetchHealthData(_ userId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        fetchHealthData(userId: userId) { jsonString in
            if let jsonString = jsonString {
                resolver(jsonString)
            } else {
                rejecter("ERROR", "Failed to fetch health data", nil)
            }
        }
    }
    
    @objc
    func fetchHealthData(userId: String, completion: @escaping (String?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("HealthKit is not available on this device")
            completion(nil)
            return
        }
        
        print("Starting health data fetch for user: \(userId)")
        let group = DispatchGroup()
        var healthData: [[String: Any]] = []
        
        // Get today's date at current time (endDate)
        let endDate = Date()
        // let startDate = Calendar.current.date(byAdding: .day, value: -20, to: endDate) ?? endDate

        // Get today's date at 12 AM (startDate)
        var startDate = Calendar.current.startOfDay(for: endDate)
        
        // Check if we have a last sync time
        if let lastSyncString = UserDefaults.standard.string(forKey: "lastSyncDateTime"),
           let lastSyncDate = dateFormatter.date(from: lastSyncString) {
            // If last sync was before today at 12 AM, use last sync time as start
            if lastSyncDate < startDate {
                startDate = Calendar.current.startOfDay(for: lastSyncDate)
            }
        }
        
        // Fetch data for each metric
        for metric in metrics {
            group.enter()
            fetchMetricSamples(
                metric: metric,
                startDate: startDate,
                endDate: endDate,
                userId: userId
            ) { samples in
                if let samples = samples {
                    healthData.append(contentsOf: samples)
                }
                group.leave()
            }
        }
        
        // Fetch sleep data separately
        group.enter()
        fetchSleepSamples(
            startDate: startDate,
            endDate: endDate,
            userId: userId
        ) { samples in
            if let samples = samples {
                healthData.append(contentsOf: samples)
            }
            group.leave()
        }
        
        group.notify(queue: .main) {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: healthData, options: [])
                print("Successfully fetched \(healthData.count) health records")
                completion(String(data: jsonData, encoding: .utf8))
            } catch {
                print("Error converting health data to JSON: \(error)")
                completion(nil)
            }
        }
    }
    
    private func fetchMetricSamples(
        metric: HealthMetric,
        startDate: Date,
        endDate: Date,
        userId: String,
        completion: @escaping ([[String: Any]]?) -> Void
    ) {
        print("Fetching \(metric.type) data from \(startDate) to \(endDate)")
        guard let quantityType = HKObjectType.quantityType(forIdentifier: metric.identifier) else {
            print("Failed to create quantity type for \(metric.type)")
            completion(nil)
            return
        }
        
        // Set up daily intervals for the statistics collection
        let calendar = Calendar.current
        let interval = DateComponents(day: 1)
        
        let query = HKStatisticsCollectionQuery(
            quantityType: quantityType,
            quantitySamplePredicate: HKQuery.predicateForSamples(
                withStart: startDate,
                end: endDate,
                options: .strictStartDate
            ),
            options: self.getStatisticsOptions(for: metric.identifier),
            anchorDate: calendar.startOfDay(for: startDate),
            intervalComponents: interval
        )
        
        query.initialResultsHandler = { query, results, error in
            if let error = error {
                print("Error fetching \(metric.type): \(error)")
                self.notifyHealthKitError()
                completion(nil)
                return
            }
            
            guard let statsCollection = results else {
                print("No statistics found for \(metric.type)")
                completion(nil)
                return
            }
            
            var samples: [[String: Any]] = []
            
            statsCollection.enumerateStatistics(from: startDate, to: endDate) { statistics, stop in
              print("Statistics \(statistics)")
                if metric.identifier == .respiratoryRate || metric.identifier == .heartRate {
                    if let avgQuantity = statistics.averageQuantity(),
                       let minQuantity = statistics.minimumQuantity(),
                       let maxQuantity = statistics.maximumQuantity() {
                        
                        let avgValue = avgQuantity.doubleValue(for: metric.unit)
                        let minValue = minQuantity.doubleValue(for: metric.unit)
                        let maxValue = maxQuantity.doubleValue(for: metric.unit)
                        
                        samples.append([
                            "value": [
                                "avg": avgValue,
                                "min": minValue,
                                "max": maxValue
                            ],
                            "userId": userId,
                            "startTime": self.dateFormatter.string(from: statistics.startDate),
                            "endTime": self.dateFormatter.string(from: statistics.endDate),
                            "metric": metric.type,
                            "activityType": metric.activityType,
                            "source": "Apple Health"
                        ])
                    }
                } else if let quantity = self.getQuantityFromStatistics(statistics, for: metric.identifier) {
                    let value = quantity.doubleValue(for: metric.unit)
                    samples.append([
                        "value": value,
                        "userId": userId,
                        "startTime": self.dateFormatter.string(from: statistics.startDate),
                        "endTime": self.dateFormatter.string(from: statistics.endDate),
                        "metric": metric.type,
                        "activityType": metric.activityType,
                        "source": "Apple Health"
                    ])
                }
            }
            
            print("Found \(samples.count) daily summaries for \(metric.type)")
            completion(samples)
        }
        
        healthStore.execute(query)
    }
    
    private func getStatisticsOptions(for identifier: HKQuantityTypeIdentifier) -> HKStatisticsOptions {
        switch identifier {
        case .stepCount, .appleExerciseTime:
            return .cumulativeSum
        case .respiratoryRate, .heartRate:
            return [.discreteAverage, .discreteMin, .discreteMax]
        case .restingHeartRate, .heartRateVariabilitySDNN:
            return [.discreteAverage]
        default:
            return .discreteAverage
        }
    }
    
    private func getQuantityFromStatistics(_ statistics: HKStatistics, for identifier: HKQuantityTypeIdentifier) -> HKQuantity? {
        switch identifier {
        case .stepCount, .appleExerciseTime:
            return statistics.sumQuantity()
        case .respiratoryRate, .heartRate:
            // Return nil to handle these metrics specially in fetchMetricSamples
            return nil
        case .restingHeartRate, .heartRateVariabilitySDNN:
            return statistics.averageQuantity()
        default:
            return statistics.averageQuantity()
        }
    }
    
    private func fetchSleepSamples(
        startDate: Date,
        endDate: Date,
        userId: String,
        completion: @escaping ([[String: Any]]?) -> Void
    ) {
        print("Fetching sleep data from \(startDate) to \(endDate)")
        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            print("Failed to create sleep analysis type")
            completion(nil)
            return
        }
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        
        let query = HKSampleQuery(
            sampleType: sleepType,
            predicate: predicate,
            limit: HKObjectQueryNoLimit,
            sortDescriptors: nil
        ) { _, samples, error in
            if let error = error {
                print("Error fetching sleep data: \(error)")
                self.notifyHealthKitError()
                completion(nil)
                return
            }
            
            guard let samples = samples as? [HKCategorySample] else {
                print("No sleep samples found")
                completion(nil)
                return
            }
            
            print("Found \(samples.count) sleep samples")
            let results = samples.map { sample -> [String: Any] in
                var sleepState = "unknown"
                switch sample.value {
                case HKCategoryValueSleepAnalysis.inBed.rawValue:
                    sleepState = "INBED"
                case HKCategoryValueSleepAnalysis.asleepCore.rawValue:
                    sleepState = "CORE"
                case HKCategoryValueSleepAnalysis.asleepDeep.rawValue:
                    sleepState = "DEEP"
                case HKCategoryValueSleepAnalysis.asleepREM.rawValue:
                    sleepState = "REM"
                case HKCategoryValueSleepAnalysis.awake.rawValue:
                    sleepState = "AWAKE"
                case HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue:
                    sleepState = "ASLEEP"
                default:
                    break
                }

                let sampleInfo: [String: Any] = [
                    "id": sample.uuid.uuidString,
                    "userId": userId,
                    "value": sleepState,
                    "startTime": self.dateFormatter.string(from: sample.startDate),
                    "endTime": self.dateFormatter.string(from: sample.endDate),
                    // "device": sample.device?.localIdentifier ?? "unknown",
                    "HKWasUserEntered": sample.metadata?["HKWasUserEntered"] as? Bool ?? false,
                    "source": "Apple Health",
                    "sourceId": sample.sourceRevision.source.bundleIdentifier,
                    "activityType": "SLEEP"
                ]
                
                print("Sleep Sample: \(String(data: try! JSONSerialization.data(withJSONObject: sampleInfo, options: .prettyPrinted), encoding: .utf8) ?? "")")
                
                return sampleInfo
            }
            
            completion(results)
        }
        
        healthStore.execute(query)
    }
    
    // Helper method to notify about HealthKit errors
    private func notifyHealthKitError() {
        // Try to use the shared instance if available
        if let eventEmitter = HealthSyncEventEmitter.shared() {
            eventEmitter.notifyHealthDataSyncError()
        } else {
            // If shared instance is not available, post the notification directly
            NotificationCenter.default.post(name: NSNotification.Name("HealthKitErrorNotification"), object: nil)
            print("Posted HealthKitErrorNotification via NotificationCenter")
        }
    }
}
