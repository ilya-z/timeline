import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { EVENT, STORAGE_KEY } from "../../utils/constants";
import StorageService from "../services/StorageService";
import { getPlayerControlButton, getVideoElement } from "../../utils/utils";

const Wrapper = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoadingIcon: any = styled.div`
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 60% 60%;
  background-image: url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg' stroke='%23ff0000'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg transform='translate(8 8)' stroke-width='2'%3E%3Ccircle stroke='%23FFFFFF' stroke-opacity='0.91' cx='12' cy='12' r='12'/%3E%3Cpath d='M23 10c0-9-9-10-10-10' stroke-width='2.2'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 12 12' to='360 12 12' dur='1s' repeatCount='indefinite'/%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
`;

const Icon: any = styled.div`
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L11 25L14.3275 23.9604Z' fill='white' fill-opacity='0.5'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18 25C21.866 25 25 21.866 25 18C25 14.134 21.866 11 18 11C14.134 11 11 14.134 11 18C11 19.4872 11.4638 20.8662 12.2547 22L14.3275 23.9604C15.3951 24.6196 16.6532 25 18 25Z' fill='white' fill-opacity='0.5'/%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L14.3275 23.9604Z' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E%0A");
  :hover {
    background-image: url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L11 25L14.3275 23.9604Z' fill='white' fill-opacity='0.95'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18 25C21.866 25 25 21.866 25 18C25 14.134 21.866 11 18 11C14.134 11 11 14.134 11 18C11 19.4872 11.4638 20.8662 12.2547 22L14.3275 23.9604C15.3951 24.6196 16.6532 25 18 25Z' fill='white' fill-opacity='0.95'/%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L14.3275 23.9604Z' fill='white' fill-opacity='0.95'/%3E%3C/svg%3E%0A");
  }
  &.selected {
    background-image: url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L11 25L14.3275 23.9604Z' fill='white' fill-opacity='0.85'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18 25C21.866 25 25 21.866 25 18C25 14.134 21.866 11 18 11C14.134 11 11 14.134 11 18C11 19.4872 11.4638 20.8662 12.2547 22L14.3275 23.9604C15.3951 24.6196 16.6532 25 18 25Z' fill='white' fill-opacity='0.85'/%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L14.3275 23.9604Z' fill='white' fill-opacity='0.85'/%3E%3C/svg%3E%0A");
  }
  &.selected:hover {
    background-image: url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L11 25L14.3275 23.9604Z' fill='white' fill-opacity='0.95'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18 25C21.866 25 25 21.866 25 18C25 14.134 21.866 11 18 11C14.134 11 11 14.134 11 18C11 19.4872 11.4638 20.8662 12.2547 22L14.3275 23.9604C15.3951 24.6196 16.6532 25 18 25Z' fill='white' fill-opacity='0.95'/%3E%3Cpath d='M14.3275 23.9604C13.5096 23.4554 12.8034 22.7867 12.2547 22L14.3275 23.9604Z' fill='white' fill-opacity='0.95'/%3E%3C/svg%3E%0A");
  }
`;

const ReactionButton = () => {
  //
  // State.
  //

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [selected, setSelected] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const title = selected ? "Hide comments" : "Show comments";
  const className = selected ? "selected" : "";

  const style = {
    width: `${width}px`,
    height: `${height}px`,
  };

  const measure = () => {
    const node = getPlayerControlButton();
    setWidth(node?.clientWidth || 0);
    setHeight(node?.clientHeight || 0);
  };

  //
  // Handlers.
  //

  const onFetchingHandler = () => setShowLoading(true);
  const onNotFetchingHandler = () => setShowLoading(false);
  const onClickHandler = () => new StorageService().setShowTimeline(!selected);

  const onStorageChangeHandler = (changes: any) => {
    if (changes.hasOwnProperty(STORAGE_KEY.SETTINGS)) {
      const settings = changes[STORAGE_KEY.SETTINGS].newValue;
      setSelected(settings.showTimeline);
    }
  };

  //
  // Effects.
  //

  useEffect(() => {
    window.addEventListener(EVENT.FETCHING, onFetchingHandler);
    window.addEventListener(EVENT.FETCHING_FINISHED, onNotFetchingHandler);
    chrome.storage.onChanged.addListener(onStorageChangeHandler);
    return () => {
      window.removeEventListener(EVENT.FETCHING, onFetchingHandler);
      window.removeEventListener(EVENT.FETCHING_FINISHED, onNotFetchingHandler);
      chrome.storage.onChanged.removeListener(onStorageChangeHandler);
    };
  });

  useEffect(() => {
    new StorageService().getSettings().then((settings) => {
      setSelected(settings.showTimeline);
      setInitialized(true);
    });
  }, []);

  useEffect(() => {
    const video = getVideoElement();
    const config = { attributes: true, subtree: false };
    const observer = new MutationObserver(measure);
    if (video) observer.observe(video, config);
    measure();
    return () => {
      observer.disconnect();
    };
  });

  return (
    <>
      {initialized && (
        <Wrapper style={style} onClick={onClickHandler}>
          {!showLoading && <Icon className={className} title={title} />}
          {showLoading && <LoadingIcon title="Loading comments" />}
        </Wrapper>
      )}
    </>
  );
};

export default ReactionButton;
