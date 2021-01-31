import React from "react";
import { Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from './utils/styles';
import { RFValue } from "react-native-responsive-fontsize";

export default function PlayButton(props) {
  const { restartGame, isRestart, animDelay } = props;

  return (
    <Animatable.View animation='slideInUp' delay={animDelay}>
      <TouchableOpacity style={styles.button} onPress={restartGame}>
        <Text style={{fontSize: RFValue(20), color: '#02245a'}}>Play{isRestart ? ' again' : null}</Text>
      </TouchableOpacity>
    </Animatable.View>
  )
}
