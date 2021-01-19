import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CameraWrapper from './CameraWrapper';
import Countdown from './Countdown';

const OPEN_EYE_PROBABILITY_THRESHOLD = 0.985;

export default function Game(props) {
  const { imagePadding, ratio, setCameraReady, setCamera, isStopwatchStarted, setIsStopwatchStarted } = props;
  const [countDownStarted, setCountDownStarted] = useState(false); //starts when face detected

  const initCountDown = () => {
    setCountDownStarted(true);
  }

  const cancelCountDown = () => {
    setCountDownStarted(false);
  }

  const handleFacesDetected = ({ faces }) => {
    if (faces.length === 1) { // face is detected
      console.log(faces[0]);
      //console.log('LEFT POSITION: ' + faces[0].leftEyePosition);
      console.log('LEFT PROBABILITY: ' + faces[0].leftEyeOpenProbability);
      //console.log('LEFT POSITION: ' + faces[0].rightEyePosition);
      console.log('LEFT PROBABILITY: ' + faces[0].rightEyeOpenProbability);
      console.log('');

      if (!countDownStarted) {
        initCountDown();
      }
      if (isStopwatchStarted && faces[0].leftEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD
        && faces[0].rightEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD) {
          console.log('stop game');
          // game and stopwatch should be stopped
          setIsStopwatchStarted(false);
        }
    }
    else {
      cancelCountDown();
    }
  }

  const handleFaceDetectionError = () => {
  }

  return (
    <View style={styles.container}>
      <CameraWrapper style={{position: 'relative'}} imagePadding={imagePadding} setCameraReady={setCameraReady} setCamera={setCamera} handleFacesDetected={handleFacesDetected}
      handleFaceDetectionError={handleFaceDetectionError} countDownStarted={countDownStarted} />
      <View style={{position: 'absolute', top: 0, right: 0, left:0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}>
        <Countdown start={countDownStarted} startStopwatch={() => setIsStopwatchStarted(true)}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center'
  }
});