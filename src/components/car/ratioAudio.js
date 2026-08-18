import ratioSound from "../../assets/audio/effects/ratio.mp3";

let ratioAudio = null;

export function playRatioSound() {
  if (!ratioAudio) {
    ratioAudio = new Audio(ratioSound);
    ratioAudio.loop = false;
  }
  ratioAudio.pause();
  ratioAudio.currentTime = 0;
  ratioAudio.play().catch(() => {});
}
