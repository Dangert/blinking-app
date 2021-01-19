import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import useInterval from 'react-useinterval';

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
  return <Text style={styles.countdown}>{start && count >= 0 ? count : null}</Text>;
}

const styles = StyleSheet.create({
  countdown: {
    fontSize: 100,
    textShadowColor: 'white',
    textShadowRadius: 1,
    textShadowOffset: {
      width: 1,
      height: 1
    },
    color: 'black'
  }
});
