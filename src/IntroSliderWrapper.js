import React from 'react';
import { StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import eyeIcon from './assets/eye_icon.png'

const slides = [
  {
    key: 1,
    text: "Make sure your phone is steady and that your face and eyes are facing to the camera",
    button: false
  },
  {
    key: 2,
    text: "Once you're set up, a countdown will automatically begin",
    button: false
  },
  {
    key: 3,
    text: "You will have 3 seconds to get ready and then all you need to do is not blink!",
    button: false
  },
  {
    key: 4,
    text: "Are you ready?",
    button: true
  }
];

export default function IntroSlideWrapper(props) {

  _renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={eyeIcon} />
        <Text style={styles.text}>{item.text}</Text>
        {
          item.button === true
          ? null : null
        }
      </View>
    );
  }

  _onDone = () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    this.setState({ showRealApp: true });
  }

  return <AppIntroSlider renderItem={this._renderItem} data={slides} onDone={this._onDone}/>;
}
