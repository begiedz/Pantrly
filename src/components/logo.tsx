import Svg, { G, Polygon } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  fill?: string;
};

export default function Logo({
  width = 24,
  height = 24,
  fill = 'currentColor',
}: Props) {
  return (
    <Svg viewBox='0 0 108.92 108' width={width} height={height}>
      <G>
        <G>
          <Polygon points='0 108 37.23 0 60.29 0 23.06 108 0 108' fill={fill} />
          <Polygon
            points='52.31 80.66 79.22 71.64 57.85 64.6 64.8 44.45 108.92 62.39 108.92 81.07 42.89 108 52.31 80.66'
            fill={fill}
          />
        </G>
      </G>
    </Svg>
  );
}
