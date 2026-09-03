import Script from 'next/script';
import { site } from '@/data/site';

/**
 * Live Instagram feed via Behold (behold.so) — connected directly to
 * @henry_designbuild's account there, so this updates itself automatically
 * whenever a new post goes up. No manual link-updating needed, unlike the
 * old version of this component (individual oEmbed posts, updated by hand).
 *
 * The <behold-widget> element and its loader script are exactly what
 * Behold's dashboard gives you for this feed — untouched, so it keeps
 * working if Behold changes their loader internals. Swap the feed-id below
 * only if the Behold feed itself is ever recreated.
 */
const FEED_ID = '97dxIIOhT6ArxwaFH7Qd';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required shape for a custom element
  namespace JSX {
    interface IntrinsicElements {
      'behold-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'feed-id': string;
      };
    }
  }
}

export default function InstagramFeed() {
  return (
    <div>
      <behold-widget feed-id={FEED_ID} />
      <Script
        id="behold-widget-loader"
        strategy="lazyOnload"
        // eslint-disable-next-line react/no-danger -- exact loader snippet from Behold's dashboard
        dangerouslySetInnerHTML={{
          __html: `(() => {
            if(window.__bhldScript)return;window.__bhldScript=true;
            const d=document,s=d.createElement("script");s.type="module";
            s.src="https://w.behold.so/widget.js";setTimeout(()=>{d.head.append(s);},0);
          })();`,
        }}
      />
      <p className="mt-8 text-center">
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost-light"
        >
          Follow {site.instagramHandle} on Instagram
        </a>
      </p>
    </div>
  );
}
