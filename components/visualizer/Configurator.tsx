'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import MaterialBoard from '@/components/chat/MaterialBoard';
import StyleBoard from '@/components/chat/StyleBoard';
import StyleImage from '@/components/chat/StyleImage';
import ColorPaletteBuilder from '@/components/visualizer/ColorPaletteBuilder';
import FloorPlan from '@/components/visualizer/FloorPlan';
import MaterialDropzone from '@/components/visualizer/MaterialDropzone';
import PhotoCustomizer from '@/components/visualizer/PhotoCustomizer';
import { paletteById } from '@/data/palettes';
import { styleById } from '@/data/styles';
import { EMPTY_BRIEF, UNKNOWN, resolveBrief, type Brief, type CustomMaterial, type CustomPaletteColors } from '@/lib/brief';
import { buildSummary } from '@/lib/briefSummary';
import { makeProjectId } from '@/lib/projectId';
import { buildSketchUpScript, sketchupFilename } from '@/lib/sketchup';
import {
  ADD_ONS,
  BUILD_TYPES,
  CLADDINGS,
  DOOR_COLORS,
  FINISH_LEVELS,
  LOCATIONS,
  PITCHES,
  ROOFS,
  SEASONS,
  SITE_ACCESS,
  WINDOW_STYLES,
  calculateEstimate,
  formatCAD,
  guessLocationId,
  type BuildTypeId,
  type FinishLevelId,
  type LocationId,
  type SeasonId,
  type SiteAccessId,
} from '@/lib/estimate';

const INTERIOR_TYPES: BuildTypeId[] = ['kitchen', 'bath', 'reno'];
type PreviewMode = 'render' | 'plan';

export default function Configurator({ seedBrief }: { seedBrief?: Brief } = {}) {
  const [buildType, setBuildType] = useState<BuildTypeId>('cottage');
  // "Something else" doesn't get its own pricing/scene/AI-prompt model — it
  // rides on 'reno' under the hood (the broadest of the six real
  // categories) rather than threading a 7th BuildTypeId through the
  // estimator, the chat's structured-output schema, the AI render prompt
  // and the floor-plan geometry. Tracked separately so its card doesn't
  // light up in sync with the real "Whole-home renovation" card (and vice
  // versa) just because they briefly share a buildType value.
  const [isOtherBuild, setIsOtherBuild] = useState(false);
  const [sqft, setSqft] = useState(1400);
  const [finish, setFinish] = useState<FinishLevelId>('crafted');
  const [access, setAccess] = useState<SiteAccessId>('easy');
  const [season, setSeason] = useState<SeasonId>('four');
  const [location, setLocation] = useState<LocationId>('other');
  const [addOns, setAddOns] = useState<string[]>(['sauna']);
  const [cladding, setCladding] = useState(CLADDINGS[0].id);
  const [roof, setRoof] = useState(ROOFS[0].id);
  const [pitch, setPitch] = useState(PITCHES[1].id);
  const [windowStyle, setWindowStyle] = useState(WINDOW_STYLES[0].id);
  const [doorColor, setDoorColor] = useState(DOOR_COLORS[0].id);
  const [notes, setNotes] = useState('');
  const [style, setStyle] = useState('');
  const [palette, setPalette] = useState('');
  const [customPalette, setCustomPalette] = useState<CustomPaletteColors | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<PreviewMode>('render');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [skDownloaded, setSkDownloaded] = useState(false);

  // Accordion state — one step open at a time so the form reads as a guided
  // sequence instead of one long scroll. `null` closes every panel; a
  // section id opens that one and closes the rest. Each "Continue" button
  // just opens the next id in sequence, so a first-time visitor can move
  // through top to bottom, while the header of any step stays clickable to
  // jump straight to it.
  const [openSection, setOpenSection] = useState<string | null>('buildType');
  const toggleSection = (id: string) =>
    setOpenSection((cur) => (cur === id ? null : id));

  // Optional live sync from an external brief — used on /start, where the
  // chat runs above this same component so a visitor can watch the studio
  // fill in as they talk. One-directional and change-based: it only ever
  // pushes a field when the CHAT'S OWN value for that field has actually
  // changed since the last sync, never when it merely differs from
  // whatever's currently in the studio — otherwise a visitor's own manual
  // tweak here would get silently overwritten back to the chat's default
  // the next time any unrelated chat field changed. List fields (add-ons,
  // materials) merge in rather than replace, for the same reason.
  const lastSyncedRef = useRef<Brief | null>(null);
  useEffect(() => {
    if (!seedBrief) return;
    const prev = lastSyncedRef.current;
    if (seedBrief.buildType !== UNKNOWN && seedBrief.buildType !== prev?.buildType) {
      changeBuildType(seedBrief.buildType);
    }
    if (seedBrief.sqft > 0 && seedBrief.sqft !== prev?.sqft) setSqft(seedBrief.sqft);
    if (seedBrief.finish !== UNKNOWN && seedBrief.finish !== prev?.finish) setFinish(seedBrief.finish);
    if (seedBrief.access !== UNKNOWN && seedBrief.access !== prev?.access) setAccess(seedBrief.access);
    if (seedBrief.season !== UNKNOWN && seedBrief.season !== prev?.season) setSeason(seedBrief.season);
    if (seedBrief.location && seedBrief.location !== prev?.location) {
      // Only auto-apply a confident match — a vague or unrelated mention
      // shouldn't silently reset a location the visitor already picked here.
      const guessed = guessLocationId(seedBrief.location);
      if (guessed !== 'other') setLocation(guessed);
    }
    if (seedBrief.addOns.length && JSON.stringify(seedBrief.addOns) !== JSON.stringify(prev?.addOns ?? [])) {
      setAddOns((cur) => Array.from(new Set([...cur, ...seedBrief.addOns])));
    }
    if (seedBrief.style && seedBrief.style !== prev?.style) setStyle(seedBrief.style);
    if (seedBrief.palette && seedBrief.palette !== prev?.palette) setPalette(seedBrief.palette);
    if (seedBrief.customPalette && seedBrief.customPalette !== prev?.customPalette) {
      setCustomPalette(seedBrief.customPalette);
    }
    if (
      seedBrief.materials.length &&
      JSON.stringify(seedBrief.materials) !== JSON.stringify(prev?.materials ?? [])
    ) {
      setMaterials((cur) => Array.from(new Set([...cur, ...seedBrief.materials])));
    }
    if (seedBrief.notes && seedBrief.notes !== prev?.notes) setNotes(seedBrief.notes);
    lastSyncedRef.current = seedBrief;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedBrief]);

  const type = BUILD_TYPES.find((t) => t.id === buildType)!;
  const isInterior = INTERIOR_TYPES.includes(buildType);

  const availableAddOns = ADD_ONS.filter((a) => a.appliesTo.includes(buildType));
  const activeAddOns = addOns.filter((id) => availableAddOns.some((a) => a.id === id));

  const brief: Brief = useMemo(
    () => ({
      ...EMPTY_BRIEF,
      buildType,
      sqft,
      finish,
      access,
      season,
      addOns: activeAddOns,
      style,
      palette,
      customPalette,
      materials,
      customMaterials,
      cladding,
      roof,
      pitch,
      windowStyle,
      doorColor,
      // Free-text stand-in for the picked location so buildSummary's own
      // region guess lands back on the exact same id — see guessLocationId.
      location: LOCATIONS.find((l) => l.id === location)?.label ?? '',
      notes,
    }),
    [
      buildType,
      sqft,
      finish,
      access,
      season,
      activeAddOns,
      style,
      palette,
      customPalette,
      materials,
      customMaterials,
      cladding,
      roof,
      pitch,
      windowStyle,
      location,
      doorColor,
      notes,
    ]
  );

  const resolved = useMemo(() => resolveBrief(brief), [brief]);

  // Mint a project reference once, the same way the chat does — a stable
  // code to quote back if the visitor emails or calls about this concept.
  useEffect(() => {
    if (!projectId) setProjectId(makeProjectId(JSON.stringify({ buildType, sqft })));
  }, [projectId, buildType, sqft]);

  const estimate = useMemo(
    () =>
      calculateEstimate({ buildType, sqft, finish, access, season, addOns: activeAddOns, location }),
    [buildType, sqft, finish, access, season, activeAddOns, location]
  );

  const summary = useMemo(
    () => buildSummary(brief, projectId ?? 'HDB-DRAFT'),
    [brief, projectId]
  );

  const sizeRatio = Math.min(1, Math.max(0, (sqft - type.min) / (type.max - type.min)));
  const windows = Math.max(2, Math.min(8, Math.round(2 + sizeRatio * 5)));

  function changeBuildType(id: BuildTypeId) {
    const next = BUILD_TYPES.find((t) => t.id === id)!;
    setBuildType(id);
    setIsOtherBuild(false);
    setSqft(next.defaultSize);
    setAddOns((prev) =>
      prev.filter((a) => ADD_ONS.find((x) => x.id === a)?.appliesTo.includes(id))
    );
  }

  // "Something else" — same underlying numbers as a whole-home renovation
  // (the broadest category), but jumps straight to the notes step since
  // that's the only place this project actually gets described.
  function chooseOtherBuild() {
    changeBuildType('reno');
    setIsOtherBuild(true);
    setOpenSection('notes');
  }

  function toggleAddOn(id: string) {
    setAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleMaterial(id: string) {
    setMaterials((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addCustomMaterial(m: CustomMaterial) {
    setCustomMaterials((prev) => [...prev, m]);
  }

  function removeCustomMaterial(id: string) {
    setCustomMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  function renameCustomMaterial(id: string, name: string) {
    setCustomMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary.overview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  function downloadSketchUp() {
    const script = buildSketchUpScript(resolved, projectId ?? 'HDB-DRAFT');
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sketchupFilename(projectId ?? 'HDB-DRAFT');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSkDownloaded(true);
  }

  let stepN = 0;
  const nextStep = () => String(++stepN).padStart(2, '0');

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
      {/* ── Left column: preview + controls ── */}
      <div className="min-w-0">
        {/* Sticky on desktop so the drawing stays on screen as you work
            through the steps below — the whole point of a live preview is
            watching it change, which doesn't happen if it scrolls away the
            moment you get past the first question. Mobile stays a normal
            in-flow block; there isn't room to pin anything on a small
            screen without the form eating the rest of the viewport. */}
        <div className="lg:sticky lg:top-24 lg:z-10">
        <div className="overflow-hidden border border-ink/12 bg-ink shadow-[0_8px_30px_rgba(20,17,15,0.12)]">
          <div className="flex border-b border-bone/10">
            {(
              [
                ['render', 'AI rendering'],
                ['plan', 'Floor plan'],
              ] as [PreviewMode, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={`flex-1 px-4 py-3 font-display text-[0.68rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                  mode === id ? 'bg-bone text-ink' : 'text-bone/50 hover:text-bone'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Both stay mounted so switching tabs never loses a generated
              rendering or resets its loading state — only visibility
              toggles. */}
          <div className={mode === 'render' ? '' : 'hidden'}>
            <StyleImage brief={brief} auto={false} />
          </div>
          <div className={mode === 'plan' ? '' : 'hidden'}>
            <FloorPlan
              buildType={buildType}
              sqft={sqft}
              scene={summary.scene}
              windows={windows}
              hasDeck={activeAddOns.includes('deck')}
              hasLoft={activeAddOns.includes('loft')}
            />
          </div>

          <p className="border-t border-bone/10 px-5 py-3 text-center text-xs text-bone/45">
            {mode === 'render' && 'An AI image generated from your exact choices — a style reference, not a design.'}
            {mode === 'plan' && !isInterior && 'Drag a wall to resize a room, tap one to remove it, or use the toolbar below to drop in, drag and resize a room, window, cabinets, a fireplace, or type your own — scaled to your numbers, not a real floor plan.'}
            {mode === 'plan' && isInterior && 'Use the toolbar below to drop in, drag and resize a room, window, cabinets, a fireplace, or type your own — scaled to your numbers, not a real floor plan.'}
          </p>
        </div>
        </div>

        {/* A hand-drawn nudge toward the first step — the accordion below
            reads as inert boxes until something invites the first click.
            Purely decorative, hidden from screen readers; the real label
            on step 01 already says what it is. */}
        <div className="mt-7 flex items-center justify-end gap-3 pr-6 text-cedar sm:pr-10">
          <p className="font-display -rotate-2 text-[0.95rem] italic">Start here</p>
          <svg
            width="34"
            height="46"
            viewBox="0 0 34 46"
            fill="none"
            className="shrink-0 rotate-[8deg]"
            aria-hidden="true"
          >
            <path
              d="M27 3C16 1 4 9 4 20C4 29 13 33 20 29"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M11 26L20 29L18 40"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-3 space-y-3">
          {/* Build type */}
          <AccordionField
            id="buildType"
            label="What are you building?"
            step={nextStep()}
            open={openSection === 'buildType'}
            onToggle={() => toggleSection('buildType')}
            summary={isOtherBuild ? 'Something else' : type.label}
            onContinue={() => setOpenSection('size')}
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {BUILD_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => changeBuildType(t.id)}
                  aria-pressed={buildType === t.id && !isOtherBuild}
                  className={`border p-4 text-left transition-colors ${
                    buildType === t.id && !isOtherBuild
                      ? 'border-ink bg-ink text-bone'
                      : 'border-ink/15 bg-white/50 hover:border-ink/45'
                  }`}
                >
                  <span className="block font-display text-[0.78rem] font-bold uppercase tracking-[0.08em]">
                    {t.label}
                  </span>
                  <span
                    className={`mt-1.5 block text-xs leading-snug ${
                      buildType === t.id && !isOtherBuild ? 'text-bone/60' : 'text-ink/55'
                    }`}
                  >
                    {t.blurb}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={chooseOtherBuild}
                aria-pressed={isOtherBuild}
                className={`border border-dashed p-4 text-left transition-colors ${
                  isOtherBuild
                    ? 'border-ink bg-ink text-bone'
                    : 'border-ink/25 bg-white/30 hover:border-ink/45'
                }`}
              >
                <span className="block font-display text-[0.78rem] font-bold uppercase tracking-[0.08em]">
                  Something else
                </span>
                <span
                  className={`mt-1.5 block text-xs leading-snug ${
                    isOtherBuild ? 'text-bone/60' : 'text-ink/55'
                  }`}
                >
                  Boathouse, garage, addition, shed — tell us below and we&rsquo;ll price it
                  properly.
                </span>
              </button>
            </div>
          </AccordionField>

          {/* Size */}
          <AccordionField
            id="size"
            label="How big, roughly?"
            step={nextStep()}
            open={openSection === 'size'}
            onToggle={() => toggleSection('size')}
            summary={`${sqft.toLocaleString()} sq ft`}
            onContinue={() => setOpenSection('notes')}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display text-4xl font-extrabold tracking-[-0.02em]">
                {sqft.toLocaleString()}
                <span className="ml-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink/45">
                  sq ft
                </span>
              </span>
              <span className="text-xs text-ink/45">
                {type.min.toLocaleString()} – {type.max.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={type.min}
              max={type.max}
              step={type.step}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="mt-4 w-full accent-cedar"
              aria-label="Approximate size in square feet"
            />
            <p className="mt-2 text-xs text-ink/50">
              Not sure? Pick the closest room or building you already know the size of. We refine
              this at the first meeting.
            </p>
          </AccordionField>

          {/* Free-text description — supplements the swatches below rather
              than replacing them. Reused as-is by lib/briefSummary.ts (the
              emailed overview) and lib/imagePrompt.ts (the AI rendering),
              so typing something here actually changes the outcome, not
              just a comment box nobody reads. */}
          <AccordionField
            id="notes"
            label={isOtherBuild ? 'What are you actually building?' : 'Anything specific in mind?'}
            step={nextStep()}
            open={openSection === 'notes'}
            onToggle={() => toggleSection('notes')}
            summary={
              notes
                ? `“${notes.slice(0, 40)}${notes.length > 40 ? '…' : ''}”`
                : isOtherBuild
                  ? 'Tell us — this is the only description we have'
                  : 'Optional'
            }
            onContinue={() => setOpenSection('style')}
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder={
                isOtherBuild
                  ? 'A boathouse on the water, a detached garage with a loft, an addition off the back of the kitchen — describe it as fully as you can, this is what we’ll use to price and design it.'
                  : 'A wraparound deck facing the lake, a mudroom by the side door, big windows over the sink — anything at all, in your own words.'
              }
              className="w-full border border-ink/20 bg-white/60 px-4 py-3 text-sm leading-relaxed placeholder:text-ink/35 focus:border-ink focus:outline-none"
            />
            <p className="mt-2 text-xs text-ink/50">
              {isOtherBuild
                ? 'Not optional here — the estimate below is placeholder renovation math until you tell us what this actually is. Goes straight into the AI rendering and the project summary you can send us, word for word.'
                : 'Optional. Goes straight into the AI rendering and the project summary you can send us — word for word.'}
            </p>
          </AccordionField>

          {/* Style */}
          <AccordionField
            id="style"
            label="Style"
            step={nextStep()}
            open={openSection === 'style'}
            onToggle={() => toggleSection('style')}
            summary={styleById(style)?.name ?? 'Not picked yet'}
            onContinue={() => setOpenSection('palette')}
          >
            <StyleBoard buildType={buildType} selected={style} onSelect={setStyle} />
          </AccordionField>

          {/* Palette */}
          <AccordionField
            id="palette"
            label="Colour palette"
            step={nextStep()}
            open={openSection === 'palette'}
            onToggle={() => toggleSection('palette')}
            summary={customPalette ? 'Custom mix' : (paletteById(palette)?.name ?? 'Not picked yet')}
            onContinue={() => setOpenSection('materials')}
          >
            <ColorPaletteBuilder
              buildType={buildType}
              preset={palette}
              onSelectPreset={setPalette}
              custom={customPalette}
              onChangeCustom={setCustomPalette}
            />
          </AccordionField>

          {/* Materials */}
          <AccordionField
            id="materials"
            label="Materials"
            step={nextStep()}
            open={openSection === 'materials'}
            onToggle={() => toggleSection('materials')}
            summary={
              materials.length + customMaterials.length > 0
                ? `${materials.length + customMaterials.length} picked`
                : 'Optional'
            }
            onContinue={() => setOpenSection('finish')}
          >
            <div className="space-y-4">
              <MaterialBoard buildType={buildType} selected={materials} onToggle={toggleMaterial} />
              <MaterialDropzone
                materials={customMaterials}
                onAdd={addCustomMaterial}
                onRemove={removeCustomMaterial}
                onRename={renameCustomMaterial}
              />
            </div>
          </AccordionField>

          {/* Finish */}
          <AccordionField
            id="finish"
            label="How far do you want to take the finish?"
            step={nextStep()}
            open={openSection === 'finish'}
            onToggle={() => toggleSection('finish')}
            summary={FINISH_LEVELS.find((f) => f.id === finish)?.label}
            onContinue={() => setOpenSection('site')}
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {FINISH_LEVELS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  aria-pressed={finish === f.id}
                  className={`border p-4 text-left transition-colors ${
                    finish === f.id
                      ? 'border-cedar bg-cedar/15'
                      : 'border-ink/15 bg-white/50 hover:border-ink/45'
                  }`}
                >
                  <span className="block font-display text-[0.78rem] font-bold uppercase tracking-[0.08em]">
                    {f.label}
                  </span>
                  <span className="mt-1.5 block text-xs leading-snug text-ink/60">{f.blurb}</span>
                </button>
              ))}
            </div>
          </AccordionField>

          {/* Location + season + access */}
          <AccordionField
            id="site"
            label="Tell us about the site"
            step={nextStep()}
            open={openSection === 'site'}
            onToggle={() => toggleSection('site')}
            summary={LOCATIONS.find((l) => l.id === location)?.label}
            onContinue={() =>
              setOpenSection(!isInterior ? 'exterior' : availableAddOns.length > 0 ? 'addons' : 'photo')
            }
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="eyebrow mb-3 text-ink/45">Where is this?</p>
                <div className="space-y-2">
                  {LOCATIONS.map((l) => (
                    <Choice
                      key={l.id}
                      selected={location === l.id}
                      onClick={() => setLocation(l.id)}
                      label={l.label}
                      blurb={l.blurb}
                    />
                  ))}
                </div>
              </div>
              {type.showsSeason && (
                <div>
                  <p className="eyebrow mb-3 text-ink/45">Season of use</p>
                  <div className="space-y-2">
                    {SEASONS.map((s) => (
                      <Choice
                        key={s.id}
                        selected={season === s.id}
                        onClick={() => setSeason(s.id)}
                        label={s.label}
                        blurb={s.blurb}
                      />
                    ))}
                  </div>
                </div>
              )}
              {type.showsAccess && (
                <div>
                  <p className="eyebrow mb-3 text-ink/45">Site access</p>
                  <div className="space-y-2">
                    {SITE_ACCESS.map((a) => (
                      <Choice
                        key={a.id}
                        selected={access === a.id}
                        onClick={() => setAccess(a.id)}
                        label={a.label}
                        blurb={a.blurb}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ink/45">
              The location adjusts the planning range below to reflect published regional cost
              research — it doesn&rsquo;t change the drawing.
            </p>
          </AccordionField>

          {/* Exterior look */}
          {!isInterior && (
            <AccordionField
              id="exterior"
              label="Pick the look"
              step={nextStep()}
              open={openSection === 'exterior'}
              onToggle={() => toggleSection('exterior')}
              summary={`${CLADDINGS.find((c) => c.id === cladding)?.label} · ${ROOFS.find((r) => r.id === roof)?.label}`}
              onContinue={() => setOpenSection(availableAddOns.length > 0 ? 'addons' : 'photo')}
            >
              <div className="space-y-7">
                <div>
                  <p className="eyebrow mb-3 text-ink/45">Cladding</p>
                  <div className="flex flex-wrap gap-2">
                    {CLADDINGS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCladding(c.id)}
                        aria-pressed={cladding === c.id}
                        aria-label={c.label}
                        title={c.label}
                        className={`flex items-center gap-2.5 border py-2 pl-2 pr-4 transition-colors ${
                          cladding === c.id ? 'border-ink' : 'border-ink/15 hover:border-ink/45'
                        }`}
                      >
                        <span
                          className="h-7 w-7 border border-black/15"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3 text-ink/45">Roof</p>
                  <div className="flex flex-wrap gap-2">
                    {ROOFS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRoof(r.id)}
                        aria-pressed={roof === r.id}
                        title={r.label}
                        className={`flex items-center gap-2.5 border py-2 pl-2 pr-4 transition-colors ${
                          roof === r.id ? 'border-ink' : 'border-ink/15 hover:border-ink/45'
                        }`}
                      >
                        <span
                          className="h-7 w-7 border border-black/15"
                          style={{ backgroundColor: r.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3 text-ink/45">Roof pitch</p>
                  <div className="flex flex-wrap gap-2">
                    {PITCHES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPitch(p.id)}
                        aria-pressed={pitch === p.id}
                        className={`border px-5 py-2.5 text-xs font-medium transition-colors ${
                          pitch === p.id
                            ? 'border-ink bg-ink text-bone'
                            : 'border-ink/15 hover:border-ink/45'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3 text-ink/45">Windows</p>
                  <div className="flex flex-wrap gap-2">
                    {WINDOW_STYLES.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWindowStyle(w.id)}
                        aria-pressed={windowStyle === w.id}
                        title={w.blurb}
                        className={`border p-4 text-left transition-colors ${
                          windowStyle === w.id
                            ? 'border-ink bg-ink text-bone'
                            : 'border-ink/15 bg-white/50 hover:border-ink/45'
                        }`}
                      >
                        <span className="block font-display text-[0.78rem] font-bold uppercase tracking-[0.08em]">
                          {w.label}
                        </span>
                        <span
                          className={`mt-1.5 block text-xs leading-snug ${
                            windowStyle === w.id ? 'text-bone/60' : 'text-ink/55'
                          }`}
                        >
                          {w.blurb}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-3 text-ink/45">Door colour</p>
                  <div className="flex flex-wrap gap-2">
                    {DOOR_COLORS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDoorColor(d.id)}
                        aria-pressed={doorColor === d.id}
                        aria-label={d.label}
                        title={d.label}
                        className={`flex items-center gap-2.5 border py-2 pl-2 pr-4 transition-colors ${
                          doorColor === d.id ? 'border-ink' : 'border-ink/15 hover:border-ink/45'
                        }`}
                      >
                        <span
                          className="h-7 w-7 border border-black/15"
                          style={{ backgroundColor: d.hex }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionField>
          )}

          {/* Add-ons */}
          {availableAddOns.length > 0 && (
            <AccordionField
              id="addons"
              label="Anything else?"
              step={nextStep()}
              open={openSection === 'addons'}
              onToggle={() => toggleSection('addons')}
              summary={activeAddOns.length > 0 ? `${activeAddOns.length} added` : 'Optional'}
              onContinue={() => setOpenSection('photo')}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {availableAddOns.map((a) => {
                  const on = activeAddOns.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddOn(a.id)}
                      aria-pressed={on}
                      className={`flex gap-3 border p-4 text-left transition-colors ${
                        on ? 'border-cedar bg-cedar/15' : 'border-ink/15 bg-white/50 hover:border-ink/45'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border text-[0.6rem] ${
                          on ? 'border-ink bg-ink text-bone' : 'border-ink/35'
                        }`}
                        aria-hidden="true"
                      >
                        {on ? '✓' : ''}
                      </span>
                      <span>
                        <span className="block font-display text-[0.75rem] font-bold uppercase tracking-[0.08em]">
                          {a.label}
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-ink/60">{a.blurb}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </AccordionField>
          )}

          {/* Photo customizer — works for any build type, interior or exterior. */}
          <AccordionField
            id="photo"
            label="Customize from your own photo"
            step={nextStep()}
            open={openSection === 'photo'}
            onToggle={() => toggleSection('photo')}
            summary="Optional"
            onContinue={!isInterior ? () => setOpenSection('sketchup') : undefined}
          >
            <PhotoCustomizer brief={brief} />
          </AccordionField>

          {/* SketchUp export — exterior builds only, since it draws a standalone
              massing shell (walls + roof), which doesn't make sense for a
              kitchen, bath or whole-room renovation inside an existing house. */}
          {!isInterior && (
            <AccordionField
              id="sketchup"
              label="Open it in SketchUp"
              step={nextStep()}
              open={openSection === 'sketchup'}
              onToggle={() => toggleSection('sketchup')}
              summary={skDownloaded ? 'Downloaded' : 'Optional'}
            >
              <div className="border border-ink/15 bg-white/50 p-6">
                <p className="text-sm leading-relaxed text-ink/70">
                  Download a real, to-scale 3D starting shape built from the exact numbers above —
                  footprint, wall height and roof pitch. Open it in SketchUp to rotate it, walk
                  through it, and keep building on it yourself, or send it to our team as a
                  starting point for a proper model.
                </p>
                <button type="button" onClick={downloadSketchUp} className="btn-cedar mt-5">
                  {skDownloaded ? 'Download again (.rb)' : 'Download SketchUp file (.rb)'}
                </button>
                <p className="mt-4 text-xs leading-relaxed text-ink/45">
                  Opens via SketchUp&rsquo;s Ruby Console (Window ▸ Ruby Console — needs SketchUp
                  Pro or Studio, not the free web app). It builds walls, a roof and, if you picked
                  them, a deck and a loft floor — no windows or doors cut in yet, so treat it as a
                  rough massing model, not a finished design.
                </p>
              </div>
            </AccordionField>
          )}
        </div>
      </div>

      {/* ── Right column: sticky estimate panel ── */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-ink/15 bg-ink text-bone">
          <div className="border-b border-bone/12 p-7">
            <p className="eyebrow text-cedar">Planning range</p>
            <p className="mt-4 font-display text-[2.1rem] font-extrabold leading-none tracking-[-0.02em] sm:text-[2.5rem]">
              {formatCAD(estimate.low)}
            </p>
            <p className="mt-1 font-display text-[2.1rem] font-extrabold leading-none tracking-[-0.02em] text-bone/45 sm:text-[2.5rem]">
              {formatCAD(estimate.high)}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-bone/50">
              Roughly {formatCAD(estimate.perSqFtLow)} – {formatCAD(estimate.perSqFtHigh)} per sq ft
              at this spec.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-bone/50">
              {estimate.location.multiplier !== 1 ? (
                <>
                  Adjusted for {estimate.location.label} pricing (
                  {estimate.location.multiplier > 1 ? '+' : ''}
                  {Math.round((estimate.location.multiplier - 1) * 100)}%).
                </>
              ) : (
                <>Using {estimate.location.label} pricing.</>
              )}
            </p>
          </div>

          {projectId && (
            <div className="border-b border-bone/12 px-7 py-4">
              <p className="eyebrow text-bone/40">Reference</p>
              <p className="mt-1.5 font-display text-base font-extrabold tracking-[0.04em] text-cedar">
                {projectId}
              </p>
            </div>
          )}

          <div className="border-b border-bone/12 p-7">
            <p className="eyebrow mb-4 text-bone/40">What&rsquo;s in it</p>
            <ul className="space-y-3 text-sm">
              {estimate.lines.map((line) => (
                <li key={line.label} className="flex justify-between gap-4">
                  <span className="text-bone/70">{line.label}</span>
                  <span className="shrink-0 tabular-nums text-bone/45">
                    {formatCAD(line.low)}–{formatCAD(line.high)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 p-7">
            <a href={summary.mailto} className="btn-cedar w-full">
              Send this to us
            </a>
            <button type="button" onClick={copySummary} className="btn-ghost-dark w-full">
              {copied ? 'Copied to clipboard' : 'Copy the summary'}
            </button>
            <Link href="/contact" className="btn-ghost-dark w-full">
              Book a first meeting
            </Link>
          </div>
        </div>

        {/* Honesty notices — deliberately hard to miss. */}
        <div className="mt-4 border border-ink/15 bg-white/60 p-6 text-xs leading-relaxed text-ink/65">
          <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink">
            This is a planning range, not a quote
          </p>
          <p className="mt-3">
            It exists so you can find out whether an idea is anywhere near your budget before anyone
            spends time on drawings. Real numbers come after we walk the site. Foundations,
            servicing, permits, rock, and the finishes you actually fall in love with move a total
            more than square footage ever will.
          </p>
        </div>

        <div className="mt-4 border border-cedar bg-cedar/15 p-6 text-xs leading-relaxed" role="note">
          <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.14em]">
            This is an estimate based on research, not our invoices
          </p>
          <p className="mt-3 text-ink/75">
            Every dollar figure above comes from published 2026 Ontario construction-cost guides and
            the regional breakdowns in our own journal — not from what any of our own projects
            actually cost. The {estimate.location.label} adjustment is the same: a general
            regional estimate, not a number pulled from a job we&rsquo;ve built there. Treat this
            whole range as a starting point for the conversation, never as what we&rsquo;ll charge
            you.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ── Small presentational helpers ── */

/**
 * One step of the guided form — collapsed to a single row showing what's
 * already picked, or expanded to show its full controls. Configurator owns
 * which one id is open (`openSection`) so opening a step closes whatever
 * else was open, keeping this a real accordion rather than a pile of
 * independently-expandable boxes that could all end up open at once and
 * bring back the original wall-of-scroll problem.
 */
function AccordionField({
  label,
  step,
  open,
  onToggle,
  summary,
  onContinue,
  continueLabel = 'Continue',
  children,
}: {
  id: string;
  label: string;
  step: string;
  open: boolean;
  onToggle: () => void;
  /** Shown, collapsed, next to the label — the current pick at a glance. */
  summary?: string;
  /** Omit on the last step in a chain — no "Continue" button rendered. */
  onContinue?: () => void;
  continueLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`border transition-colors ${open ? 'border-ink/30 bg-white/70' : 'border-ink/12 bg-white/40 hover:border-ink/25'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex min-w-0 items-baseline gap-4">
          <span className="shrink-0 font-display text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cedar">
            {step}
          </span>
          <span className="truncate font-display text-[0.95rem] font-bold uppercase tracking-[-0.01em] sm:text-lg">
            {label}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {!open && summary && (
            <span className="hidden max-w-[9rem] truncate text-xs text-ink/45 sm:block">
              {summary}
            </span>
          )}
          <span
            className={`font-display text-base text-ink/35 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ⌄
          </span>
        </span>
      </button>
      {open && (
        <div className="border-t border-ink/10 px-5 pb-6 pt-5">
          {children}
          {onContinue && (
            <button type="button" onClick={onContinue} className="btn-cedar mt-7">
              {continueLabel} →
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Choice({
  selected,
  onClick,
  label,
  blurb,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  blurb: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`block w-full border p-3.5 text-left transition-colors ${
        selected ? 'border-cedar bg-cedar/15' : 'border-ink/15 bg-white/50 hover:border-ink/45'
      }`}
    >
      <span className="block text-[0.8rem] font-semibold">{label}</span>
      <span className="mt-1 block text-xs leading-snug text-ink/55">{blurb}</span>
    </button>
  );
}
