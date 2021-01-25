import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Dimensions, Platform, StatusBar, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import Game from './src/Game';
import IntroSliderWrapper from './src/IntroSliderWrapper';
import { useStopwatch } from './src/customHooks';
import { formatTime } from './src/utils';
import * as Animatable from 'react-native-animatable';
import { RFValue } from "react-native-responsive-fontsize";
const Routes = require('./src/routes.js');
const { height, width } = Dimensions.get('window');

export default function App() {
  const [route, setRoute] = useState(Routes.INTRO);
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const recordTime = useRef(0);
  const didMount = useRef(false);
  const { isRunning, elapsedTime, startStopwatch, stopStopwatch, resetStopwatch } = useStopwatch();

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

  const setRecordBroken = () => {
    if (parseInt(elapsedTime) > parseInt(recordTime.current)){
      console.log('setting record');
      recordTime.current = elapsedTime;
      return true;
    }
    return false;
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

  const renderRecord = (time, isOld=false) => {
    return (
      <Animatable.View animation='slideInUp' delay={200} style={{flex: 1}}>
        <Text style={styles.text}>Your {isOld ? 'old ' : null}record</Text>
        <Text style={[styles.text, styles.recordTime]}>{formatTime(time)}</Text>
      </Animatable.View>
    )
  }

  const renderPlayButton = (isRestart=false) => {
    return (
      <Animatable.View animation='slideInUp' delay={400}>
        <TouchableOpacity style={styles.button} onPress={restartGame}>
          <Text style={{fontSize: RFValue(20), color: '#02245a'}}>Play{isRestart ? ' again' : null}</Text>
        </TouchableOpacity>
      </Animatable.View>
    )
  }

  const renderStopwatch = () => {
    const stopwatchContainerStyle = route === Routes.GAME ? styles.stopwatchGame : styles.stopwatchOnRestart;
    const extraTextStyle = route === Routes.GAME ? styles.stopwatchOnGameText : styles.stopwatchOnRestartText;
    const animation = route === Routes.GAME ? '' : 'zoomIn';
    return (
      <View style={stopwatchContainerStyle}>
        <Animatable.Text animation={animation} style={[styles.stopwatchText, extraTextStyle]}>{formatTime(elapsedTime)}</Animatable.Text>
      </View>
    )
  }

  const renderRoute = () => {
    console.log(route)
    switch(route) {
      case Routes.INTRO:
        return <IntroSliderWrapper setRouteToGame={restartGame}/>
      case Routes.START:
        return (
          <View style={[styles.container, styles.startContainer]}>
            <Animatable.Text animation='slideInUp' style={[styles.text, styles.messageText, {fontSize: RFValue(36), marginTop: height*0.2}]}>Welcome back!</Animatable.Text>
            {renderRecord(recordTime.current)}
            {renderPlayButton()}
            <TouchableOpacity style={styles.reminderButton} onPress={() => setRoute(Routes.INTRO)}>
              <Animatable.Text animation='slideInUp' style={{fontSize: RFValue(12), color: '#fff'}}>Need a Reminder?</Animatable.Text>
            </TouchableOpacity>
          </View>
        );
      case Routes.GAME:
        return (
          <View style={styles.gameContainer}>
            <Game style={{display: 'none'}} imagePadding={imagePadding}  ratio={ratio} setCameraReady={setCameraReady} isStopwatchActive={isRunning}
            startStopwatch={startStopwatch} stopStopwatch={stopStopwatch} setRouteToRestart={() => setRoute(Routes.RESTART)} />
            {renderStopwatch()}
          </View>
        )
      default: //Routes.RESTART
        const prevRecordTime = recordTime.current;
        console.log(prevRecordTime === 0);
        const isFirstTime = prevRecordTime === 0;
        const isRecordBroken = setRecordBroken();
        return (
          <View style={[styles.container, styles.startContainer]}>
            {renderStopwatch()}
            <Animatable.Text animation='slideInUp' style={[styles.text, styles.messageText, {fontSize: RFValue(28)}]}>{getResultText(isFirstTime, isRecordBroken)}</Animatable.Text>
            {renderRecord(isFirstTime ? recordTime.current : prevRecordTime, isRecordBroken && !isFirstTime)}
            {renderPlayButton(true)}
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
    alignItems: 'center',
    marginTop: height*0.025
  },
  textStandard: {
    fontSize: RFValue(18),
    marginBottom: height*0.0125,
    color: 'black'
  },
  button: {
    marginBottom: height*0.08,
    alignItems: 'center',
    backgroundColor: '#b8da95',
    paddingVertical: height*0.018,
    paddingHorizontal: width*0.2,
    borderRadius: width*0.08
  },
  text: {
    fontSize: RFValue(20),
    marginHorizontal: 0.1*width,
    textAlign: 'center',
    color: '#02245a'
  },
  recordTime: {
    backgroundColor: '#c2e0e0',
    borderRadius: width*0.05,
    marginTop: height*0.01,
    paddingVertical: height*0.007,
    paddingHorizontal: width*0.05
  },
  stopwatchGame: {
    position: 'absolute',
    top: 0, left: width*0.25,
    width: width*0.5,
    marginTop: height*0.03,
    alignItems: 'center'
  },
  stopwatchOnRestart: {
    flex: 1.5,
    justifyContent: 'center'
  },
  stopwatchText: {
    backgroundColor: '#0f3166',
    color: '#FFF',
    paddingVertical: height*0.007,
    borderRadius: width*0.05,
  },
  stopwatchOnRestartText: {
    fontSize: RFValue(40),
    paddingHorizontal: width*0.12
  },
  stopwatchOnGameText: {
    fontSize: RFValue(25),
    paddingHorizontal: width*0.05
  },
  reminderButton: {
    marginBottom: height*0.02,
    alignItems: 'center',
    backgroundColor: '#646868',
    paddingVertical: height*0.01,
    paddingHorizontal: width*0.05,
    borderRadius: width*0.08,
  },
  messageText: {
    flex:1,
    fontWeight:'bold'
  }
});
