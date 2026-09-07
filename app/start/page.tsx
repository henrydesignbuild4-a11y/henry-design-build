import type { Metadata } from 'next';
import ProjectChat from '@/components/chat/ProjectChat';

export const metadata: Metadata = {
  title: 'Start a project',
  description:
    'Describe what you want to build and get a project reference, a visual sketch and an honest planning range in a couple of minutes.',
};

export default function StartPage() {
  return (
    <>
      <section className="bg-ink text-bone">
        <div className="shell pb-16 pt-24 sm:pb-20 sm:pt-32">
          <p className="eyebrow text-cedar">Start a project</p>
          <h1 className="h-hero mt-7 max-w-4xl">
            Design it
            <br />
            <span className="text-cedar">right here</span>
          </h1>
          <p className="lede mt-8 max-w-xl text-bone/65">
            The Design Studio below is the real tool — pick what you&rsquo;re building, watch it
            take shape, get a planning range. Not sure where to start? Tell the quick-start box one
            line about your project first and it&rsquo;ll fill the studio in for you.
          </p>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <ProjectChat />
      </section>

      <section className="border-t border-ink/10 bg-sand py-20">
        <div className="shell grid gap-12 lg:grid-cols-3">
          {[
            {
              t: 'Where the number comes from',
              b: 'The assistant only writes down what you tell it. The range itself is calculated by the same estimator behind the Design Studio — so nobody, human or otherwise, is making the figure up on the spot.',
            },
            {
              t: 'What the reference is for',
              b: 'Your project gets a code like HDB-2608-K7QR. Quote it in an email or on the phone and we can pull up exactly what you described, without you repeating yourself.',
            },
            {
              t: 'What happens to what you type',
              b: 'Nothing is stored. The conversation lives in your browser until you close the tab — the only copy that leaves is the one you choose to email over.',
            },
          ].map((item) => (
            <div key={item.t}>
              <h2 className="h-card">{item.t}</h2>
              <p className="mt-4 leading-relaxed text-ink/65">{item.b}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
