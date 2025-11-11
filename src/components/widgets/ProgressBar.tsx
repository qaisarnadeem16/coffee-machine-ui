import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useZakeke } from '@zakeke/zakeke-configurator-react';
import useStore from 'Store';

const LoaderWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 2;
`;

const CircularContainer = styled.div`
  position: relative;
  width: 270px;
  height: 270px;
`;

const SVG = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const CircleBg = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 4;
`;

const CircleProgress = styled.circle<{ $progress: number }>`
  fill: none;
  stroke: #c39a5f;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 565.48;
  stroke-dashoffset: ${({ $progress }) => 565.48 - (565.48 * $progress) / 100};
  transition: stroke-dashoffset 0.3s ease;
`;

const Logo = styled.img`
  width: 60px;
  height: auto;
  margin-bottom: 16px;
`;

const Brand = styled.div`
  font-size: 28px;
  font-weight: bold;
  font-family: 'Georgia', serif;
`;

const SubBrand = styled.div`
  font-size: 14px;
  margin-top: 4px;
  letter-spacing: 2px;
`;

const StatusText = styled.div`
  font-size: 14px;
  color: #c39a5f;
  font-weight: 500;
  text-transform: uppercase;
`;

const Percentage = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #c39a5f;
  margin-bottom: 15px;
`;

const VideoPlayer = styled.video<{ $isLoaded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
  transition: opacity 0.5s ease;
`;

const VideoFallback = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
  z-index: -2;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.5s ease;
`;

const CenterContent = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
`;

const ProgressBar: FC<{ $flagStartLoading: boolean; $bgColor: string; $completed: number }> = ({
  $flagStartLoading,
  $bgColor,
  $completed
}) => {
  const { isSceneLoading } = useZakeke();
  const { isMobile } = useStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  video.muted = true;
  video.playsInline = true;
  video.autoplay = true; 
  video.preload = 'auto';

  const tryPlay = () => {
    video.play().catch(err => {
      console.warn('Autoplay failed, waiting for user interaction:', err);
    });
  };

  const handleCanPlay = () => {
    setVideoLoaded(true);
    tryPlay();
  };

  const handleError = (e: Event) => {
    console.error('Video loading error:', e);
    setVideoError(true);
  };

  const handleVideoEnd = () => {
    if (!videoError) {
      video.currentTime = 0;
      tryPlay();
    }
  };

  video.addEventListener('canplay', handleCanPlay); 
  video.addEventListener('error', handleError);
  video.addEventListener('ended', handleVideoEnd);

  video.load();
  tryPlay();

  return () => {
    video.removeEventListener('canplay', handleCanPlay);
    video.removeEventListener('error', handleError);
    video.removeEventListener('ended', handleVideoEnd);
  };
}, []);

  const progress = !isSceneLoading && $flagStartLoading ? 100 : $completed;

  return (
    <div>

      <VideoFallback $show={!videoLoaded || videoError} />
      
      <VideoPlayer
         ref={videoRef}
         id="myVideo"
         $isLoaded={videoLoaded && !videoError}
         loop={true}
         muted
         autoPlay
         playsInline
         preload="auto"
      >
         <source src="/loading.mp4" type="video/mp4" />
      </VideoPlayer>


      <LoaderWrapper>
        <CircularContainer>
          <SVG viewBox="0 0 200 200">
            <CircleBg r="90" cx="100" cy="100" />
            <CircleProgress r="90" cx="100" cy="100" $progress={progress} />
          </SVG>
          <CenterContent>
            <img 
              src='/coffelogo.svg' 
              alt='coffelogo' 
              style={{ width: '180px', height: 'auto' }}
            />
            <StatusText>Configurator Loading...</StatusText>
            <Percentage>{Math.round(progress)}%</Percentage>
          </CenterContent>
        </CircularContainer>
      </LoaderWrapper>
    </div>
  );
};

export default ProgressBar;