import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

const CAMERA_TYPE = Camera.Constants.Type.front;

export default function CameraWrapper(props) {
  const { imagePadding, ratio, setCameraReady, setCamera, handleFacesDetected, handleFaceDetectionError, countDownStarted } = props;

  return (
    <Camera
      style={[styles.cameraPreview, {marginTop: imagePadding, marginBottom: imagePadding}]}
      type={CAMERA_TYPE}
      onCameraReady={setCameraReady}
      ratio={ratio}
      ref={(ref) => {
        setCamera(ref);
      }}
      onFacesDetected={handleFacesDetected}
      onFaceDetectionError={handleFaceDetectionError}
      faceDetectorSettings={{
        mode: FaceDetector.Constants.Mode.fast,
        detectLandmarks: FaceDetector.Constants.Landmarks.none,
        runClassifications: FaceDetector.Constants.Classifications.all,
      }}>
      <View
      style={{
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
      }}>
      </View>
    </Camera>
  )
}

const styles = StyleSheet.create({
  cameraPreview: {
    flex:1
  }
});
