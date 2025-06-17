import UnityView from '@azesmway/react-native-unity';
import React, {useEffect, useRef} from 'react';
import {Dimensions, Platform, View} from 'react-native';
import {navigateBack} from '../../../navigators/utils/Utils';
import RNFS from 'react-native-fs';
import {SafeAreaView} from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import {
  activateKeepAwake,
  deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake';
import {getFileName, renameAndShareFile} from './MocapConstants';
interface IMessage {
  gameObject: string;
  methodName: string;
  message: string;
}

const MocapPlayBack = ({route, navigation}: {route: any; navigation: any}) => {
  const unityRef = useRef();
  const {width, height} = Dimensions.get('window');
  //const isTablet = Platform.OS === 'ios' && (width >= 768 || height >= 768);
  const isTablet = DeviceInfo.isTablet();

  let movementType = 0;
  const {
    methodName,
    data,
    isFromCompleted,
    zipFilePath,
    movementName,
    movementId,
  }: {
    methodName: string;
    data: {};
    isFromCompleted: boolean;
    zipFilePath: string;
    movementName: string;
    movementId: string;
  } = route.params;

  if (methodName == 'Record') {
    // @ts-ignore - movement only exists in Record
    movementType = data.movement;
  }

  //   let recordingEntry: RecordingEntry = {
  //     id: '',
  //     movementType: movementType,
  //     createdAt: new Date(),
  //     uploaded: false,
  //   };

  const message: IMessage = {
    gameObject: 'UnityBridge',
    methodName: methodName,
    message: JSON.stringify({
      id: 0,
      data: JSON.stringify(data),
    }),
  };

  useEffect(() => {
    activateKeepAwake();
    setTimeout(() => {
      if (unityRef && unityRef.current) {
        // @ts-ignore
        unityRef.current.postMessage(
          message.gameObject,
          message.methodName,
          message.message,
        );
      }
    }, 2000);

    return () => {
      console.log('Unity useEffect cleanup');
      deactivateKeepAwake();
    };
  }, []);
  const deleteZipFiles = async () => {
    try {
      // Delete the ZIP file
      await RNFS.unlink(zipFilePath);

      navigateBack();
    } catch (error) {
      // Show error alert if any file deletion fails
    }
  };
  const handleUnityMessage = async (result: any) => {
    var json = JSON.parse(result.nativeEvent.message);
    console.log('json is', json);
    if (json && json.data) {
      var data = JSON.parse(json.data);
      console.log('data is', data);
      if (data.Back) {
        if (isFromCompleted) {
          //deleteZipFiles();
          navigateBack();
        } else {
          navigateBack();
        }
      } else if (data.Upload) {
      } else if (data.CSV) {
        console.log('csv came 2');
        console.log('import csv called for share', data.CSV);
        const fileName = await getFileName(
          true,
          movementName,
          Number(movementId),
        );
        renameAndShareFile(data.CSV, fileName);
      } else if (data.VideoCompleted) {
      }
    }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <UnityView
        // @ts-ignore
        ref={unityRef}
        style={{flex: 1}}
        onUnityMessage={handleUnityMessage}
      />
    </SafeAreaView>
  );
};

export default MocapPlayBack;
