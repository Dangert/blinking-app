import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Dimensions, Platform, StatusBar } from 'react-native';
import * as Permissions from 'expo-permissions';
import Game from './src/Game';
//'react-timer-hook'
import { Stopwatch } from 'rn-stopwatch-timer';


export default function App() {
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const [isStopwatchStarted, setIsStopwatchStarted] = useState(false);
  const didMount = useRef(false);
  const [camera, setCamera] = useState(null);

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
      console.log(desiredRatio);
      console.log(remainder / 2);
      setIsRatioSet(true);
    }
  };

  // the camera must be loaded in order to access the supported ratios
  const setCameraReady = async() => {
    if (!isRatioSet) {
      await prepareRatio();
    }
  };

  const startStopwatch = () => {
    console.log('start game');
    setIsStopwatchStarted(true);
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

  return (
    <View style={styles.container}>
    <StatusBar hidden />
    {
      hasCameraPermission === null
      ? null
      : hasCameraPermission === false
        ? <Text style={styles.textStandard}>No access to camera</Text>
        : <View style={styles.container}>
            <Game style={{display: 'none'}} imagePadding={imagePadding}  ratio={ratio} setCameraReady={setCameraReady} setCamera={setCamera}
            isStopwatchStarted={isStopwatchStarted} setIsStopwatchStarted={setIsStopwatchStarted} />
            <View style={{alignItems: 'center', marginTop:20, position: 'absolute', bottom: 0, top: 0, left: 0, right: 0}}>
              <Stopwatch laps msecs start={isStopwatchStarted} options={stopwatchStyles} />
            </View>
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
  }
});

const stopwatchStyles = {
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
