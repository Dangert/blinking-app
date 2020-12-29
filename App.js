import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Dimensions, Platform, StatusBar } from 'react-native';
import * as FaceDetector from 'expo-face-detector';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { DeviceMotion } from 'expo-sensors';
import Countdown from './src/Countdown'

const MOTION_INTERVAL = 2500; //ms between each device motion reading
const MOTION_TOLERANCE = 1; //allowed variance in acceleration
const CAMERA_TYPE = Camera.Constants.Type.front;


export default function App() {
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const [faceDetecting, setFaceDetecting] = useState(false); //when true, we look for faces
  const [faceDetected, setFaceDetected] = useState(false); //when true, we've found a face
  const [countDownStarted, setCountDownStarted] = useState(false); //starts when face detected
  const [detectMotion, setDetectMotion] = useState(false); //when true we attempt to determine if device is still
  const didMount = useRef(false);
  const [camera, setCamera] = useState(null); // MIGHT BE UNNECESSARY

  // MIGHT BE UNNECESSARY - motion check is done only before the face is detected for the FIRST time, and countdown is based SOLELY on face detection
  const [motion, setMotion] = useState();
  const prevMotion = useRef();
  const motionListener = useRef();

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

  const handleDetectMotion = (doDetect) => {
    //console.log('doDetect ' + doDetect);
    //console.log('faceDetecting ' + faceDetecting);
    setDetectMotion(doDetect);
    if (doDetect){
      DeviceMotion.setUpdateInterval(MOTION_INTERVAL);
    }
    else if (!doDetect && faceDetecting) {
      //console.log('removing listener');
      motionListener.current.remove();
    }
  }

  const onDeviceMotion = (rotation) => {
    //console.log('onDeviceMotion ' + rotation);
    setMotion(rotation.accelerationIncludingGravity);
  };

  useEffect(() => {
    //console.log('1st useEffect');
    if (!didMount.current) {
      (async function requestCameraPermission() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        setCameraPermission(status === 'granted');
      })();
      didMount.current = true;
    }


    motionListener.current = DeviceMotion.addListener(onDeviceMotion);
    handleDetectMotion(true);
  }, []);

  useEffect(() => {
    console.log('2nd useEffect');
    //console.log('detectMotion ', detectMotion);
    //console.log('prevMotion ' + prevMotion);
    //console.log('motion ' + motion);
    if (detectMotion && motion && prevMotion.current){
      if (
      Math.abs(motion.x - prevMotion.current.x) < MOTION_TOLERANCE
      && Math.abs(motion.y - prevMotion.current.y) < MOTION_TOLERANCE
      && Math.abs(motion.z - prevMotion.current.z) < MOTION_TOLERANCE
      ){
        //still
        console.log('setting face detecting true');
        setFaceDetecting(true);
        handleDetectMotion(false);
      }
    }
    if (motion !== prevMotion.current) {
        prevMotion.current = motion;
    }
  }, [motion])

  const initCountDown = () => {
    setCountDownStarted(true);
  }

  const cancelCountDown = () => {
    setCountDownStarted(false);
  }

  const handleFacesDetected = ({ faces }) => {
    if (faces.length === 1) {
        setFaceDetected(true)
        if (!countDownStarted) {
          initCountDown();
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
              onFacesDetected={faceDetecting ? handleFacesDetected : undefined }
              onFaceDetectionError={handleFaceDetectionError}
              faceDetectorSettings={{
                mode: FaceDetector.Constants.Mode.fast,
                detectLandmarks: FaceDetector.Constants.Mode.none,
                runClassifications: FaceDetector.Constants.Mode.all,
              }}>
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Countdown start={countDownStarted}/>
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
