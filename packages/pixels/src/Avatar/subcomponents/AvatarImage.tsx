import type { ReactNode } from 'react';
import type { AvatarClassNames } from '../avatarVariants';

import { useState } from 'react';

import AvatarPlaceholder from './AvatarPlaceholder';

interface AvatarImageProps {
  /** CSS class name */
  className: AvatarClassNames;
  /** Content shown while the image is unavailable */
  fallback?: ReactNode;
  /** Image source */
  src: string;
}

/** Image loading and fallback content for one avatar source */
const AvatarImage = ({
  className,
  fallback = undefined,
  src,
}: AvatarImageProps) => {
  const [loaded, setLoaded] = useState(false);

  // show cached images immediately when their DOM node is attached
  const handleImageRef = (node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  };

  // reveal the image once its pixels are available
  const handleLoad = () => {
    setLoaded(true);
  };

  // keep custom fallback content visible after a failed request
  const handleError = () => {
    setLoaded(false);
  };

  return (
    <>
      {src ? (
        <img
          ref={handleImageRef}
          alt="avatar"
          className={className.img}
          data-loaded={loaded || undefined}
          data-slot="img"
          onError={handleError}
          onLoad={handleLoad}
          src={src}
        />
      ) : null}

      {!loaded && fallback ? (
        <div
          aria-label="avatar"
          className={className.fallback}
          data-slot="fallback"
          role="img"
        >
          {fallback}
        </div>
      ) : null}

      {!src && !fallback ? (
        <AvatarPlaceholder className={className.icon} />
      ) : null}
    </>
  );
};

export default AvatarImage;
