import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Dimensions, Platform, StatusBar } from 'react-native';
import * as FaceDetector from 'expo-face-detector';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import Countdown from './src/Countdown';
//import Stopwatch from './src/Stopwatch';
//'react-timer-hook'
import { Stopwatch } from 'rn-stopwatch-timer';

const CAMERA_TYPE = Camera.Constants.Type.front;
const OPEN_EYE_PROBABILITY_THRESHOLD = 0.98;


export default function App() {
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false); //when true, we've found a face
  const [countDownStarted, setCountDownStarted] = useState(false); //starts when face detected
  const [isGameStarted, setIsGameStarted] = useState(false);
  const didMount = useRef(false);
  const [camera, setCamera] = useState(null); // MIGHT BE UNNECESSARY

  // Screen Ratio and image padding
  const [imagePadding, setImagePadding] = useState(0);
  const [ratio, setRatio] = useState('4:3');  // default is 4:3
  const { height, width } = Dimensions.get('window');
  const screenRatio = height / width;
  const [isRatioSet, setIsRatioSet] =  useState(false);

  // set the camera ratio and padding.
  // this code assumes a portrait mode screen
  const prepareRatio = async () => {
    let desiredRatio = '4:3';  // Start with the system default
    // This issue only affects Android
    if (Platform.OS === 'android') {
      const ratios = await camera.getSupportedRatiosAsync();

      // Calculate the width/height of each of the supported camera ratios
      // These width/height are measured in landscape mode
      // find the ratio that is closest to the screen ratio without going over
      let distances = {};
      let realRatios = {};
      let minDistance = null;
      for (const ratio of ratios) {
        const parts = ratio.split(':');
        const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
        realRatios[ratio] = realRatio;
        // ratio can't be taller than screen, so we don't want an abs()
        const distance = screenRatio - realRatio;
        distances[ratio] = realRatio;
        if (minDistance == null) {
          minDistance = ratio;
        } else {
          if (distance >= 0 && distance < distances[minDistance]) {
            minDistance = ratio;
          }
        }
      }
      // set the best match
      desiredRatio = minDistance;
      //  calculate the difference between the camera width and the screen height
      const remainder = Math.floor(
        (height - realRatios[desiredRatio] * width) / 2
      );
      // set the preview padding and preview ratio
      setImagePadding(remainder / 2);
      setRatio(desiredRatio);
      // Set a flag so we don't do this
      // calculation each time the screen refreshes
      setIsRatioSet(true);
    }
  };

  // the camera must be loaded in order to access the supported ratios
  const setCameraReady = async() => {
    if (!isRatioSet) {
      await prepareRatio();
    }
  };

  const startGame = () => {
    console.log('start game');
    setIsGameStarted(true);
  }

  useEffect(() => {
    //console.log('1st useEffect');
    if (!didMount.current) {
      (async function requestCameraPermission() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        setCameraPermission(status === 'granted');
      })();
      didMount.current = true;
    }
  }, []);

  const initCountDown = () => {
    setCountDownStarted(true);
  }

  const cancelCountDown = () => {
    setCountDownStarted(false);
  }

  const handleFacesDetected = ({ faces }) => {
    if (faces.length === 1) {
      console.log(faces[0]);
      //console.log('LEFT POSITION: ' + faces[0].leftEyePosition);
      console.log('LEFT PROBABILITY: ' + faces[0].leftEyeOpenProbability);
      //console.log('LEFT POSITION: ' + faces[0].rightEyePosition);
      console.log('LEFT PROBABILITY: ' + faces[0].rightEyeOpenProbability);
      console.log('');

      setFaceDetected(true)
      if (!countDownStarted) {
        initCountDown();
      }
      if (isGameStarted && faces[0].leftEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD
        && faces[0].rightEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD) {
          console.log('stop game');
          // game and stopwatch should be stopped
          setIsGameStarted(false);
        }
    }
    else {
      setFaceDetected(false);
      cancelCountDown();
    }
  }

  const handleFaceDetectionError = () => {
  }

  return (
    <View style={styles.container}>
    <StatusBar hidden />
    {
      hasCameraPermission === null
      ? null
      : hasCameraPermission === false
        ? <Text style={styles.textStandard}>No access to camera</Text>
        : <View style={styles.container}>
            <Camera
              style={[styles.cameraPreview, {marginTop: imagePadding, marginBottom: imagePadding}]}
              type={CAMERA_TYPE}
              onCameraReady={setCameraReady}
              ratio={ratio}
              ref={(ref) => {
                setCamera(ref);
              }}
              onFacesDetected={handleFacesDetected}
              onFaceDetectionError={handleFaceDetectionError}
              faceDetectorSettings={{
                mode: FaceDetector.Constants.Mode.fast,
                detectLandmarks: FaceDetector.Constants.Landmarks.none,
                runClassifications: FaceDetector.Constants.Classifications.all,
              }}>
              <View style={{alignItems: 'center'}}>
                <Stopwatch laps msecs start={isGameStarted} options={options} />
              </View>
              <View style={{position: 'absolute', top: 0, right: 0, left:0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}>
                <Countdown start={countDownStarted} startGame={startGame}/>
              </View>
              <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                position: 'absolute',
                bottom: 0,
              }}>
                <Text
                  style={styles.textStandard}>
                  {faceDetected ? 'Face Detected' : 'No Face Detected'}
                </Text>
              </View>
            </Camera>
          </View>
    }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center'
  },
  textStandard: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black'
  },
  cameraPreview: {
    flex:1
  },
});

const options = {
  container: {
    backgroundColor: '#0ae',
    alignItems: 'center',
    padding: 5,
    marginTop: 10,
    borderRadius: 20,
    width: '50%',
  },
  text: {
    fontSize: 30,
    color: '#FFF'
  }
};
