import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Comment from "./Comment";
import Player from "../player";
import { EVENT, STORAGE_KEY } from "../../utils/constants";
import CommentService, { CommentType } from "../services/CommentService";
import StorageService from "../services/StorageService";
import {
  getProgressBarElement,
  getRatio,
  getVideoElement,
} from "../../utils/utils";

const Container = styled.div`
  position: absolute;
  height: 0;
  width: 100%;
  z-index: 200;
`;

const Timeline = styled.div`
  width: 100%;
  margin-top: 0;
`;

const CommentBar = () => {
  const player = useRef<Player | null>();
  const commentService = useRef<CommentService | null>();
  //
  // State.
  //

  const [max, setMax] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [transparency, setTransparency] = useState(60);
  const [showTimeline, setShowTimeline] = useState(false);

  const ratio = getRatio(width, max);

  //
  // Handlers.
  //

  const onChunkHandler = (event: any) =>
    setComments([...comments, ...(event.detail as CommentType[])]);

  const onResetHandler = () => setComments([]);

  const onAvatarClickHandler = useCallback(
    (time: number) => player.current?.seek(time),
    [player.current]
  );

  const onStorageChangeHandler = (changes: any) => {
    if (changes.hasOwnProperty(STORAGE_KEY.SETTINGS)) {
      const settings = changes[STORAGE_KEY.SETTINGS].newValue;
      setTransparency(settings.transparency);
      setShowTimeline(settings.showTimeline);
    }
  };

  const measure = () => {
    const video = getVideoElement();
    const node = getProgressBarElement();
    const newMax = Number(node?.getAttribute("aria-valuemax")) || 0;
    const newHeight = video?.clientHeight || 0;
    const newWidth = node?.clientWidth || 0;

    if (max !== newMax) setMax(newMax);
    if (height !== newHeight) setHeight(newHeight);
    if (width !== newWidth) setWidth(newWidth);
  };

  //
  // Subscribe for events.
  //

  useEffect(() => {
    window.addEventListener(EVENT.RESET, onResetHandler);
    window.addEventListener(EVENT.CHUNK, onChunkHandler);
    chrome.storage.onChanged.addListener(onStorageChangeHandler);
    return () => {
      window.removeEventListener(EVENT.RESET, onResetHandler);
      window.removeEventListener(EVENT.CHUNK, onChunkHandler);
      chrome.storage.onChanged.removeListener(onStorageChangeHandler);
    };
  });

  //
  // Start observing DOM.
  //

  useEffect(() => {
    const video = getVideoElement();
    const config = { attributes: true, subtree: false };
    const observer = new MutationObserver(measure);
    if (video) observer.observe(video, config);
    measure();
    return () => {
      observer.disconnect();
    };
  }, []);

  //
  // Initial settings.
  //

  useEffect(() => {
    player.current = new Player();
    commentService.current = new CommentService();

    new StorageService().getSettings().then((settings) => {
      setTransparency(settings.transparency);
      setShowTimeline(settings.showTimeline);
    });
  }, []);

  //
  // Start fetching comments.
  //

  useEffect(() => {
    if (showTimeline) {
      commentService.current?.fetch();
    } else {
      commentService.current?.reset();
    }
  }, [showTimeline]);

  return (
    <Container>
      {showTimeline && (
        <Timeline>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              data={comment}
              ratio={ratio}
              width={width}
              height={height}
              transparency={transparency}
              onClick={onAvatarClickHandler}
            />
          ))}
        </Timeline>
      )}
    </Container>
  );
};

export default CommentBar;
