
import VideoService from './VideoService';
import { useVideos } from './hooks';
import { incrementVideoViews } from './utils';
import type { Video, VideoSource } from './types';

export {
  VideoService as default,
  useVideos,
  incrementVideoViews,
  type Video,
  type VideoSource
};
