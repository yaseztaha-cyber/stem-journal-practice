import { AcademyUnitSeed } from './academyTypes';

// Unit 16 — BLUE Masterclass: anatomy, repair workshops, GREEN editing, full challenge.
export const ACADEMY_PART4: AcademyUnitSeed[] = [
  {
    slug: 'blue-masterclass',
    unit_number: 16,
    title: 'BLUE Masterclass',
    description: 'The final ascent: BLUE anatomy, live repair workshops, turning GREEN answers BLUE, and the full RED-to-BLUE journal challenge with revision.',
    est_minutes: 60,
    video: {
      title: 'Unit 16 — The Final Ascent to BLUE',
      description: 'How BLUE answers are built, what the master challenge demands, and the revision habit that separates exhibition work from homework.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 288,
      transcript:
        'Welcome to the BLUE Masterclass, the final unit of the Academy.\n' +
        'Here you will assemble everything: claim, evidence, explanation, analysis, precision, and structure — into answers that another team could reuse.\n' +
        'You will repair weak answers live, edit a GREEN answer into BLUE, and take the full journal challenge: write, get dimension feedback, revise, and compare versions.\n' +
        'The mistake to avoid at this stage is polishing instead of repairing. Polish never moved a level; only substance does.\n' +
        'After this unit you will be able to turn any RED draft BLUE on demand — and explain exactly which move did it.',
    },
    lessons: [
      {
        title: 'BLUE anatomy',
        objective: 'Dissect a BLUE answer into claim, evidence, explanation, and analysis segments.',
        body_md:
          'A BLUE answer is not a vibe — it is four labeled parts working together. Read the example below segment by segment before reading the whole.\n\n' +
          'Notice the proportions: one sentence of claim, two of evidence, two of explanation, two of analysis and precision. Most GREEN answers have the first three and starve the fourth.\n\n' +
          'Your job from now on: write the draft, then label your own segments. Any missing label is your next edit.',
        examples: [
          {
            weak: 'Our water filter worked well and the team learned a lot from building it.',
            strong:
              'The gravel pre-filter held flow above 1.0 L/min for the full ten minutes, triple the mesh-only duration. Coarse gravel catches leaves while passing water because surface clogging concentrates in the first layer, which our pressure readings confirmed. Sizing pre-filters by debris type first is now our rule — and any team fighting early clogging can copy it.',
            why: 'Claim (held flow), evidence (1.0 L/min, triple duration), explanation (surface-clogging mechanism with readings), analysis (a sizing rule other teams can reuse). Four moves, each labeled, none missing.',
            breakdown: [
              { label: 'CLAIM', text: 'The gravel pre-filter held flow above 1.0 L/min for the full ten minutes, triple the mesh-only duration.' },
              { label: 'EVIDENCE', text: '1.0 L/min sustained; triple the mesh-only duration across the timed trials.' },
              { label: 'EXPLANATION', text: 'Coarse gravel catches leaves while passing water because surface clogging concentrates in the first layer, confirmed by pressure readings.' },
              { label: 'ANALYSIS', text: 'Sizing pre-filters by debris type first is now our rule — reusable by any team fighting early clogging.' },
            ],
          },
          {
            weak: 'The experiment gave good results that prove the method works.',
            strong:
              'Yield rose from 41% to 68% across four batches after doubling aeration time; dissolved-oxygen logs show the cultures never dropped below the 4 mg/L stress threshold again. Aerate to the threshold, not the clock — a rule any batch process can borrow.',
            why: 'Numbers replace "good", the mechanism replaces "proved", and the closing rule converts one result into portable method.',
            breakdown: [
              { label: 'CLAIM', text: 'Yield rose from 41% to 68% across four batches.' },
              { label: 'EVIDENCE', text: 'Dissolved-oxygen logs never dropped below 4 mg/L after the change.' },
              { label: 'EXPLANATION', text: 'Doubled aeration removed the oxygen bottleneck limiting growth.' },
              { label: 'ANALYSIS', text: 'Aerate to the threshold, not the clock — portable to any batch process.' },
            ],
          },
        ],
      },
      {
        title: 'Repair workshop: evidence + explanation',
        objective: 'Repair evidence-free and explanation-free drafts using the surgery steps.',
        body_md:
          'Repair is a skill separate from writing: given any weak draft, you locate the missing moves and graft them in. Use the surgery below — each step adds exactly one move.\n\n' +
          'Step discipline matters: add evidence before explanation. Explaining a claim with no facts produces confident fog; evidencing first gives the explanation something to chew on.\n\n' +
          'After surgery, compare versions with the diff view. If you cannot point at what changed, the repair did not happen.',
        examples: [
          {
            weak: 'Insulation improved our box a lot.',
            strong:
              'Lining the box with 2 cm foam cut heat loss from 42 W to 29 W over one hour (evidence). Conduction through the walls dominated because the lid gap contributed under 10% in the smoke test (explanation). Map losses before buying material (analysis).',
            why: 'Three grafts: a measurement, a mechanism with a test behind it, and a portable rule. "A lot" retired with full honors.',
          },
          {
            weak: 'We made the bridge stronger and now it holds more weight.',
            strong:
              'Doubling only the midspan joint — where load analysis showed triple stress — raised failure load from 8 kg to 21 kg. Reinforcement belongs where stress concentrates, verified by breaking three variants; blanket thickening wastes material everywhere else.',
            why: 'Named location, before/after loads, the stress principle, and a design rule. "Stronger" became a bill of quantities.',
          },
        ],
      },
      {
        title: 'Repair workshop: analysis + precision',
        objective: 'Convert explained drafts into analyzed ones and foggy wording into precise wording.',
        body_md:
          'Analysis answers: what does this tell us, why does it matter, what can we conclude? If your draft ends at explanation, push one stage further — state the rule, the warning, or the method others inherit.\n\n' +
          'Precision pass: replace every vague noun with its referent and every intensifier with its number. "Significantly better" must become something like "from 0.4 to 1.1 L/min" or be deleted.\n\n' +
          'A draft that explains but never concludes is GREEN with the door open. Analysis closes it.',
        examples: [
          {
            weak: 'The damper fixed the vibration issue, which was great for the project overall.',
            strong:
              'The rubber damper moved the bracket\u2019s natural frequency from 40 Hz to 28 Hz, clear of the 38–42 Hz motor band — verified across five clean trials. Resonance, not material weakness, was the enemy; tap-test every bracket before blaming suppliers.',
            why: 'Numbers name the fix, the mechanism names the enemy, and the closing rule hands the lesson to the next team. "Great for the project" helps no one.',
            breakdown: [
              { label: 'EVIDENCE', text: 'Natural frequency moved from 40 Hz to 28 Hz; five clean trials.' },
              { label: 'EXPLANATION', text: 'Resonance with the 38–42 Hz motor band caused the failure, not weak material.' },
              { label: 'ANALYSIS', text: 'Tap-test every bracket before blaming suppliers — a rule for any vibration problem.' },
            ],
          },
          {
            weak: 'The new packaging kept the food fresh longer, which was a good result.',
            strong:
              'Chitosan-coated strawberries stayed firm six days at room temperature versus three uncoated, with average weight loss 4% against 11%. The film slows moisture exchange without sealing out oxygen — so coat for barrier, ventilate for respiration.',
            why: 'Days, percentages, and a mechanism replace "longer" and "good". The closing rule balances two opposing needs.',
            breakdown: [
              { label: 'EVIDENCE', text: 'Six days versus three; 4% versus 11% weight loss.' },
              { label: 'EXPLANATION', text: 'The film slows moisture exchange while passing oxygen.' },
              { label: 'ANALYSIS', text: 'Coat for barrier, ventilate for respiration — a rule for any fresh packaging.' },
            ],
          },
        ],
      },
      {
        title: 'Editing a GREEN answer into BLUE',
        objective: 'Perform a targeted GREEN→BLUE edit: add analysis and precision without rewriting everything.',
        body_md:
          'GREEN drafts usually need only two grafts: one analysis sentence (the reusable rule) and one precision swap (numbers for adjectives). Resist rewriting — surgeons graft, they do not transplant.\n\n' +
          'Procedure: label the draft\u2019s segments, circle vague words, write the missing analysis sentence, swap the vaguest noun for its measurement, then re-read for flow.\n\n' +
          'If your edit changed more than 30% of the words, you rewrote instead of repaired. Smaller, sharper edits score higher — and teach more.',
        examples: [
          {
            weak: 'GREEN draft: "We calibrated the sensor against known weights. Readings matched closely, so our measurements were reliable enough for the experiment."',
            strong: 'Same draft, two grafts: "...matched within ±2 g across ten weights (precision swap). Because error stayed under our 5 g tolerance, every later conclusion inherits that bound — calibrate against your tolerance, not perfection (analysis graft)."',
            why: 'Two sentences added, zero deleted. The tolerance rule turns a reliable experiment into reusable method — the exact GREEN→BLUE distance.',
          },
          {
            weak: 'GREEN draft: "The insulation cut heat loss noticeably, so the box stayed warmer in all trials."',
            strong: 'Same draft, two grafts: "...cut loss from 42 W to 29 W (precision swap). Since walls dominated the smoke test, future boxes get foam first and lid seals second — spend where losses live (analysis graft)."',
            why: 'Numbers replace "noticeably"; a spending rule replaces the dead end. Same draft length class, one level higher.',
          },
        ],
      },
      {
        title: 'Full journal challenge',
        objective: 'Write, analyze, revise, and compare a complete journal answer across taught dimensions.',
        body_md:
          'Pick one of the three real journal prompts in the challenge widget. Write your first version without self-censoring — speed first, quality second.\n\n' +
          'Run the dimension analysis: coverage, claim, evidence, explanation, analysis, language, precision, structure. Each dimension reports Strong, Developing, or Missing with the reason.\n\n' +
          'Revise once, targeting only the weakest two dimensions. Then compare versions in the diff view and write one sentence on what changed. That sentence is the real certificate.',
        examples: [
          {
            weak: 'First version (typical): "My first prototype failed but I learned a lot about engineering and teamwork."',
            strong: 'Revised version: "The first chassis cracked at the motor mount on day two because I sized members by appearance, not load. Rebuilding with moment calculations in hand, the second frame survived full testing — and I now compute loads before cutting anything."',
            why: 'Revision targeted evidence (day two, motor mount) and analysis (appearance vs calculation, new rule). Same author, same story, two levels apart.',
          },
          {
            weak: 'First version (typical): "Our filter did not work well at first."',
            strong: 'Revised version: "Mesh-only flow stalled at 0.3 L/min by minute four; the pressure log blamed surface blinding, so a gravel pre-stage went in. Flow held 1.1 L/min for ten minutes — and I now log pressure before changing anything else."',
            why: 'Numbers, a named culprit, a fix, and a logging habit. "Not well" became a diagnosis with a procedure attached.',
          },
        ],
        widget: 'master_challenge',
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which sentence is doing ANALYSIS rather than explanation?',
        payload: {
          options: [
            'Flow held at 1.1 L/min across all six trials.',
            'Coarse gravel resists surface sealing because large pores pass water while catching leaves.',
            'Therefore, size pre-filters by debris type first — a rule any team fighting early clogging can copy.',
          ],
          correct: 2,
          explanation: 'Correct. The first reports data, the second explains mechanism, the third concludes a reusable rule — analysis hands the lesson onward.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'surgery', difficulty: 'medium', points: 3,
        prompt: 'Answer Surgery: repair this draft one move at a time — "Our team communicated well during the project."',
        payload: {
          weak: 'Our team communicated well during the project.',
          steps: [
            { label: 'Add EVIDENCE', prompt: 'Write one specific, observable communication event (when, what happened).', hint: 'Name a meeting, a message, a conflict — something checkable.', keywords: ['when', 'week', 'day', 'meeting', 'message', 'check', 'standup', 'update', 'conflict', 'missed', 'morning'], threshold: 0.3, sample: 'In week four the sensor and housing sub-teams built conflicting mounts because neither posted updates. We settled it in a morning meeting that reset ownership.' },
            { label: 'Add EXPLANATION', prompt: 'Explain WHY your evidence mattered — the cause or mechanism.', hint: 'Use because/so/therefore with a real reason.', keywords: ['because', 'therefore', 'so', 'since', 'meant', 'caused', 'led'], threshold: 0.25, sample: 'Silence was expensive because conflicts surfaced only at integration. This meant silence cost us a full week of rework.' },
            { label: 'Add ANALYSIS', prompt: 'State the lesson and what you do differently now.', hint: 'A rule another team could copy.', keywords: ['learned', 'now', 'rule', 'always', 'every', 'next', 'change', 'realized'], threshold: 0.3, sample: 'I learned communication means making work visible, so I now open every shared task with a visible owner and date.' },
          ],
          closing: 'Assembled: event → mechanism → portable rule. That assembly is a BLUE paragraph.',
          explanation: 'Each graft adds one labeled move. A complete repair carries a checkable event, a real because-sentence, and a reusable rule.',
        },
      },
      {
        lesson: 2, quiz: false, kind: 'surgery', difficulty: 'hard', points: 3,
        prompt: 'Answer Surgery: repair this draft — "The results were good and proved our idea."',
        payload: {
          weak: 'The results were good and proved our idea.',
          steps: [
            { label: 'Add EVIDENCE', prompt: 'Replace "good" with measured results.', hint: 'Numbers, counts, durations, comparisons.', keywords: ['trial', 'measured', 'flow', 'rate', 'minute', 'percent', '%', 'compared', 'versus', 'recorded', 'data'], threshold: 0.3, sample: 'Flow held at 1.1 L/min across six ten-minute trials versus 0.4 with mesh alone.' },
            { label: 'Add PRECISION', prompt: 'Scope the claim: conditions, limits, comparisons.', hint: 'Where, how long, versus what.', keywords: ['classroom', 'condition', 'trial', 'versus', 'compared', 'within', 'across', 'specific'], threshold: 0.25, sample: 'Within classroom conditions and ten-minute windows — longer field runs still untested.' },
            { label: 'Add ANALYSIS', prompt: 'Conclude only what the evidence lifts, and say who can reuse it.', hint: 'A bounded rule for the next team.', keywords: ['rule', 'reuse', 'next', 'therefore', 'means', 'learned', 'teams', 'should'], threshold: 0.25, sample: 'Therefore staged pre-filtration is worth testing wherever early clogging appears. This rule means teams can reuse the benchmark on their next build.' },
          ],
          closing: '"Proved" retired; bounded, reusable conclusions hired in its place.',
          explanation: 'Good repair replaces adjectives with measurements, scopes with conditions, and slogans with reusable rules.',
        },
      },
      {
        lesson: 3, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'A GREEN draft needs which grafts to reach BLUE?',
        payload: {
          options: [
            'A full rewrite in longer sentences with advanced vocabulary.',
            'Targeted grafts: one analysis sentence (reusable rule) plus precision swaps (numbers for adjectives), keeping most text.',
            'Deleting everything and starting over with a new topic.',
          ],
          correct: 1,
          explanation: 'Correct. Surgeons graft; they do not transplant. Two precise additions beat a full rewrite.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'What distinguishes a BLUE answer from a GREEN one?',
        payload: {
          options: [
            'Length: BLUE answers exceed 250 words.',
            'Reusable insight: analysis and judgment another team could apply, built on specific evidence.',
            'Vocabulary: BLUE requires advanced academic terms throughout.',
          ],
          correct: 1,
          explanation: 'Correct. Transferable insight on top of evidence is the BLUE band. Length and vocabulary never defined it.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'A master-level revision must show which of these? Select ALL that apply.',
        payload: {
          options: ['Added checkable evidence', 'Causal explanation (because-family)', 'Transferable lesson or rule', 'Longer synonyms', 'Scoped claims matching data'],
          correct: [0, 1, 2, 4],
          explanation: 'Correct. Evidence, cause, lesson, scope. Longer synonyms are decoration, not revision.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'hard', points: 2,
        prompt: 'Identify the BLUE paragraph.',
        payload: {
          options: [
            'A: "The utilization of multifaceted methodologies facilitated optimal outcomes across diverse parameters."',
            'B: "The 5 mm gravel stage held flow above 1.0 L/min for ten minutes in all six trials, double the mesh baseline, because coarse media resists surface sealing — so size pre-filters by debris type first."',
          ],
          correct: 1,
          explanation: 'Correct. B carries numbers, mechanism, and a reusable rule in plain words. A is fog with extra steps.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'hard', points: 3,
        prompt: 'Upgrade this RED sentence toward BLUE in 2–3 sentences: "The experiment failed."',
        payload: {
          keywords: ['because', 'when', 'trial', 'found', 'measured', 'changed', 'learned', 'now', 'result', 'test'],
          threshold: 0.35,
          sample: 'Trial two failed at minute four when flow stalled — mesh clogged because fine sand blinds the surface. Switching to gravel held full flow, teaching me to match media to debris before blaming the pump.',
          explanation: 'Upgrade needs cause, checkable detail, and a lesson. Compare: does yours name what happened, why, and what changed?',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: a BLUE answer can use short, plain sentences.',
        payload: {
          correct: true,
          explanation: 'True. Weight per word decides levels, not sentence length. Plain sentences carrying evidence beat foggy ones every time.',
        },
      },
    ],
    tricks: [
      { title: 'Label before you fix', body: 'Mark every sentence CLAIM/EVIDENCE/EXPLANATION/ANALYSIS. Repair only unlabeled gaps.' },
      { title: 'Two-graft rule', body: 'GREEN→BLUE needs one analysis sentence plus one precision swap. Stop there and re-check.' },
      { title: '30% limit', body: 'If your edit rewrote more than a third of the words, you rewrote. Graft smaller.' },
      { title: 'Stranger test, final form', body: 'Read the revised draft as a rival team hunting flaws. Surviving that reading is BLUE.' },
    ],
    mistakes: [
      { title: 'Polish instead of repair', body: 'New adjectives on old claims. Levels never move on vocabulary alone.' },
      { title: 'Analysis-shaped fog', body: '"This shows deep insights into multifaceted dynamics" — analysis claimed, none delivered.' },
      { title: 'Rewriting everything', body: 'Full rewrites lose the good evidence the draft already had. Graft, do not transplant.' },
      { title: 'Unscoped triumph', body: 'Lab-bench evidence concluding for entire industries. Scope or sink.' },
    ],
  },
];
