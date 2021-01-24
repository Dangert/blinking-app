import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { RFValue } from "react-native-responsive-fontsize";
import eyeIcon from './assets/eye_icon.png'

const { height, width } = Dimensions.get('window');
const slides = [
  {
    key: '1',
    text: "Make sure you are facing the camera and your phone is steady",
    button: false
  },
  {
    key: '2',
    text: "Once you're set up, a countdown will automatically begin",
    button: false
  },
  {
    key: '3',
    text: "You will have 3 seconds to get ready and then all you need to do is not blink!",
    button: false
  },
  {
    key: '4',
    text: "Are you ready?",
    button: true
  }
];

export default function IntroSlideWrapper(props) {

  const { setRouteToGame } = props;

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image style={styles.image} source={eyeIcon} resizeMode="contain"/>
        <Text style={styles.text}>{item.text}</Text>
        {
          item.button === true
          ? null : null
        }
      </View>
    );
  }

  return <AppIntroSlider renderItem={renderItem} data={slides} onDone={setRouteToGame} showSkipButton={true} bottomButton={true} doneLabel={'Play'}/>;
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#59b2ab',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    flex: 1,
    fontSize: RFValue(20),
    marginLeft: 0.1*width,
    marginRight: 0.1*width,
    textAlign: 'center'
  },
  image: {
    flex: 1,
    width: width*0.4
  }
})
