'use client';

import ChatThread from '@/components/chat/ChatThread';
import { useProjectIntake } from '@/components/chat/useProjectIntake';
import Configurator from '@/components/visualizer/Configurator';

/**
 * Full-page version of the intake conversation.
 *
 * The Design Studio is the main event on this page — the chat above it is
 * deliberately a small, quiet, optional shortcut, not a hero element in its
 * own right. Everything it establishes (what you're building, roughly how
 * big, style, materials, notes) fills the studio in live underneath, via
 * `Configurator`'s `seedBrief` prop, but a visitor who'd rather just start
 * clicking through the studio directly shouldn't feel like they skipped a
 * step by ignoring the box above it.
 */
export default function ProjectChat() {
  const intake = useProjectIntake();

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-ink/40">
          Optional quick start — describe it in one line
        </p>
        <div className="mx-auto flex max-h-[20rem] max-w-lg flex-col border border-ink/10 bg-white/40">
          <header className="flex shrink-0 items-center gap-2.5 border-b border-ink/10 px-4 py-2.5">
            <span className="h-1.5 w-1.5 shrink-0 bg-cedar/70" aria-hidden="true" />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/50">
              Quick-start chat
            </p>
            <span className="ml-auto text-[0.65rem] text-ink/35">
              {intake.guided ? 'Guided' : 'Live'}
            </span>
          </header>

          <ChatThread
            turns={intake.turns}
            chips={intake.chips}
            busy={intake.busy}
            notice={intake.notice}
            guided={intake.guided}
            onSend={intake.send}
            brief={intake.brief}
            onSelectStyle={intake.selectStyle}
            onSelectPalette={intake.selectPalette}
            onToggleMaterial={intake.toggleMaterial}
            className="flex-1 overflow-y-auto"
          />
        </div>
      </div>

      <div className="border-t border-ink/10 pt-10">
        <p className="eyebrow text-cedar">The Design Studio</p>
        <h2 className="h-hero mt-4 max-w-2xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
          Build it right here
        </h2>
        <p className="lede mt-5 max-w-xl text-ink/65">
          Pick what you&rsquo;re building, watch it take shape, get an honest planning range. If
          you used the quick-start box above, everything you told it is already filled in below —
          tweak any of it directly; the chat won&rsquo;t overwrite something you&rsquo;ve changed
          by hand unless you tell it something new yourself.
        </p>
        <div className="mt-10">
          <Configurator seedBrief={intake.brief} />
        </div>
      </div>
    </div>
  );
}
