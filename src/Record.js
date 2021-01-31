import React from "react";
import { Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './utils/styles';
import { formatTime } from './utils';
const { height, width } = Dimensions.get('window');

export default function Record(props) {
  const { time, isOld, animDelay } = props;

  return (
    <Animatable.View animation='slideInUp' delay={animDelay} style={{flex: 1}}>
      <Text style={styles.text}>Your {isOld ? 'old ' : null}record</Text>
      <Text style={[styles.text, recordStyles.recordTime]}>{formatTime(time)}</Text>
    </Animatable.View>
  )
}

const recordStyles = StyleSheet.create({
  recordTime: {
    backgroundColor: '#c2e0e0',
    borderRadius: width*0.05,
    marginTop: height*0.01,
    paddingVertical: height*0.007,
    paddingHorizontal: width*0.05
  }
});
