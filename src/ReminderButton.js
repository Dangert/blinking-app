import React from "react";
import { Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { RFValue } from "react-native-responsive-fontsize";

const { height, width } = Dimensions.get('window');
const Routes = require('./routes.js');

export default function ReminderButton(props) {
  const { setRouteToIntro, animDelay } = props;

  return (
    <Animatable.View delay={animDelay} animation='slideInUp'>
      <TouchableOpacity style={styles.reminderButton} onPress={setRouteToIntro}>
        <Text style={{fontSize: RFValue(12), color: '#fff'}}>Need a Reminder?</Text>
      </TouchableOpacity>
    </Animatable.View>
  )
}

const styles = StyleSheet.create({
  reminderButton: {
    marginBottom: height*0.02,
    alignItems: 'center',
    backgroundColor: '#646868',
    paddingVertical: height*0.01,
    paddingHorizontal: width*0.05,
    borderRadius: width*0.08,
  }
});
