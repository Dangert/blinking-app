import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import * as FaceDetector from 'expo-face-detector';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { DeviceMotion } from 'expo-sensors';
const { width: winWidth, height: winHeight } = Dimensions.get('window');


const COUNT_DOWN_SECS = 3;
const MOTION_INTERVAL = 500; //ms between each device motion reading
const MOTION_TOLERANCE = 1; //allowed variance in acceleration
const CAMERA_TYPE = Camera.Constants.Type.front;

export default function App() {
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const [faceDetecting, setFaceDetecting] = useState(false); //when true, we look for faces
  const [faceDetected, setFaceDetected] = useState(false); //when true, we've found a face
  const [countDownSeconds, setCountDownSeconds] = useState(COUNT_DOWN_SECS); //current available seconds before photo is taken
  const [countDownStarted, setCountDownStarted] = useState(false); //starts when face detected
  const [detectMotion, setDetectMotion] = useState(false); //when true we attempt to determine if device is still
  const [motion, setMotion] = useState(); //captures the reading of the device motion
  const prevMotion = useRef();
  const countDownTimer = useRef();
  const motionListener = useRef();
  const didMount = useRef(false);

  handleDetectMotion = (doDetect) => {
    setDetectMotion(doDetect);
    if (doDetect){
      DeviceMotion.setUpdateInterval(MOTION_INTERVAL);
    }
    else if (!doDetect && faceDetecting) {
      motionListener.current.remove();
    }
  }

  onDeviceMotion = (rotation) => {
    setMotion(rotation.accelerationIncludingGravity);
  };

  useEffect(() => {
    if (!didMount.current) {
      (async function requestCameraPermission() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        setCameraPermission(status === 'granted');
      })();
      didMount.current = true;
    }

    motionListener.current = DeviceMotion.addListener(onDeviceMotion);
    motionListener.current.remove();
    handleDetectMotion(true);
  }, []);

  useEffect(() => {
    if (detectMotion && motion && prevMotion.current){
      if (
      Math.abs(motion.x - prevMotion.current.x) < MOTION_TOLERANCE
      && Math.abs(motion.y - prevMotion.current.y) < MOTION_TOLERANCE
      && Math.abs(motion.z - prevMotion.current.z) < MOTION_TOLERANCE
      ){
        //still
        setFaceDetecting(true);
        setDetectMotion(false);
      }
    }
    if (motion !== prevMotion.current) {
        prevMotion.current = motion;
    }
  }, [motion])

  initCountDown = () => {
    setCountDownStarted(true);
    countDownTimer.current = setInterval(this.handleCountDownTime, 1000);
  }

  cancelCountDown = () => {
    clearInterval(countDownTimer.current);
    setCountDownSeconds(COUNT_DOWN_SECS);
    setCountDownStarted(false);
  }

  handleFacesDetected = ({ faces }) => {
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

  handleFaceDetectionError = () => {
  }

  return (
    <View style={styles.container}>
    {
      hasCameraPermission === null
      ? null
      : hasCameraPermission === false
        ? <Text style={styles.textStandard}>No access to camera</Text>
        : <View style={styles.container}>
            <Camera
              style={styles.cameraPreview}
              type={CAMERA_TYPE}
              onFacesDetected={faceDetecting ? handleFacesDetected : undefined }
              onFaceDetectionError={handleFaceDetectionError}
              faceDetectorSettings={{
                mode: FaceDetector.Constants.Mode.fast,
                detectLandmarks: FaceDetector.Constants.Mode.none,
                runClassifications: FaceDetector.Constants.Mode.all,
              }}>
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStandard: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black'
  },
  countdown: {
    fontSize: 40,
    color: 'white'
  },
  cameraPreview: {
    flex:1,
    height: winHeight*0.7,
    width: winWidth,
    position: 'absolute',
    left: -205,
    top: 100,
    right: 0,
    bottom: 0,
  },
});
