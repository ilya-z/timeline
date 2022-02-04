import { EVENT, MESSAGE, REQUEST } from "../../utils/constants";
import { emit, getVideoId } from "../../utils/utils";

export interface CommentType {
  id: string;
  author: string;
  avatar: string;
  likes: string;
  text: string;
  time: string;
}

enum Status {
  IDLE = 1,
  FETCHING,
  FINISHED,
}

interface ResponseFromBackground {
  message: string;
  payload: CommentsResponse;
}

interface CommentsResponse {
  items: [];
  nextPageToken: string | undefined;
}

interface Snippet {
  textDisplay: string;
  authorProfileImageUrl: string;
  authorDisplayName: string;
  likeCount: string;
}

const maxRequests: number = 10;

export default class CommentService {
  private status: Status = Status.IDLE;
  private numOfRequests: number = 0;
  private numOfCommentsFound = 0;

  constructor() {
    chrome.runtime.onMessage.addListener(this.onMessageReceived.bind(this));
  }

  //
  // Handlers.
  //

  onMessageReceived({ message, payload }: ResponseFromBackground) {
    switch (message) {
      case MESSAGE.COMMENTS:
        this.processComments(payload);
        break;
      case MESSAGE.TAB_VIDEO_CHANGED:
        if (this.status !== Status.IDLE) {
          this.reset();
          this.fetch();
        } else {
          this.reset();
        }
        break;
    }
  }

  //
  // Methods.
  //

  reset() {
    this.status = Status.IDLE;
    this.numOfRequests = 0;
    this.numOfCommentsFound = 0;

    emit(EVENT.RESET);
  }

  fetch(nextPageToken: string | null = null) {
    if (this.status !== Status.FINISHED) {
      const videoId = getVideoId(window?.location?.href);
      if (!videoId) {
        this.reset();
        return;
      }
      const type = REQUEST.GET_COMMENTS;

      chrome.runtime.sendMessage({ type, payload: { videoId, nextPageToken } });

      this.numOfRequests += 1;
      this.status = Status.FETCHING;

      emit(EVENT.FETCHING);
    }
  }

  processComments({ items, nextPageToken }: CommentsResponse) {
    const snippets: Snippet[] = items.map(
      (item: any) => item.snippet.topLevelComment.snippet
    );
    const newCommentsWithTime: CommentType[] = snippets.reduce(
      this.findCommentsWithTime,
      []
    );
    if (newCommentsWithTime.length) {
      this.numOfCommentsFound += newCommentsWithTime.length;
      emit(EVENT.CHUNK, newCommentsWithTime);
    }

    if (this.numOfRequests >= maxRequests || !nextPageToken) {
      this.status = Status.FINISHED;
      this.sendStatistic();
      emit(EVENT.FETCHING_FINISHED);
    } else {
      this.fetch(nextPageToken);
    }
  }

  findCommentsWithTime(acc: CommentType[], comment: Snippet) {
    const text = comment.textDisplay;
    const timeMarks = text?.match(/(([0-9])*(:[0-9]){1,2}\w)+/gi);
    if (timeMarks && timeMarks.length) {
      const avatar = comment.authorProfileImageUrl;
      const author = comment.authorDisplayName;
      const time = timeMarks[0];
      const likes = comment.likeCount;
      const id = `${author}-${time}-${text?.length}`;
      acc.push({
        id,
        author,
        avatar,
        likes,
        text,
        time,
      });
    }
    return acc;
  }

  sendStatistic() {
    const event = "fetching finished";
    const label = getVideoId(window?.location?.href);
    const value = this.numOfCommentsFound;
    chrome.runtime.sendMessage({
      type: REQUEST.PUT_ANALYTICS,
      payload: { event, label, value },
    });
  }
}
