import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { RFValue } from "react-native-responsive-fontsize";
import * as Animatable from 'react-native-animatable';
import { useKeepAwake } from 'expo-keep-awake';

const { height, width } = Dimensions.get('window');
const CAMERA_TYPE = Camera.Constants.Type.front;
const OPEN_EYE_PROBABILITY_THRESHOLD = 0.985;
const COUNT_DOWN_SECS = 3;

export default function Game(props) {
  const { imagePadding, ratio, setCameraReady, isStopwatchActive, startStopwatch, stopStopwatch, setRouteToRestart } = props;
  const [countdownStarted, setCountdownStarted] = useState(false); //starts when face is detected
  const [camera, setCamera] = useState(null);
  const [countdown, setCountdown] = useState(COUNT_DOWN_SECS);
  const countdownRef = useRef();

  const handleCountdown = () => {
    if (countdown >= 0){
      setCountdown(c => c - 1);
    }
  };

  useEffect(() => {
    if (countdownStarted) {
      const id = setInterval(handleCountdown, 1000);
      countdownRef.current = id;
    }
    else {
      clearInterval(countdownRef.current);
    }
  }, [countdownStarted])

  useEffect(() => {
    if (countdown === -1) {
      startStopwatch();
    }
  }, [countdown])

  useEffect(() => {

    return (() => {
      clearInterval(countdownRef.current)
    })
  }, [])

  const initCountdown = () => {
    setCountdownStarted(true);
  }

  const clearCountdown = () => {
    setCountdownStarted(false);
    setCountdown(COUNT_DOWN_SECS);
  }

  const endGame = () => {
    stopStopwatch();
    setRouteToRestart();
  }

  const handleFacesDetected = ({ faces }) => {
    if (faces.length === 1) { // face and eyes are detected
      if (isStopwatchActive &&
        (
          !faces[0].leftEyeOpenProbability || !faces[0].rightEyeOpenProbability ||
          faces[0].leftEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD || faces[0].rightEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD
        ))
        {
          endGame();
      }
      else if (!countdownStarted) {
        initCountdown();
      }
    }
    else {
      if (isStopwatchActive) {
        endGame();
      }
      else if (countdownStarted) {
        clearCountdown();
      }
    }
  }

  const handleFaceDetectionError = () => {
  }

  useKeepAwake();
  return (
    <View style={styles.container}>
      <Camera
        style={[styles.cameraPreview, {marginTop: imagePadding, marginBottom: imagePadding}]}
        type={CAMERA_TYPE}
        onCameraReady={() => setCameraReady(camera)}
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
      </Camera>
      {
        countdownStarted && countdown >= 0 ?
        <View style={styles.countdownContainer}>
          <Animatable.View animation='bounceIn' duration={1000} iterationCount={COUNT_DOWN_SECS+1} style={styles.countdownAnimContainer}>
            <Text style={styles.countdown}>{countdown > 0 ? countdown : 'Go'}</Text>
          </Animatable.View>
        </View>
        : null
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cameraPreview: {
    flex:1
  },
  countdownContainer: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom:0,
    alignItems: "center", justifyContent:'center'
  },
  countdownAnimContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(171, 217, 217, 0.5)',
    height: 0.5*width,
    width: 0.5*width,
    borderRadius: width
  },
  countdown: {
    fontSize: RFValue(100),
    color: '#17344a'
  }
});
