import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import useInterval from 'react-useinterval';
const { height, width } = Dimensions.get('window');

const COUNT_DOWN_SECS = 3;

export default function Countdown(props) {
  const { start, startStopwatch } = props;
  if (!start) {
    return <Text></Text>;
  }

  const [count, setCount] = useState(COUNT_DOWN_SECS);

  const decreaseCount = () => {
    setCount(count - 1);
    if (count === 0) {
      startStopwatch();
    }
  };

  useInterval(decreaseCount, 1000);
  return(
    <View style={styles.container}>
      <Text style={styles.countdown}>{start && count >= 0 ? count : null}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(171, 217, 217, 0.5)',
    height: 0.5*width,
    width: 0.5*width,
    borderRadius: width,
    alignItems: 'center',
    justifyContent: 'center'
  },
  countdown: {
    fontSize: RFValue(100),
    color: '#17344a'
  }
});
