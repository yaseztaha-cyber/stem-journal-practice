import { AcademyUnitSeed } from './academyTypes';

// Units 17–22 — Research Writing Track: from question to conclusions with integrity.
// Videos follow the honest reserved-slot pattern (real objectives, no fake player).
export const ACADEMY_PART5: (AcademyUnitSeed & { track_scope?: string })[] = [
  {
    slug: 'research-questions',
    unit_number: 17,
    title: 'Research Questions and Problem Statements',
    description: 'Turn a broad topic into a researchable question: topic, problem, question, and hypothesis where appropriate.',
    est_minutes: 45,
    track_scope: 'RESEARCH',
    video: {
      title: 'Unit 17 — Ask a Question Worth Answering',
      description: 'Why most "research questions" are actually topics, how to narrow one, and what a testable question unlocks for methods and discussion.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      transcript:
        'RESERVED SLOT — intro video not yet recorded.\n' +
        'This video will cover: what this unit teaches (topic → problem → question → hypothesis), why it matters (every later section answers this question), the common mistake (a topic disguised as a question), and what you will practice (the question builder).',
    },
    lessons: [
      {
        title: 'Topic is not a question',
        objective: 'Distinguish topic, problem, and research question, and narrow a topic twice.',
        body_md:
          'A topic ("food packaging") cannot be answered. A problem ("spoiling food wastes household money") motivates. A research question ("does a chitosan-coated wrapper delay mold on bread versus unwrapped bread over 5 days?") can be tested.\n\n' +
          'Narrow twice: first by population or material, then by measurable outcome and time window. Each narrowing must keep the question answerable with school resources.\n\n' +
          'Test your question: can you state what data would answer it, and what result would prove you wrong? If not, narrow again.',
        examples: [
          {
            weak: 'My research is about food packaging.',
            strong: 'Does a chitosan-coated paper wrapper delay visible mold on baladi bread compared with unwrapped bread over 5 days at room temperature?',
            why: 'The strong version names the intervention, comparison, outcome, and time window — it can be tested and proven wrong.',
          },
        ],
        takeaway: 'If your question cannot be answered with data, it is still a topic — narrow twice.',
      },
      {
        title: 'Problem statements and hypotheses',
        objective: 'Write a problem statement and a conditional hypothesis for your question.',
        body_md:
          'A problem statement has three moves: context (what is known), gap (what is missing or failing), and stake (why it matters and to whom). One paragraph, no citations needed at draft stage.\n\n' +
          'A hypothesis is a testable prediction with a reason: "If [intervention], then [measurable outcome], because [mechanism]." Only write one where your design predicts a direction; exploratory work may skip it honestly.\n\n' +
          'Both must align: the hypothesis must answer the research question, and the methods must test the hypothesis. Misalignment is the most common structural failure.',
        examples: [
          {
            weak: 'I think natural packaging is good and will study it.',
            strong: 'If bread is wrapped in chitosan-coated paper, then visible mold appears at least 2 days later than unwrapped bread, because chitosan films reduce surface moisture available to mold.',
            why: 'If/then/because with a measurable outcome (days to visible mold) and a mechanism — directly testable.',
          },
        ],
        widget: 'rq_builder',
        takeaway: 'Problem states the gap; hypothesis predicts the answer with a reason. Both must align with methods.',
      },
    ],
    items: [
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which of these is a researchable question?',
        payload: {
          options: [
            'Food packaging and its importance.',
            'Does a beeswax wrap delay bread mold versus no wrap over 5 days?',
            'Students should care more about food waste.',
          ],
          correct: 1,
          explanation: 'Only the second can be answered with data: it names intervention, comparison, outcome, and time window.',
        },
      },
      {
        lesson: 1, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which hypothesis is testable?',
        payload: {
          options: [
            'Natural materials are better for the planet.',
            'If package wall thickness doubles, then moisture loss over 5 days drops, because thicker barriers slow vapor transfer.',
            'Packaging is an interesting topic worth exploring.',
          ],
          correct: 1,
          explanation: 'If/then/because with a measurable outcome (moisture loss over 5 days) — testable and falsifiable.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'medium', points: 2,
        prompt: 'Write a research question for your own project with intervention, comparison, outcome, and time window.',
        payload: {
          keywords: ['versus', 'compared', 'days', 'measure', 'delay', 'reduce', 'than'],
          threshold: 0.5,
          sample: 'Does a double-layer paper wrapper reduce bread mass loss compared with single-layer over 5 days?',
          explanation: 'A complete question needs all four parts; missing any one makes it untestable as stated.',
        },
      },
    ],
    tricks: [
      { title: 'The falsifiability test', body: 'Ask: "what result would prove me wrong?" If nothing could, narrow the question until something could.' },
      { title: 'Question first, methods second', body: 'Never choose equipment before the question. Write the question, list the data that answers it, then pick instruments.' },
    ],
    mistakes: [
      { title: 'Topic disguised as question', body: '"The effect of packaging" asks nothing. Add: on what, compared to what, measured how, over what time?' },
      { title: 'Hypothesis that predicts nothing', body: '"X affects Y" predicts no direction. Say increase or decrease, and why.' },
    ],
  },
  {
    slug: 'literature-review',
    unit_number: 18,
    title: 'Literature Review and Source Evaluation',
    description: 'Find trustworthy sources, evaluate them, and synthesize — not list — what is known.',
    est_minutes: 45,
    track_scope: 'RESEARCH',
    video: {
      title: 'Unit 18 — Standing on Real Shoulders',
      description: 'Where to search, how to judge a source in 5 minutes, and how synthesis differs from a list of summaries.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      transcript:
        'RESERVED SLOT — intro video not yet recorded.\n' +
        'This video will cover: what a literature review is for (finding the gap your work fills), why source evaluation matters (one bad source poisons a paper), the common mistake (a list of summaries with no synthesis), and what you will practice (the synthesis matrix).',
    },
    lessons: [
      {
        title: 'Judge a source in five minutes',
        objective: 'Evaluate authority, currency, method, and relevance of any source.',
        body_md:
          'Four checks, five minutes: WHO wrote it (authority — journal, institution, expertise)? WHEN (currency — is the finding still valid)? HOW (method — data or opinion? sample size? controls)? And SO WHAT for your question (relevance)?\n\n' +
          'Rank sources: peer-reviewed papers and official data first, textbooks for background, reputable journalism for context only, random blogs and AI answers never as evidence.\n\n' +
          'One weak source cited as fact can sink a whole paper. When in doubt, cite the stronger source or drop the claim.',
        examples: [
          {
            weak: 'According to a blog, chitosan kills all germs, so our package is antibacterial.',
            strong: 'A 2021 packaging journal study measured 40% slower mold growth on chitosan-coated paper versus plain paper over 6 days; we cite it only for the coating effect, not for safety claims.',
            why: 'Named source, bounded claim, exact scope — the review judges rather than repeats.',
          },
        ],
        takeaway: 'Authority, currency, method, relevance — then bound every cited claim to what the source actually showed.',
      },
      {
        title: 'Synthesize, do not list',
        objective: 'Build a synthesis matrix that groups sources by finding, not by author.',
        body_md:
          'A list ("A said X. B said Y.") is not a review. A synthesis groups findings: make a table with rows for themes (e.g., barrier materials, natural antimicrobials, indicator dyes) and columns for sources, then write what the pattern shows.\n\n' +
          'End the review at the gap: "barrier studies cover plastics; almost none test school-feasible natural coatings over 5+ days — that is where this work fits."\n\n' +
          'Every paragraph should compare or contrast at least two sources. A paragraph about one source belongs in notes, not in the paper.',
        examples: [
          {
            weak: 'Smith (2020) studied films. Ahmed (2022) studied coatings. Both relate to packaging.',
            strong: 'Both Smith (2020) and Ahmed (2022) find moisture barriers decisive, but Smith tests synthetics while Ahmed tests starch coatings — neither tests repurposed fibers, which is the gap this project addresses.',
            why: 'Compares findings, names the pattern, and lands on the gap the student work fills.',
          },
        ],
        takeaway: 'Group by finding, compare sources in every paragraph, and end at the gap your work fills.',
      },
    ],
    items: [
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which source is strongest evidence for a preservation claim?',
        payload: {
          options: [
            'A viral video claiming a miracle wrap.',
            'A peer-reviewed study with measured 5-day mold data and a control.',
            'A packaging company advertisement.',
          ],
          correct: 1,
          explanation: 'Method plus data plus control beats virality and marketing every time.',
        },
      },
      {
        lesson: 1, quiz: true, kind: 'compare_levels', difficulty: 'medium', points: 2,
        prompt: 'Which paragraph synthesizes rather than lists?',
        payload: {
          weak: 'Lee (2021) used wax. Omar (2023) used starch.',
          medium: 'Lee (2021) used wax and Omar (2023) used starch, and both worked.',
          strong: 'Lee (2021) and Omar (2023) agree barriers matter, but wax wins on moisture while starch wins on cost — leaving low-cost moisture barriers open, which this project tests with repurposed fibers.',
          options: ['First', 'Second', 'Third'],
          correct: [2],
          explanation: 'Only the third compares findings and lands on a gap; the others list.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'A literature review paragraph about a single source with no comparison is finished and ready.',
        payload: {
          correct: false,
          explanation: 'False — a review synthesizes. Single-source paragraphs belong in notes until compared.',
        },
      },
    ],
    tricks: [
      { title: 'Five-minute source triage', body: 'Check authority, date, method, relevance before reading deeply. Most sources fail at check two.' },
      { title: 'Gap-first notes', body: 'For every source, write one line: "what gap does this leave for me?" The review almost writes itself.' },
    ],
    mistakes: [
      { title: 'Citation as decoration', body: 'A citation after a claim you never verified. Read the result, not just the abstract.' },
      { title: 'Overclaiming from one study', body: 'One paper never proves a field. Hedge with sample, scope, and "suggests".' },
    ],
  },
  {
    slug: 'writing-introduction',
    unit_number: 19,
    title: 'Writing the Introduction',
    description: 'Funnel from background to gap to question: why this work, why now.',
    est_minutes: 40,
    track_scope: 'RESEARCH',
    video: {
      title: 'Unit 19 — The Funnel',
      description: 'How introductions narrow from known background to your exact question without dumping everything you read.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      transcript:
        'RESERVED SLOT — intro video not yet recorded.\n' +
        'This video will cover: the funnel shape (background → gap → question → roadmap), why introductions fail (textbook chapter instead of an argument), and the one-paragraph test for your gap.',
    },
    lessons: [
      {
        title: 'Background, gap, question',
        objective: 'Structure an introduction as background → gap → question → roadmap.',
        body_md:
          'Paragraph 1: background the reader needs — 3–4 sentences of established facts with citations. Paragraph 2: the gap — what is missing, failing, or untested (cite the closest work, then its limit). Paragraph 3: your question and approach in 2–3 sentences, plus a roadmap sentence.\n\n' +
          'Cut anything that does not serve the gap. If a fact is interesting but your work does not use it, delete it.\n\n' +
          'The introduction makes one promise the rest of the paper must keep: answer exactly the question it poses.',
        examples: [
          {
            weak: 'Food is important. Packaging exists in many forms. Plastic is common. Natural materials exist. This paper studies packaging.',
            strong: 'Chitosan coatings delay mold on paper (Ahmed 2022), but school-feasible repurposed fibers are untested over multi-day trials. This study asks whether a double-layer repurposed-fiber wrapper delays bread mold versus single-layer over 5 days, using daily mass and photo readings.',
            why: 'Background, gap, then the exact question with method preview — a promise the paper can keep.',
          },
        ],
        takeaway: 'Background earns the gap; the gap earns the question; the question dictates the methods.',
      },
      {
        title: 'Roadmap and scope',
        objective: 'Write a roadmap sentence and state scope limits up front.',
        body_md:
          'End the introduction with a roadmap: "Section 2 describes materials and the 5-day protocol; Section 3 reports readings; Section 4 interprets them against the literature."\n\n' +
          'State scope limits early: one food, one climate, five days. Limits stated up front read as honesty; discovered by the reader they read as flaws.\n\n' +
          'Never promise results in the introduction ("this proves…"). Promise only the investigation.',
        examples: [
          {
            weak: 'This paper will prove natural packaging solves food waste.',
            strong: 'This paper tests one wrapper design on one food over five days; it does not claim safety certification or generalizability beyond similar breads.',
            why: 'Bounded scope stated up front — credible and checkable.',
          },
        ],
        takeaway: 'Roadmap the sections, bound the scope, promise investigation — never results.',
      },
    ],
    items: [
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which introduction order is correct?',
        payload: {
          options: [
            'Question → methods → background → gap.',
            'Background → gap → question → roadmap.',
            'Results → background → question.',
          ],
          correct: 1,
          explanation: 'The funnel narrows: earn the gap with background, then pose the question, then roadmap.',
        },
      },
      {
        lesson: 1, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'Stating your study limits in the introduction makes the paper look weak.',
        payload: {
          correct: false,
          explanation: 'False — stated limits read as honesty; hidden limits discovered by readers read as flaws.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'medium', points: 2,
        prompt: 'Write a two-sentence gap + question for your own project.',
        payload: {
          keywords: ['however', 'untested', 'missing', 'asks', 'whether', 'gap'],
          threshold: 0.5,
          sample: 'Barrier studies cover plastics, but repurposed fibers are untested over 5 days. This study asks whether double-layer fiber delays bread mold versus single-layer.',
          explanation: 'Gap names what is missing; the question follows directly from it.',
        },
      },
    ],
    tricks: [
      { title: 'The gap sentence', body: 'If you cannot point at your gap sentence, you have no introduction yet — only background.' },
      { title: 'Delete-to-serve', body: 'For every background fact ask: does my gap need it? If not, cut it no matter how interesting.' },
    ],
    mistakes: [
      { title: 'Textbook dump', body: 'Five paragraphs of general facts with no gap. Background serves the gap or leaves.' },
      { title: 'Result spoilers', body: 'Promising conclusions in the introduction. Promise the investigation, deliver results later.' },
    ],
  },
  {
    slug: 'writing-methods',
    unit_number: 20,
    title: 'Writing Methods',
    description: 'Materials, protocol, controls, and measurements written so another team can repeat you.',
    est_minutes: 40,
    track_scope: 'RESEARCH',
    video: {
      title: 'Unit 20 — Repeat Me',
      description: 'The reproducibility test: materials with sources, steps in order, controls, and calibration — nothing missing, nothing extra.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      transcript:
        'RESERVED SLOT — intro video not yet recorded.\n' +
        'This video will cover: the repeatability test (could a stranger rebuild from your text?), the four methods blocks, and the classic sin (results hiding in methods).',
    },
    lessons: [
      {
        title: 'Materials and protocol',
        objective: 'List materials with sources and write steps another team can follow.',
        body_md:
          'Materials: every item with source and preparation ("repurposed kraft paper, washed, air-dried 24 h"). Include brand/model of instruments.\n\n' +
          'Protocol: numbered steps in order, with quantities, times, and conditions ("stored at 25±2 °C, readings at 0/24/…/120 h"). A stranger with your materials should reach your setup.\n\n' +
          'Controls and calibration get their own sentences: what the control was, what was calibrated against what reference. No results here — "mass dropped 8%" belongs in Results, not Methods.',
        examples: [
          {
            weak: 'We made packages and tested them for some days, measuring stuff.',
            strong: 'Three 1.5 L prototypes (double kraft, beeswax seal) plus three unwrapped controls; stored together at 25±2 °C; mass (0.1 g balance, calibrated with 100 g standard) and photos recorded at 0, 24, 48, 72, 96, 120 h.',
            why: 'Quantities, instruments, calibration, schedule, controls — repeatable as written.',
          },
        ],
        takeaway: 'Materials with sources, numbered steps with numbers, controls and calibration explicit — zero results.',
      },
      {
        title: 'Design choices belong here too',
        objective: 'Justify key design decisions briefly inside methods.',
        body_md:
          'Methods also record WHY choices were made: "1.5 L chosen to fit 250 g baladi bread with 2 cm clearance; beeswax selected over tape for food-contact safety."\n\n' +
          'One sentence of justification per major choice is enough — the full debate lives in your journal, not the paper.\n\n' +
          'End methods with the analysis plan: how readings become claims (means, graphs, comparisons). This locks you against cherry-picking later.',
        examples: [
          {
            weak: 'We used what was available.',
            strong: 'Beeswax seal chosen over tape for food-contact safety; analysis compares prototype-vs-control means at each time point with the 0 h baseline.',
            why: 'Choice justified in one line; analysis plan pre-commits the comparison.',
          },
        ],
        takeaway: 'Justify each major choice in one line and pre-commit the analysis plan.',
      },
    ],
    items: [
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which sentence belongs in Methods?',
        payload: {
          options: [
            'Mass dropped 8% by 120 h, proving the design works.',
            'Mass recorded with a 0.1 g balance at 0, 24, …, 120 h for three prototypes and three controls.',
            'Future work should test more foods.',
          ],
          correct: 1,
          explanation: 'Methods describe what was done and measured — results and conclusions live elsewhere.',
        },
      },
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'A methods section is complete when…',
        payload: {
          options: [
            'It is long and uses technical words.',
            'Another team could repeat the work from it alone.',
            'It explains why the results matter.',
          ],
          correct: 1,
          explanation: 'Repeatability is the only test. Length, jargon, and interpretation are irrelevant here.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'medium', points: 2,
        prompt: 'Write one methods sentence for your project with quantity, instrument, and schedule.',
        payload: {
          keywords: ['measured', 'recorded', 'hours', 'control', 'calibrated', 'balance', 'samples'],
          threshold: 0.5,
          sample: 'Mass of three prototypes and three controls recorded with a calibrated 0.1 g balance at 0–120 h.',
          explanation: 'Quantity + instrument + schedule + controls in one sentence.',
        },
      },
    ],
    tricks: [
      { title: 'The stranger test', body: 'Hand your methods to a friend. Every question they ask is a missing sentence.' },
      { title: 'Numbers or it did not happen', body: 'No "some", "several", "a while" in methods. Quantities, times, counts.' },
    ],
    mistakes: [
      { title: 'Results in methods', body: '"Mass dropped 8%" is a result. Methods says you measured mass — nothing about what you found.' },
      { title: 'Brand-less instruments', body: '"A balance" cannot be repeated. Model, precision, calibration reference.' },
    ],
  },
  {
    slug: 'writing-conclusions',
    unit_number: 21,
    title: 'Writing Conclusions and Limitations',
    description: 'Answer the question, state limits honestly, and point at next work.',
    est_minutes: 35,
    track_scope: 'RESEARCH',
    video: {
      title: 'Unit 21 — Answer and Admit',
      description: 'Conclusions that answer the exact question, limitations that strengthen trust, and future work that follows.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      transcript:
        'RESERVED SLOT — intro video not yet recorded.\n' +
        'This video will cover: mirroring the introduction question, the three-sentence conclusion, why limitations increase trust, and future work that a reader could actually start.',
    },
    lessons: [
      {
        title: 'Answer the exact question',
        objective: 'Write a conclusion that mirrors the introduction question with bounded claims.',
        body_md:
          'Sentence 1: restate the question. Sentence 2: answer it with your key number ("mold delayed by 2 days, mass loss 8% vs 15%"). Sentence 3: bound it ("for baladi bread, 5 days, room temperature").\n\n' +
          'Every claim must trace to a result. New claims in conclusions — ideas never measured — are the fastest way to lose a judge.\n\n' +
          'Mirror check: place introduction and conclusion side by side. Same question, same scope, no drift.',
        examples: [
          {
            weak: 'In conclusion, natural packaging is the future and will solve food waste worldwide.',
            strong: 'Double-layer fiber delayed visible mold on baladi bread by about 2 days versus single-layer over 5 days at room temperature; safety and other foods were not tested.',
            why: 'Answers the exact question with the key number and explicit bounds — nothing more.',
          },
        ],
        takeaway: 'Restate, answer with numbers, bound the scope. No new claims.',
      },
      {
        title: 'Limitations and next steps',
        objective: 'State real limitations and propose follow-up work that follows from them.',
        body_md:
          'Limitations are specific, not ritual: "three samples per group", "one food, one climate", "color read by eye". Each limitation should connect to a concrete next step.\n\n' +
          'Future work must be doable by someone reading you: "repeat with n=10 and a phone-camera color scale" beats "study all foods".\n\n' +
          'Never apologize for scope ("unfortunately we only…"). Scope stated as fact reads as professionalism.',
        examples: [
          {
            weak: 'There were some limitations but overall the project was successful.',
            strong: 'With three samples per group, small effects may hide; repeating with ten samples and blinded color scoring would firm up the 2-day delay estimate.',
            why: 'Specific limits, each pointing at concrete next work — no apology, no vagueness.',
          },
        ],
        takeaway: 'Specific limits, each with a doable next step. Facts, not apologies.',
      },
    ],
    items: [
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which conclusion sentence is acceptable?',
        payload: {
          options: [
            'This proves natural packaging will end world hunger.',
            'For baladi bread over 5 days, double-layer fiber delayed mold about 2 days versus single-layer.',
            'More research is needed (no specifics).',
          ],
          correct: 1,
          explanation: 'Bounded, numbered, and tied to what was measured — the other two overclaim or say nothing.',
        },
      },
      {
        lesson: 1, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'Good limitations sections apologize for the study being small.',
        payload: {
          correct: false,
          explanation: 'False — state limits as facts with next steps. Apology adds nothing; specificity adds trust.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'medium', points: 2,
        prompt: 'Write one limitation of your project plus the concrete next step it implies.',
        payload: {
          keywords: ['only', 'limitation', 'repeat', 'next', 'samples', 'would', 'with'],
          threshold: 0.5,
          sample: 'Only one food was tested; repeating the protocol with cheese would test whether the delay generalizes.',
          explanation: 'Limitation plus implied next step, both specific.',
        },
      },
    ],
    tricks: [
      { title: 'Mirror test', body: 'Introduction question and conclusion answer side by side — same scope, same terms.' },
      { title: 'Trace every claim', body: 'Draw an arrow from each conclusion sentence to its result. Orphans get deleted.' },
    ],
    mistakes: [
      { title: 'Scope creep in conclusions', body: 'Answering a bigger question than you asked. Conclusions shrink to the question, never grow.' },
      { title: 'Vague future work', body: '"More research needed" helps nobody. Name the repeat, the n, the instrument.' },
    ],
  },
  {
    slug: 'academic-integrity',
    unit_number: 22,
    title: 'Academic Integrity',
    description: 'Paraphrase honestly, cite completely, claim only what data supports.',
    est_minutes: 35,
    track_scope: 'RESEARCH',
    video: {
      title: 'Unit 22 — Yours, Honestly',
      description: 'Paraphrase vs patchwork, citation completeness, and the overclaiming habit that sinks good projects.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 0,
      transcript:
        'RESERVED SLOT — intro video not yet recorded.\n' +
        'This video will cover: what counts as your words (structure + voice, not synonym swaps), the cite-everything-that-is-not-yours rule, and why overclaiming is an integrity issue, not a style issue.',
    },
    lessons: [
      {
        title: 'Paraphrase, do not patchwork',
        objective: 'Rewrite source ideas in your own structure with citation.',
        body_md:
          'Patchwork (synonym-swapping while keeping the source sentence structure) is still copying. True paraphrase: read, close the source, explain the idea as you would to a friend, then cite.\n\n' +
          'Quote sparingly — definitions and striking numbers earn quotes; everything else gets paraphrase plus citation.\n\n' +
          'Every borrowed fact, number, and idea carries a citation. Your data, your reasoning, and common knowledge do not.',
        examples: [
          {
            weak: 'Chitosan films lower surface dampness accessible to mildew (paraphrase of one sentence, same structure, cited).',
            strong: 'Because mold needs surface moisture and chitosan films hold less of it, coated paper hosted mold two days later in Ahmed (2022) — a mechanism our wrapper design relies on.',
            why: 'Restructured around the mechanism, integrated with the student argument, cited.',
          },
        ],
        takeaway: 'Close the source, explain it your way, cite. Structure copied is still copying.',
      },
      {
        title: 'Claim only what you measured',
        objective: 'Detect overclaiming in your own conclusions and fix it.',
        body_md:
          'Overclaiming ladder: measured → suggests → shows → proves → always. Each step up needs exponentially more evidence. Student projects live at "suggests" — and that is fine.\n\n' +
          'Red-flag words in your draft: proves, guarantees, all, never, best, solves. Replace each with the bounded version or add the missing evidence.\n\n' +
          'Integrity is not only honesty about sources — it is honesty about uncertainty. A bounded claim believed beats a grand claim doubted.',
        examples: [
          {
            weak: 'This proves natural packaging eliminates food waste.',
            strong: 'Over five days, this wrapper suggests a 2-day mold delay for bread; waste, safety, and other foods remain untested.',
            why: 'Downgraded to what the data supports, with the untested parts named.',
          },
        ],
        takeaway: 'Live at "suggests" until the evidence earns stronger verbs.',
      },
    ],
    items: [
      {
        lesson: 0, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which is acceptable paraphrase practice?',
        payload: {
          options: [
            'Swapping synonyms while keeping the source sentence order, with citation.',
            'Closing the source, explaining the idea in your own structure, with citation.',
            'Copying two sentences without citation since you changed three words.',
          ],
          correct: 1,
          explanation: 'Only restructured explanation in your voice counts; the others copy with or without credit.',
        },
      },
      {
        lesson: 1, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Your data shows a 2-day delay on bread. Which claim is honest?',
        payload: {
          options: [
            'This proves the design works for all foods.',
            'This suggests a 2-day delay for bread under these conditions; other foods untested.',
            'This guarantees no mold ever.',
          ],
          correct: 1,
          explanation: 'Bounded to food, time, and conditions — everything else is overclaiming.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'Common knowledge (e.g., "mold grows on old bread") needs a citation in every paper.',
        payload: {
          correct: false,
          explanation: 'False — common knowledge needs no citation; specific facts, numbers, and others’ ideas always do.',
        },
      },
    ],
    tricks: [
      { title: 'Close-and-explain', body: 'Read, close, explain aloud, write, cite. If you cannot explain it closed, you do not understand it yet.' },
      { title: 'Red-flag sweep', body: 'Search your draft for proves, guarantees, all, never, best, solves — downgrade or evidence each one.' },
    ],
    mistakes: [
      { title: 'Decorative citations', body: 'Citations after claims you never verified in the source. Read results, not abstracts.' },
      { title: 'Borrowed structure', body: 'Your paragraph follows the source paragraph point-for-point. Restructure around your argument.' },
    ],
  },
];
