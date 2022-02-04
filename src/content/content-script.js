import React from "react";
import ReactDOM from "react-dom";
import CommentBar from "./components/CommentBar";
import ReactionButton from "./components/Button";
import {
  createDiv,
  getPlayerBottomElement,
  getPlayerControlsElement,
  getVideoId,
} from "../utils/utils";
import StorageService from "./services/StorageService";
import { ID } from "../utils/constants";

const storageService = new StorageService();
let settings = null;

//
// DOM methods.
//

const placeButton = () => {
  const el = getPlayerControlsElement();
  if (el) {
    const div = createDiv(ID.BUTTON);
    el.insertBefore(div, el.childNodes[3]);
    ReactDOM.render(<ReactionButton />, div);
  }
};

const removeButton = () => {
  const button = document.getElementById(ID.BUTTON);
  button?.parentNode?.removeChild(button);
};

const placeBar = () => {
  const el = getPlayerBottomElement();
  if (el) {
    const div = createDiv(ID.BAR);
    el.insertAdjacentElement("afterbegin", div);
    ReactDOM.render(<CommentBar />, div);
  }
};

const isBarPlaced = () => !!document.getElementById(ID.BAR);
const isButtonPlaced = () => !!document.getElementById(ID.BUTTON);

//
// Other methods.
//

const validateVisuals = () => {
  if (!getVideoId(window?.location?.href) || !settings) {
    return;
  }

  const { showButton, showTimeline } = settings;

  if (!isBarPlaced() && showTimeline) {
    placeBar();
  }
  if (!isButtonPlaced() && showButton) {
    placeButton();
  }
  if (isButtonPlaced() && !showButton) {
    removeButton();
  }
};

const startObserving = () => {
  const observer = new MutationObserver(validateVisuals);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

//
// Listeners.
//

storageService.onSettingsChanged((value) => {
  settings = value;
  validateVisuals();
});

//
// Entry point.
//

storageService.getSettings().then((value) => {
  settings = value;
  startObserving();
});
