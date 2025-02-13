import React from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 350,
  facingMode: "user",
};

function WebcamScreen() {
  return (
    <Webcam
      audio={false}
      screenshotFormat="image/jpeg"
      videoConstraints={videoConstraints}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default React.memo(WebcamScreen);
