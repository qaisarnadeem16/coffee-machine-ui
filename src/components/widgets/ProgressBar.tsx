import { FC, useEffect, useRef } from 'react';
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
  width: 260px;
  height: 260px;
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
  margin-top: 20px;
  color: #c39a5f;
  font-weight: 500;
  text-transform: uppercase;
`;

const Percentage = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #c39a5f;
  margin:0px 10px;
`;

const VideoPlayer = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
  z-index: -1;
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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play();
      const handleVideoEnd = () => video.play();
      video.addEventListener('ended', handleVideoEnd);
      return () => video.removeEventListener('ended', handleVideoEnd);
    }
  }, []);

  const progress = !isSceneLoading && $flagStartLoading ? 100 : $completed;

  return (
    <div>
      <VideoPlayer ref={videoRef} id="myVideo">
        <source src="/loading.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </VideoPlayer>

      <LoaderWrapper>
        <CircularContainer>
          <SVG viewBox="0 0 200 200">
            <CircleBg r="90" cx="100" cy="100" />
            <CircleProgress r="90" cx="100" cy="100" $progress={progress} />
          </SVG>

          <CenterContent>
            <Logo src="/logo.svg" alt="Milton Logo" />
            <Brand>Milton</Brand>
            <SubBrand>COFFEE CO.</SubBrand>
            <StatusText>Configurator Loading...</StatusText>
            <Percentage>{progress}%</Percentage>
          </CenterContent>
        </CircularContainer>
      </LoaderWrapper>
    </div>
  );
};

export default ProgressBar;
