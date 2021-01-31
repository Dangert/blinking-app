import React from "react";
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { formatTime } from './utils';
import { RFValue } from "react-native-responsive-fontsize";

const Routes = require('./routes.js');
const { height, width } = Dimensions.get('window');

export default function Stopwatch(props) {
  const { route, elapsedTime } = props;
  const customStyles = route === Routes.GAME ? gameStyles : restartStyles;
  const animation = route === Routes.GAME ? '' : 'zoomIn';

  return (
    <View style={customStyles.container}>
      <Animatable.Text animation={animation} style={[generalStyles.text, customStyles.text]}>{formatTime(elapsedTime)}</Animatable.Text>
    </View>
  )
}

const gameStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: width*0.25,
    width: width*0.5,
    marginTop: height*0.03,
    alignItems: 'center'
  },
  text: {
    fontSize: RFValue(25),
    paddingHorizontal: width*0.05
  }
});

const restartStyles = StyleSheet.create({
  container: {
    flex: 1.5,
    justifyContent: 'center'
  },
  text: {
    fontSize: RFValue(40),
    paddingHorizontal: width*0.12
  },
})

const generalStyles = StyleSheet.create({
  text: {
    backgroundColor: '#0f3166',
    color: '#FFF',
    paddingVertical: height*0.007,
    borderRadius: width*0.05,
  }
})
