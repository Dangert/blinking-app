import { StyleSheet, Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
import { RFValue } from "react-native-responsive-fontsize";

export const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#59b2ab',
    justifyContent: 'center'
  },
  startContainer: {
    alignItems: 'center',
    marginTop: height*0.025
  },
  button: {
    marginBottom: height*0.08,
    alignItems: 'center',
    backgroundColor: '#b8da95',
    paddingVertical: height*0.018,
    paddingHorizontal: width*0.2,
    borderRadius: width*0.08
  },
  text: {
    fontSize: RFValue(20),
    marginHorizontal: 0.1*width,
    textAlign: 'center',
    color: '#02245a'
  },
  messageText: {
    flex:1,
    fontWeight:'bold'
  },
  exitText: {
    fontSize: RFValue(12),
    position: 'absolute',
    bottom: height*0.074,
    color: '#000',
    backgroundColor: '#f2f2f2',
    borderRadius: width*0.05,
    paddingVertical: height*0.02,
    paddingHorizontal: width*0.05,
    alignSelf: 'center'
  }
});
