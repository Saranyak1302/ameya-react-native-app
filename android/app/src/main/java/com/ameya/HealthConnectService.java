import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
public class HealthConnectService extends HeadlessJsTaskService {
   @Override
   protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
   Bundle extras = intent.getExtras();
  //  WritableMap data = extras != null ? Arguments.fromBundle(extras) : null;
  //   return new HeadlessJsTaskConfig(
  //   "HealthConnectTask", // Use the registered headless Task here
  //   data,
  //   5000);
     if (extras != null) {
        return new HeadlessJsTaskConfig(
          "HealthConnectService",
          Arguments.fromBundle(extras),
         5000);
     }
     return null;
  }
}
