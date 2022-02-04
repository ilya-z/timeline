import styled from "styled-components";
import React, { useCallback } from "react";
import { timeToSec } from "../../utils/utils";
import { CommentType } from "../services/CommentService";

interface CommentProps {
  ratio: number;
  width: number;
  height: number;
  transparency: number;
  data: CommentType;
  onClick: (time: number) => void;
}

const Content = styled.div`
  display: none;
  width: 100%;
`;

const CommentWrapper = styled.div`
  display: flex;
  min-height: 20px;
  width: 100%;
  position: absolute;
  bottom: 0;
  background: none;
  flex-direction: column;
  align-content: flex-end;
  justify-content: flex-end;
  pointer-events: none;
  * {
    pointer-events: none;
  }
  .ava {
    img {
      pointer-events: auto;
      cursor: pointer;
    }
    width: 20px;
    height: 40px;
    position: relative;
    box-sizing: border-box;
    border-left: 1px solid transparent;
  }
  :hover {
    .ava {
      border-left: 1px solid #ff0000;
      z-index: 100;
    }
  }
  :hover ${Content} {
    min-width: 100%;
    display: flex;
    .left {
      flex-shrink: 0;
    }
    .right {
      flex-shrink: 0;
    }
    .center {
      flex-shrink: 2;
      white-space: pre-line;
      pointer-events: all;
      overflow-y: scroll;
      padding: 10px 5px;
      font-size: 1.3rem;
      .author {
        font-size: 1.4rem;
        margin-right: 10px;
      }
      .likes {
        font-size: 1.4rem;
      }
      div {
        margin-bottom: 10px;
      }
      ::-webkit-scrollbar-track {
        -webkit-box-shadow: none !important;
        background-color: transparent;
      }
      ::-webkit-scrollbar {
        background-color: transparent;
      }
    }
  }
`;

const Comment = ({
  data,
  ratio,
  width,
  height,
  onClick,
  transparency,
}: CommentProps) => {
  const timeInSec = timeToSec(data.time);
  const left = Math.round(ratio * timeInSec);
  const right = width / 2 < left ? width - left - 1.01 : 0;

  const centerStyle = {
    [`border${right ? "Right" : "Left"}`]: "1px solid #ff0000",
    [`margin${right ? "Left" : "Right"}`]: "20%",
    maxHeight: `${height - 150}px`,
    backgroundColor: `rgba(0, 0, 0, ${transparency / 100})`,
  };
  const leftStyle = {
    width: `${!right && left ? left : 0}px`,
    flexGrow: right ? 2 : 0,
  };
  const rightStyle = { width: `${right}px` };
  const avaStyle = { left: `${left}px` };

  const onAvatarClickHandler = useCallback(() => onClick(timeInSec), []);

  return (
    <CommentWrapper key={data.id}>
      <Content>
        <span className="left" style={leftStyle} />
        <div className="center" style={centerStyle}>
          <div>
            <span className="author">{data.author}</span>
            {data.likes !== "0" && (
              <span className="likes">{`❤️ ${data.likes}`}</span>
            )}
          </div>
          {data.text}
        </div>
        <span className="right" style={rightStyle} />
      </Content>
      <div className="ava" onClick={onAvatarClickHandler} style={avaStyle}>
        <img width="20" height="20" src={data.avatar} alt={""} />
      </div>
    </CommentWrapper>
  );
};

export default Comment;
