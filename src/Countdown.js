import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useInterval from 'react-useinterval';

const COUNT_DOWN_SECS = 3;

export default function Countdown(props) {
  const { start, startGame } = props;
  if (!start) {
    return <Text></Text>;
  }

  const [count, setCount] = useState(COUNT_DOWN_SECS);

  const decreaseCount = () => {
    setCount(count - 1);
    if (count === 0) {
      startGame();
    }
  };

  useInterval(decreaseCount, 1000);
  return <Text style={styles.countdown}>{start && count >= 0 ? count : null}</Text>;
}

const styles = StyleSheet.create({
  countdown: {
    fontSize: 100,
    color: 'black'
  }
});
