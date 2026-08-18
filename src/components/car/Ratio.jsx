import React, { useEffect, useRef, useState } from "react";
import imgRatio from "../../assets/objects/two_way_radio.png";
import { RATIO_DISPLAY_SEC } from "../../state/parkingZoneConstants";
import { playRatioSound } from "./ratioAudio";

const Ratio = ({
  message,
  onDismiss,
  durationSec = RATIO_DISPLAY_SEC,
  playSound = true,
}) => {
  const [visible, setVisible] = useState(true);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (playSound) {
      playRatioSound();
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onDismissRef.current?.();
    }, durationSec * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [durationSec, playSound]);

  if (!visible) {
    return null;
  }

  return (
    <div className="radio-modal" data-type="ratio">
      <img className="radio-img" src={imgRatio} alt="Ratio" />

      <div className="radio-content">
        <p className="radio-text">{message}</p>
      </div>
    </div>
  );
};

export default Ratio;
