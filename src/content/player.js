import { getVideoElement } from "../utils/utils";

export default class Player {
  constructor() {
    this._video = getVideoElement();
  }

  //
  // methods
  //

  get currentTime() {
    return this._video.currentTime;
  }

  get video() {
    return this._video;
  }

  play() {
    this._video.play();
  }

  pause() {
    this._video.pause();
  }

  seek(time) {
    this._video.currentTime = time;
  }
}
