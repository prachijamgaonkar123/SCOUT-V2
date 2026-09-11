import type { CSSProperties, FC } from "react";
import styles from "../AlertPopup/RecentEventPopup.module.css";
import { CameraIcon } from "./Icons";

interface ThumbnailFrameProps {
  imageUrl?: string;
  imageFileName?: string;
  isRecording?: boolean;
  alt: string;
}

const ThumbnailFrame: FC<ThumbnailFrameProps> = ({
  imageUrl,
  imageFileName,
  isRecording,
  alt,
}) => {
  const imageStyle: CSSProperties | undefined = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <div className={styles.thumb} style={imageStyle}>
      {isRecording && <div className={styles.rec}>REC</div>}
      <div className={`${styles.corner} ${styles.cornerTl}`} />
      <div className={`${styles.corner} ${styles.cornerTr}`} />
      <div className={`${styles.corner} ${styles.cornerBl}`} />
      <div className={`${styles.corner} ${styles.cornerBr}`} />
      {!imageUrl && (
        <div className={styles.centerIcon} aria-hidden="true">
          <CameraIcon strokeWidth={1.3} />
        </div>
      )}
      {imageFileName && <div className={styles.tsTag}>{imageFileName}</div>}
      <span className={styles.srOnly}>{alt}</span>
    </div>
  );
};

export default ThumbnailFrame;
