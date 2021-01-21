import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Dimensions, Platform, StatusBar, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import Game from './src/Game';
import IntroSliderWrapper from './src/IntroSliderWrapper';
//'react-timer-hook'
import { Stopwatch } from 'rn-stopwatch-timer';
const Routes = require('./src/routes.js');
const regex = new RegExp(':', 'g'); // for comparing stopwatch times
const { height, width } = Dimensions.get('window');

export default function App() {
  const [route, setRoute] = useState(Routes.GAME);
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const [stopwatchStart, setStopwatchStart] = useState(false);
  const [stopwatchReset, setStopwatchReset] = useState(false);
  const stopwatchTime = useRef();
  const recordTime = useRef('0');
  const didMount = useRef(false);

  // Screen Ratio and image padding
  const [imagePadding, setImagePadding] = useState(0);
  const [ratio, setRatio] = useState('4:3');  // default is 4:3
  const screenRatio = height / width;
  const [isRatioSet, setIsRatioSet] =  useState(false);

  // set the camera ratio and padding.
  // this code assumes a portrait mode screen
  const prepareRatio = async (camera) => {
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
  const setCameraReady = async(camera) => {
    if (!isRatioSet) {
      await prepareRatio(camera);
    }
  };

  const startStopwatch = () => {
    console.log('start game');
    setStopwatchStart(true);
  }

  const stopStopwatch = () => {
    console.log('stop game');
    setStopwatchReset(false);
    setStopwatchStart(false);
  }

  const resetStopwatch = () => {
    console.log('reset game');
    setStopwatchReset(true);
  }

  const setRecordBroken = () => {
    console.log(stopwatchTime.current);
    console.log(recordTime.current);
    if (parseInt(stopwatchTime.current.replace(regex, ''), 10) > parseInt(recordTime.current.replace(regex, ''), 10)){
      recordTime.current = stopwatchTime.current;
      return true;
    }
    return false;
  }

  const getFormattedTime = (time) => {
    console.log('get time');
    stopwatchTime.current = time;
  }

  const getResultText = (isFirstTime, isRecordBroken) => {
    if (isFirstTime){
      return "Not bad for a first time!";
    }
    else if (isRecordBroken) {
      return "Nice! You broke your personal record!";
    }
    else {
      return "You can do better and you know it"
    }
  }

  const restartGame = () => {
    resetStopwatch();
    setRoute(Routes.GAME);
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

  const renderRoute = () => {
    console.log(route)
    switch(route) {
      case Routes.INTRO:
        return <IntroSliderWrapper setRouteToGame={() => setRoute(Routes.GAME)}/>
      case Routes.START:
        return null;
      case Routes.GAME:
        return (
          <View style={styles.gameContainer}>
            <Game style={{display: 'none'}} imagePadding={imagePadding}  ratio={ratio} setCameraReady={setCameraReady} stopwatchStart={stopwatchStart}
            startStopwatch={startStopwatch} stopStopwatch={stopStopwatch} setRouteToRestart={() => setRoute(Routes.RESTART)} />
            <View style={{alignItems: 'center', marginTop:20, position: 'absolute', bottom: 0, top: 0, left: 0, right: 0}}>
              <Stopwatch laps msecs start={stopwatchStart} options={stopwatchStyles} getTime={getFormattedTime} reset={stopwatchReset}/>
            </View>
          </View>
        )
      default: //Routes.RESTART
        const prevRecordTime = recordTime.current;
        console.log(prevRecordTime === '0');
        const isFirstTime = prevRecordTime === '0';
        const isRecordBroken = setRecordBroken();
        return (
          <View style={[styles.container, styles.startContainer]}>
            <View style={{flex: 1.5}}>
            </View>
            <View style={{alignItems: 'center', marginTop:20, position: 'absolute', bottom: 0, top: 0, left: 0, right: 0}}>
              <Stopwatch laps msecs start={stopwatchStart} options={{...stopwatchStyles, ...{width:'80%'}}} reset={stopwatchReset}/>
            </View>
            <Text style={[styles.text, {flex:1, fontSize: 25, fontWeight:'bold'}]}>{getResultText(isFirstTime, isRecordBroken)}</Text>
            <View style={{flex: 1}}>
              <Text style={styles.text}>Your {isRecordBroken && !isFirstTime ? 'old ' : null}record</Text>
              <Text style={[styles.text, styles.recordTime]}>{isFirstTime ? recordTime.current : prevRecordTime}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={restartGame}>
              <Text style={{fontSize: 20, color: '#000'}}>Play again</Text>
            </TouchableOpacity>
          </View>
        )
    }
  }

  return (
    <View style={styles.container}>
    <StatusBar hidden />
    {
      hasCameraPermission === null
      ? null
      : hasCameraPermission === false
        ? <Text style={styles.textStandard}>No access to camera</Text>
        : renderRoute()
    }
    </View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#59b2ab',
    justifyContent: 'center'
  },
  startContainer: {
    alignItems: 'center'
  },
  textStandard: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black'
  },
  button: {
    marginBottom: 80,
    alignItems: "center",
    backgroundColor: "#b8da95",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 50
  },
  text: {
    fontSize: 20,
    marginHorizontal: 0.1*width,
    textAlign: 'center'
  },
  recordTime: {
    backgroundColor: '#c2e0e0',
    borderRadius: 30,
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 20
  }
});

const stopwatchStyles = {
  container: {
    backgroundColor: '#0f4676',
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
