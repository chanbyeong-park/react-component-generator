import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORTS: { id: Viewport; label: string; width: string }[] = [
  { id: 'mobile',  label: '375px', width: '375px'  },
  { id: 'tablet',  label: '768px', width: '768px'  },
  { id: 'desktop', label: 'FULL',  width: '100%'   },
];

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  const currentWidth = VIEWPORTS.find(v => v.id === viewport)!.width;

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-controls">
          {VIEWPORTS.map(v => (
            <button
              key={v.id}
              className={`btn-viewport ${viewport === v.id ? 'btn-viewport--active' : ''}`}
              onClick={() => setViewport(v.id)}
              title={v.id.charAt(0).toUpperCase() + v.id.slice(1)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render">
            <div
              className="preview-viewport-frame"
              style={{ maxWidth: currentWidth }}
            >
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
