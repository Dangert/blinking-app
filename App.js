import React, { useEffect, useState, useRef } from "react";
import { Text, View, Dimensions, Platform, StatusBar, BackHandler, Animated, DeviceEventEmitter } from 'react-native';
import * as Permissions from 'expo-permissions';
import Game from './src/Game';
import Record from './src/Record';
import Stopwatch from './src/Stopwatch';
import PlayButton from './src/PlayButton';
import ReminderButton from './src/ReminderButton';
import IntroSliderWrapper from './src/IntroSliderWrapper';
import { useStopwatch } from './src/customHooks';
import { formatTime } from './src/utils';
import * as Animatable from 'react-native-animatable';
import { RFValue } from "react-native-responsive-fontsize";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { styles } from './src/utils/styles';
import FlashMessage, { showMessage } from "react-native-flash-message";

const Routes = require('./src/routes.js');
const { height, width } = Dimensions.get('window');
const STORAGE_KEY = '@save_record';
const homeRoutes = [Routes.START, Routes.RESTART];

export default function App() {
  const [route, setRoute] = useState(Routes.INTRO);
  const [hasCameraPermission, setCameraPermission] = useState(false);
  const recordTime = useRef(0);
  const backCount = useRef(0);
  const routeStack = useRef([]);
  const { isRunning, elapsedTime, startStopwatch, stopStopwatch, resetStopwatch } = useStopwatch();
  const backPressSubscriptions = useRef(new Set()); //back handler bug fix

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

  const _setRoute = (newRoute, push=true) => {
    if (push) {
      routeStack.current.push(route); // current route
    }
    backCount.current = 0;
    setRoute(newRoute);
  }

  const setRecordBroken = () => {
    if (parseInt(elapsedTime) > parseInt(recordTime.current)){
      recordTime.current = elapsedTime;
      saveRecord();
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
    _setRoute(Routes.GAME);
  }

  const saveRecord = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, recordTime.current);
    } catch (e) {
      alert('Failed to save your record');
    }
  }

  const readRecord = async () => {
    try {
      const record = await AsyncStorage.getItem(STORAGE_KEY);

      if (record !== null) {
        recordTime.current = record;
        _setRoute(Routes.START);
      }
    } catch (e) {
      alert('Failed to fetch your record');
    }
  }

  const backAction = () => {
    if (homeRoutes.includes(route) || routeStack.current.length === 0) {
      backCount.current = backCount.current + 1;
      if (backCount.current === 1) {
        showMessage({message: 'Tap again to exit', color: 'black', backgroundColor: 'white'});
      }
      else {
        routeStack.current = [];
        backCount.current = 0;
        BackHandler.exitApp();
      }
    }
    else { // back to prev route
      const prevRoute = routeStack.current.pop();
      _setRoute(prevRoute, false);
    }
  }

  const setBackPressListeners = () => {
    DeviceEventEmitter.removeAllListeners('hardwareBackPress');
    DeviceEventEmitter.addListener('hardwareBackPress', () => {
      let invokeDefault = true
      const subscriptions = []

      backPressSubscriptions.current.forEach(sub => subscriptions.push(sub))

      for (let i = 0; i < subscriptions.reverse().length; i += 1) {
        if (subscriptions[i]()) {
          invokeDefault = false
          break
        }
      }
    })
  }

  const clearBackPressListeners = () => {
    DeviceEventEmitter.removeAllListeners('hardwareBackPress');
    backPressSubscriptions.current.clear();
  }

  useEffect(() => {
    (async function requestCameraPermission() {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setCameraPermission(status === 'granted');
    })();

    readRecord();
    setBackPressListeners(); // back handler bug fix

    return () => {
      clearBackPressListeners(); // back handler bug fix
    }
  }, []);

  useEffect(() => {
    backPressSubscriptions.current.add(backAction);

    return () =>
      backPressSubscriptions.current.delete(backAction);
  }, [route])

  const renderRoute = () => {
    switch(route) {
      case Routes.INTRO:
        return <IntroSliderWrapper setRouteToGame={restartGame}/>
      case Routes.START:
        return (
          <View style={[styles.container, styles.startContainer]}>
            <Animatable.Text animation='slideInUp' style={[styles.text, styles.messageText, {fontSize: RFValue(36), marginTop: height*0.2}]}>Welcome back!</Animatable.Text>
            <Record time={recordTime.current} isOld={false} animDelay={200} />
            <PlayButton isRestart={false} restartGame={restartGame} animDelay={400} />
            <ReminderButton setRouteToIntro={() => _setRoute(Routes.INTRO)} animDelay={600} />
          </View>
        );
      case Routes.GAME:
        return (
          <View style={styles.gameContainer}>
            <Game style={{display: 'none'}} imagePadding={imagePadding}  ratio={ratio} setCameraReady={setCameraReady} isStopwatchActive={isRunning}
            startStopwatch={startStopwatch} stopStopwatch={stopStopwatch} setRouteToRestart={() => _setRoute(Routes.RESTART)} />
            <Stopwatch route={route} elapsedTime={elapsedTime} />
          </View>
        )
      default: //Routes.RESTART
        const prevRecordTime = recordTime.current;
        const isFirstTime = prevRecordTime === 0;
        const isRecordBroken = setRecordBroken();
        return (
          <View style={[styles.container, styles.startContainer]}>
            <Stopwatch route={route} elapsedTime={elapsedTime} />
            <Animatable.Text animation='slideInUp' style={[styles.text, styles.messageText, {fontSize: RFValue(28)}]}>{getResultText(isFirstTime, isRecordBroken)}</Animatable.Text>
            <Record time={isFirstTime ? recordTime.current : prevRecordTime} isOld={isRecordBroken && !isFirstTime} animDelay={200} />
            <PlayButton isRestart={true} restartGame={restartGame} animDelay={400} />
            <ReminderButton setRouteToIntro={() => _setRoute(Routes.INTRO)} animDelay={600} />
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
          ? <Text style={[styles.text, {fontWeight: 'bold'}]}>Please grant us access to camera</Text>
          : renderRoute()
      }
      <FlashMessage style={{alignItems: 'center'}} position={'bottom'}/>
    </View>
  );
}
