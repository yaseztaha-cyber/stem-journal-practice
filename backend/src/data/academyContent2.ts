import { AcademyUnitSeed } from './academyTypes';

// Units 6-10: BLUE method, language, synthesis, teamwork, EDP writing
export const ACADEMY_PART2: AcademyUnitSeed[] = [
  {
    slug: 'blue-method',
    unit_number: 6,
    title: 'The BLUE Method',
    description: 'A practical 10-point quality checklist (not rubric tricks): coverage, evidence, reasoning, and insight — plus the BLUE flow visual.',
    est_minutes: 35,
    video: {
      title: 'Unit 6 — The BLUE Method',
      description: 'The ten checks behind every BLUE answer, the QUESTION → INSIGHT flow, and why checklists beat talent.',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 264,
      transcript:
        'In this unit you will learn the BLUE Method: ten checks that catch nearly every lost level.\n' +
        'This matters because most YELLOW answers fail only two or three checks. Fix the checks, keep your ideas, and the level follows.\n' +
        'You will use this checklist before every journal submission from now on — it is also built into the writing screen.\n' +
        'The mistake to avoid: treating this as tricks to game the rubric. Every check asks for genuine quality: real evidence, real reasoning, real reflection.\n' +
        'After this unit you will run any draft through ten yes/no questions and know exactly what to fix.',
    },
    lessons: [
      {
        title: 'The ten BLUE checks',
        objective: 'Apply the ten-point checklist to a draft and name what fails.',
        body_md:
          '1. Did I answer every part of the question? 2. Did I give specific evidence? 3. Did I explain WHY? 4. Did I explain HOW? 5. Did I connect the answer to my actual Capstone?\n\n' +
          '6. Did I show what I learned? 7. Did I explain what changed? 8. Did I avoid unsupported general statements? 9. Did I include enough detail? 10. Would someone else understand my reasoning?\n\n' +
          'Run them in order on every draft. Most drafts fail checks 2, 3, and 7 — evidence, why, and change. Those three fixes alone lift most YELLOW answers to GREEN, and many GREEN answers to BLUE.',
        examples: [
          {
            weak: 'Draft passes checks 1 and 5 only: on-topic and project-linked, but with no evidence, no why, no lesson, no change.',
            strong: 'Same ideas rewritten to pass all ten: two parts covered, one measured event, a because-sentence, the mechanism, the project link, the lesson, the behavior change, zero slogans, enough detail, clear reasoning.',
            why: 'The checklist turns vague anxiety ("is this good?") into ten concrete repairs. Ideas rarely need replacing — evidence and reasoning need adding.',
          },
        ],
      },
      {
        title: 'The BLUE flow: question to insight',
        objective: 'Trace how raw material becomes insight through the six-stage flow.',
        body_md:
          'QUESTION → ANSWER → EVIDENCE → EXPLANATION → REFLECTION → INSIGHT. The answer states your position. Evidence makes it checkable. Explanation gives causes and mechanisms.\n\n' +
          'Reflection extracts what the experience taught. Insight states something another team could reuse — a rule, a warning, a method.\n\n' +
          'Do not memorize the diagram; learn the thinking. When a draft feels stuck, ask which stage you are at and push one stage further. Insight is simply reflection written so someone else benefits.',
        examples: [
          {
            weak: 'Stops at ANSWER: "Daily standups improved our teamwork." Nothing checkable follows.',
            strong: 'Full flow: standups adopted (answer) → blocking conflicts fell from three to zero in a week (evidence) → because problems surfaced while still cheap to fix (explanation) → visibility beats intentions (reflection) → "make every shared task visible within 24 hours" (insight another team can copy).',
            why: 'Each stage adds one verifiable thing. The final insight is the payoff graders reward with BLUE: judgment useful to others.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'A draft answers every part with clear reasoning but zero specific evidence. Which checks fail, and what is the cheapest fix?',
        payload: {
          options: [
            'Checks 2 and 9 fail; add one measured, observable event.',
            'Check 10 fails; rewrite everything in longer sentences.',
            'Check 1 fails; answer a different question instead.',
          ],
          correct: 0,
          explanation: 'Correct. Evidence (2) and detail (9) are the gaps. One checkable event — a number, a date, an observation — repairs both at once.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'compare_levels', difficulty: 'medium', points: 2,
        prompt: 'Three answers to "Describe a problem your team solved." Compare them, then select ALL factors that make the strong one stronger.',
        payload: {
          weak: 'We had a big problem with our design but we worked hard and fixed it. Teamwork helped us a lot.',
          medium: 'Our sensor mount kept breaking during vibration tests. We redesigned it twice and the third version held.',
          strong: 'Our sensor mount cracked in all three vibration trials because the bracket resonated at the motor frequency. We added a rubber damper and moved the mount off the motor axis; the next five trials passed with zero cracks. I learned to check resonance before blaming materials — now I run a tap-test on every bracket first.',
          options: [
            'Specific, checkable evidence (trial counts, defect counts)',
            'Longer vocabulary and more adjectives',
            'Causal explanation (resonance mechanism)',
            'A transferable lesson plus verified changed behavior',
            'Mentioning teamwork repeatedly',
          ],
          correct: [0, 2, 3],
          explanation: 'Correct. Evidence, causal mechanism, and verified lesson separate the levels. Word length and teamwork mentions add nothing checkable.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'order_steps', difficulty: 'medium', points: 2,
        prompt: 'Order the BLUE flow correctly.',
        payload: {
          steps: ['QUESTION: know exactly what is asked', 'ANSWER: state your position', 'EVIDENCE: make it checkable', 'EXPLANATION: give causes and mechanisms', 'REFLECTION: extract the lesson', 'INSIGHT: state what others can reuse'],
          explanation: 'Correct. Each stage feeds the next: position → proof → reasoning → lesson → transferable insight.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which are legitimate BLUE checks? Select ALL that apply.',
        payload: {
          options: [
            'Every part of the question answered',
            'Specific evidence present',
            'Hidden keywords inserted for the grader',
            'What changed is shown',
            'Complicated synonyms used throughout',
            'Reasoning a stranger could follow',
          ],
          correct: [0, 1, 3, 5],
          explanation: 'Correct. Coverage, evidence, change, and clear reasoning are quality. Keyword tricks and fancy synonyms are gaming, not skill.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 2,
        prompt: 'Why does the BLUE Method insist it is NOT about tricks?',
        payload: {
          options: [
            'Because tricks are hard to remember under time pressure.',
            'Because every check demands genuine quality — real evidence, reasoning, and reflection cannot be faked by formatting.',
            'Because graders punish checklists.',
          ],
          correct: 1,
          explanation: 'Correct. The checks work precisely because they ask for substance. A trick that adds no evidence or reasoning adds no level.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'hard', points: 3,
        prompt: 'Run checks 2, 3, and 7 on this draft and rewrite it: "Testing taught me a lot about patience."',
        payload: {
          keywords: ['because', 'when', 'trial', 'test', 'found', 'measured', 'changed', 'now', 'learned', 'result', 'week', 'fixed'],
          threshold: 0.35,
          sample: 'Testing taught me patience because trial four failed the same way as trial two, and I finally logged every variable instead of guessing. That log showed the humidity spike I had ignored. Now I record conditions before theorizing — patience turned out to be a procedure, not a feeling.',
          explanation: 'Check 2 (evidence): a logged detail. Check 3 (why): the because-sentence. Check 7 (change): a new procedure. All three must appear.',
        },
      },
    ],
    tricks: [
      { title: 'Fix 2-3-7 first', body: 'Evidence, WHY, and change. These three checks repair most YELLOW drafts by themselves.' },
      { title: 'One stage further', body: 'Stuck? Name your current flow stage and push exactly one stage deeper.' },
      { title: 'Stranger test', body: 'Hand your draft to an imaginary stranger. Every sentence they cannot follow is check 10 failing.' },
    ],
    mistakes: [
      { title: 'Checklist theater', body: 'Ticking boxes mentally without changing text. Each check must produce an edit.' },
      { title: 'Memorizing the diagram', body: 'Reciting QUESTION → INSIGHT earns nothing. Thinking through it earns levels.' },
      { title: 'Polishing before proving', body: 'Fixing wording while evidence is missing. Substance first, style second.' },
    ],
  },
  {
    slug: 'academic-language',
    unit_number: 7,
    title: 'Academic Language Without Overcomplicating',
    description: 'Clear, precise, controlled English: precise verbs, clean transitions, zero slang — and why "used" beats "utilized the implementation of".',
    est_minutes: 30,
    video: {
      title: 'Unit 7 — Sound Smart by Being Clear',
      description: 'A rapid tour of academic style — clear, succinct, formal, objective, precise, tentative, and critical — with concrete before-and-after examples. (Video: Skills for Academic Success)',
      video_url: 'https://www.youtube.com/watch?v=-Cas_MurH3M',
      thumbnail_url: 'https://i.ytimg.com/vi/-Cas_MurH3M/hqdefault.jpg',
      duration_seconds: 210,
      transcript: '',
    },
    lessons: [
      {
        title: 'Precision: exact words, honest weight',
        objective: 'Replace vague and inflated wording with precise equivalents.',
        body_md:
          'Academic tone is clear, precise, controlled, and logical — never artificially complicated. "Used" beats "utilized the implementation of." "Found" beats "it was discovered by us that."\n\n' +
          'Kill vague nouns: thing, stuff, problems, aspects, factors (unless you name them). Kill empty intensifiers: very, extremely, highly, a lot. Each deleted decoration forces a real detail to take its place.\n\n' +
          'Choose verbs that carry meaning: measured (not "did measurements on"), reduced (not "made a reduction in"), decided (not "made a decision regarding"). One precise verb replaces five foggy words.',
        examples: [
          {
            weak: 'We utilized the implementation of various different methodologies in order to facilitate an improvement in the overall functionality of the system.',
            strong: 'We tested three mounting methods and kept the one that cut vibration failures from five per trial to zero.',
            why: 'Same idea, one-third the words, infinitely more checkable. Precision is not style — it is evidence made readable.',
          },
        ],
      },
      {
        title: 'Transitions that show reasoning',
        objective: 'Use transitions to signal cause, contrast, and conclusion.',
        body_md:
          'Weak transitions stack facts: "and then… and then… also…" Strong transitions show relationships: because, therefore, however, although, as a result, in contrast, for example.\n\n' +
          'Rule: every because must be followed by a real cause; every however must be followed by a real contrast. Fake transitions ("therefore" with no logic behind it) are worse than none — graders notice.\n\n' +
          'Keep English natural. You are an Egyptian STEM student writing clearly, not imitating a thesaurus. Short sentences are academic whenever each one carries weight.',
        examples: [
          {
            weak: 'We changed the filter. Therefore the project was successful. Moreover, teamwork is important.',
            strong: 'We changed the filter from mesh to gravel. As a result, flow held above 1.0 L/min for all ten minutes. However, maintenance doubled, so we added a quick-rinse step to the protocol.',
            why: 'Each transition earns its place: result follows with a measurement, contrast follows with a real tradeoff and its fix.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Choose the most academic version.',
        payload: {
          options: [
            'We utilized the implementation of a broad range of strategic paradigms.',
            'We compared three designs and selected the cheapest one that met the load requirement.',
            'It goes without saying that our methodology was, in a manner of speaking, quite good.',
          ],
          correct: 1,
          explanation: 'Correct. Precise verbs, named actions, a checkable criterion. The others are fog — long words hiding missing content.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: '"We added insulation. Therefore the box stayed warmer." What makes "therefore" legitimate here?',
        payload: {
          options: [
            'It is a long academic word, which always helps.',
            'A real cause-and-effect link backs it — insulation physically slows heat loss.',
            'It appears at the start of the sentence.',
          ],
          correct: 1,
          explanation: 'Correct. Transitions are legitimate only when the logic behind them is real. "Therefore" must point at an actual cause.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which edits genuinely improve academic tone? Select ALL that apply.',
        payload: {
          options: [
            'Replace "utilized" with "used"',
            'Replace "a lot of problems" with the named problems',
            'Add "moreover" between every sentence',
            'Replace "made a reduction in" with "reduced"',
            'Replace short words with the longest synonym available',
          ],
          correct: [0, 1, 3],
          explanation: 'Correct. Precision and named details improve tone. Decorative transitions and long synonyms add fog, not scholarship.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 2,
        prompt: 'Which sentence is academic without being artificial?',
        payload: {
          options: [
            'The aforementioned aqueous filtration apparatus exhibited suboptimal throughput characteristics.',
            'The filter clogged after four minutes because fine sand blocked the mesh.',
            'In this essay I will talk about filters and stuff like that.',
          ],
          correct: 1,
          explanation: 'Correct. Plain words, exact cause, checkable detail. The first is artificial fog; the third is casual.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: short sentences are never academic.',
        payload: {
          correct: false,
          explanation: 'False. A short sentence carrying a precise fact beats a long sentence carrying fog. Weight per word is what counts.',
        },
      },
    ],
    tricks: [
      { title: 'Verb diet', body: 'Search your draft for made/did/got/utilized. Each one is hiding a precise verb.' },
      { title: 'Fog test', body: 'Cover the adjectives. If the sentence still proves its point, keep it; if it collapses, it was fog.' },
      { title: 'Transition audit', body: 'Circle every because/therefore/however. Verify each one points at real logic.' },
    ],
    mistakes: [
      { title: 'Thesaurus writing', body: 'Long synonyms for short words signal insecurity and often misuse the word.' },
      { title: 'Stacking transitions', body: '"Moreover, furthermore, in addition" in one paragraph adds zero reasoning.' },
      { title: 'Hedging everything', body: '"Kind of", "sort of", "maybe" drain the confidence your evidence earned.' },
    ],
  },
  {
    slug: 'synthesis-transfer',
    unit_number: 8,
    title: 'Synthesis & Learning Transfer',
    description: 'Combine concepts into decisions: CONCEPT → PROJECT → DECISION → RESULT → INSIGHT, and nail Learning Transfer answers.',
    est_minutes: 40,
    video: {
      title: 'Unit 8 — Connect Knowledge to Decisions',
      description: 'Going beyond summary: the five questions that turn a pile of sources into a synthesis — agreements, disagreements, theories, contexts, and methods. (Video: Grad Coach)',
      video_url: 'https://www.youtube.com/watch?v=qod1J5xSd5s',
      thumbnail_url: 'https://i.ytimg.com/vi/qod1J5xSd5s/hqdefault.jpg',
      duration_seconds: 258,
      transcript: '',
    },
    lessons: [
      {
        title: 'Summarizing lists; synthesizing connects',
        objective: 'Distinguish summaries from syntheses and explain the difference.',
        body_md:
          'Summary: "We learned about forces, circuits, and pH." Three islands, no bridges. Synthesis: "Force analysis showed the bracket would fail at the motor mount, so we moved it — and the pH readings from chemistry told us the runoff was safe to discharge."\n\n' +
          'The test: does removing one piece of knowledge break the explanation? If yes, the pieces are genuinely connected. If each sentence survives alone, you listed.\n\n' +
          'Synthesis verbs help: led to, forced, revealed, combined with, changed. "And then" verbs hurt: listing disguised as connecting.',
        examples: [
          {
            weak: 'We learned about forces. We also learned about circuits. Both subjects were useful for our project.',
            strong:
              'Understanding force distribution helped us reconsider the support structure of our prototype because the load analysis showed 70% of stress concentrated at one joint. That pushed us to reinforce that joint instead of thickening the whole frame, saving 220 grams — nearly a tenth of our weight budget.',
            why: 'Concept (force distribution) → project (support structure) → decision (reinforce one joint) → result (220 g saved). Remove any link and the reasoning collapses — proof of genuine connection.',
          },
        ],
      },
      {
        title: 'The transfer chain in journal answers',
        objective: 'Build CONCEPT → PROJECT → DECISION → RESULT → INSIGHT for your own subject.',
        body_md:
          'CONCEPT: name the specific idea, not the subject ("torque limits on small servos", not "physics"). PROJECT: state where it applied — which part, which stage.\n\n' +
          'DECISION: what you chose because of it — the visible fork in the road. RESULT: what happened, measured if possible. INSIGHT: the rule you now carry to similar problems.\n\n' +
          'Graders reward the decision most: it is the one link that cannot exist without real understanding. No changed decision, no transfer — only a summary wearing a costume.',
        examples: [
          {
            weak: 'Chemistry helped our water project because water chemistry is important for filtration.',
            strong:
              'Solubility rules told us calcium carbonate would precipitate above pH 8, which explained the white crust choking our second filter stage. We capped the buffer at pH 7.4, scaling stopped, and flow stayed stable for all six trials. I now check precipitation thresholds before choosing any treatment chemistry.',
            why: 'A named rule caused a specific setting change with a measured outcome. "Chemistry is important" claims transfer; this demonstrates it.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which shows synthesis rather than summary?',
        payload: {
          options: [
            '"We studied levers, pulleys, and gears this semester."',
            '"Torque calculations showed our arm would stall, so we halved the arm length and the lift succeeded on the first retest."',
            '"Physics is very useful for engineering projects."',
          ],
          correct: 1,
          explanation: 'Correct. Knowledge visibly changes a decision with a result. The others list topics or praise the subject without connecting anything.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'In the transfer chain, which link proves understanding most strongly?',
        payload: {
          options: [
            'Naming the concept, because vocabulary shows study.',
            'The decision, because a real choice cannot be made without understanding the concept.',
            'The insight, because it sounds impressive.',
          ],
          correct: 1,
          explanation: 'Correct. Decisions are unfakeable: you cannot choose correctly from knowledge you do not grasp. Vocabulary and impressive closings can both be hollow.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'order_steps', difficulty: 'medium', points: 2,
        prompt: 'Order the transfer chain.',
        payload: {
          steps: ['CONCEPT: name the specific idea', 'PROJECT: state where it applied', 'DECISION: choose because of it', 'RESULT: report what happened', 'INSIGHT: keep the rule'],
          explanation: 'Correct. Idea → application → choice → outcome → portable rule. Break any link and transfer collapses into summary.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which verbs signal real synthesis? Select ALL that apply.',
        payload: {
          options: ['led to', 'forced us to', 'revealed', 'and then', 'also', 'changed our'],
          correct: [0, 1, 2, 5],
          explanation: 'Correct. Causal verbs (led to, forced, revealed, changed) show connection. Sequencing words (and then, also) merely list.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'hard', points: 3,
        prompt: 'Turn this summary into synthesis in 3–4 sentences: "We learned about insulation in physics."',
        payload: {
          keywords: ['because', 'decided', 'chose', 'changed', 'result', 'measured', 'led', 'saved', 'reduced', 'showed'],
          threshold: 0.35,
          sample: 'Heat-transfer calculations showed our box lost most energy through the lid, so we doubled lid insulation instead of thickening all walls. Drying time fell from six hours to four, which taught me to insulate the dominant loss path first.',
          explanation: 'Synthesis needs a decision caused by the concept plus a result. Check yours: concept named, choice made, outcome reported.',
        },
      },
    ],
    tricks: [
      { title: 'The removal test', body: 'Delete one knowledge-link. If the explanation still stands, the pieces were never connected.' },
      { title: 'Hunt the decision', body: 'No changed decision = no transfer. Find the fork in the road first, then write.' },
      { title: 'Name ideas, not subjects', body: '"Torque limits" transfers. "Physics" does not.' },
    ],
    mistakes: [
      { title: 'Subject roll-call', body: 'Listing learned topics proves attendance, not transfer.' },
      { title: 'Praise instead of proof', body: '"Chemistry was very helpful" without a decision it caused.' },
      { title: 'Orphan insight', body: 'A grand lesson with no chain behind it reads as invented.' },
    ],
  },
  {
    slug: 'teamwork-writing',
    unit_number: 9,
    title: 'Team Collaboration Writing',
    description: 'Answer teamwork questions with role, situation, conflict, resolution, and learning — never "we worked together."',
    est_minutes: 35,
    video: {
      title: 'Unit 9 — Write Teamwork That Counts',
      description: 'Belbin\'s nine team roles across social, thinking, and action clusters — a practical language for naming your own contribution and understanding teammates. (Video: Mindtools)',
      video_url: 'https://www.youtube.com/watch?v=7LunroajlLE',
      thumbnail_url: 'https://i.ytimg.com/vi/7LunroajlLE/hqdefault.jpg',
      duration_seconds: 234,
      transcript: '',
    },
    lessons: [
      {
        title: 'Your role, made visible',
        objective: 'State a specific individual role with responsibilities and evidence.',
        body_md:
          'Graders ask: what did THIS student do? "I was the testing lead: I owned the test schedule, ran trials three through six, and logged every result" beats "I helped with testing."\n\n' +
          'Cover the seven teamwork questions: WHAT WAS THE SITUATION? WHAT WAS MY ROLE? WHAT DID I DO? WHAT DID THE TEAM DO? WHAT PROBLEM OCCURRED? HOW WAS IT RESOLVED? WHAT DID I LEARN?\n\n' +
          'Separate your actions from the team\u2019s. "We decided" hides you; "I proposed X, the team adopted it because Y" shows you inside the team.',
        examples: [
          {
            weak: 'We worked together well. Everyone did their part and we finished on time.',
            strong:
              'As testing lead during the two-week crunch, I split twelve trials across three owners with a visible checklist after we missed the first deadline. When the sensor owner fell behind, I re-ran his two simplest trials while he debugged, and we finished on schedule. I learned leadership here meant absorbing variance, not assigning blame.',
            why: 'Role named, situation dated, problem concrete, personal action separated from team action, lesson stated. The weak version could describe any team on Earth.',
          },
        ],
      },
      {
        title: 'Writing conflict and failure fairly',
        objective: 'Describe disagreement and failure focusing on process, not people.',
        body_md:
          'Describe the conflict as a process problem: "two valid designs with no decision rule" — not "Ahmed was stubborn." Then show YOUR resolution move: the criterion you proposed, the compromise you built, the test you ran.\n\n' +
          'For failure: name your share honestly ("my schedule had no buffers"), show the fix, show the result. Graders reward owned failure over hidden failure every time.\n\n' +
          'End with adaptation: what you do differently in teams now. A conflict story without a changed approach is gossip; with one, it is growth.',
        examples: [
          {
            weak: 'We disagreed a lot but eventually we agreed and moved on. It taught me patience.',
            strong:
              'Our housing and electronics sub-teams deadlocked over connector placement for five days — each optimizing their own board. I proposed deciding by assembly time, we timed both layouts, and the faster one won in an afternoon. I now force interface decisions through timed trials instead of debate.',
            why: 'No villains, no vague patience: a named deadlock, a decision rule, a timed test, and a portable method. Fair to the team, revealing about the writer.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which sentence shows YOUR role?',
        payload: {
          options: [
            'We completed all the tests successfully.',
            'I owned the test log: I recorded all eighteen runs and flagged the three anomalies we investigated.',
            'Our team is very cooperative and hardworking.',
          ],
          correct: 1,
          explanation: 'Correct. Named responsibility plus verifiable output. "We" sentences hide the individual the rubric is grading.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'How should you write about a teammate conflict?',
        payload: {
          options: [
            'Name who was wrong so the grader sees your judgment.',
            'Describe it as a process problem and show your resolution move.',
            'Skip it — graders only want positive stories.',
          ],
          correct: 1,
          explanation: 'Correct. Process framing plus your resolution shows maturity. Blame shows the opposite; hiding it wastes your best growth material.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'A complete teamwork answer needs which elements? Select ALL that apply.',
        payload: {
          options: ['Specific situation', 'Your individual role and actions', 'The problem that occurred', 'How it was resolved', 'What you learned', 'Praise for the school'],
          correct: [0, 1, 2, 3, 4],
          explanation: 'Correct. Situation, role, problem, resolution, lesson — the five load-bearing elements. Institutional praise carries no weight.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Identify the stronger teamwork paragraph.',
        payload: {
          options: [
            'A: "I am a natural leader, so I guided my team to success through motivation and dedication."',
            'B: "When two members stopped attending reviews, I moved reviews to the lab right after school and cut them to fifteen minutes. Attendance recovered fully, and I learned participation follows convenience more than commitment."',
          ],
          correct: 1,
          explanation: 'Correct. B shows a real problem, a concrete intervention, and a measured recovery. A claims a trait with zero evidence.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: admitting your share of a failure weakens a teamwork answer.',
        payload: {
          correct: false,
          explanation: 'False. Owned failure plus fix plus result is among the strongest teamwork evidence. Hidden failure reads as no reflection.',
        },
      },
    ],
    tricks: [
      { title: 'I vs We audit', body: 'Highlight every "I" action. Fewer than three means you hid inside the team.' },
      { title: 'Process, not people', body: 'Rewrite any sentence blaming a teammate as a sentence about a broken process.' },
      { title: 'Variance rule', body: 'Leadership = absorbing variance. Show one thing you absorbed and what it cost you.' },
    ],
    mistakes: [
      { title: '"We worked together"', body: 'The emptiest teamwork sentence. Replace with role + action + result.' },
      { title: 'Trait claiming', body: '"I am a leader" without an intervention, a problem, and an outcome.' },
      { title: 'Blame diaries', body: 'Pages about teammates\u2019 faults with no word on your own moves.' },
    ],
  },
  {
    slug: 'edp-writing',
    unit_number: 10,
    title: 'Engineering Design Process Writing',
    description: 'Reflect on EDP stages with evidence, iteration logic, and value judgment other teams can reuse.',
    est_minutes: 40,
    video: {
      title: 'Unit 10 — Write the Process, Not Just the Product',
      description: 'Define, imagine, evaluate, create, test — the engineering design process in about three minutes, with emphasis on iteration and non-linear problem solving. (Video: Paxton Patterson)',
      video_url: 'https://www.youtube.com/watch?v=KpWrHVo972g',
      thumbnail_url: 'https://i.ytimg.com/vi/KpWrHVo972g/hqdefault.jpg',
      duration_seconds: 270,
      transcript: '',
    },
    lessons: [
      {
        title: 'Reflecting on a stage: the eight questions',
        objective: 'Interrogate any EDP stage with the eight reflection questions.',
        body_md:
          'Pick one stage — say, testing. Ask: WHAT DID WE TRY? WHY DID WE TRY IT? WHAT HAPPENED? WHAT DID THE EVIDENCE SHOW? WHAT DID WE CHANGE? WHY DID WE CHANGE IT? WHAT DID WE LEARN? HOW COULD SOMEONE ELSE LEARN FROM THIS?\n\n' +
          'The first four are description and evidence; the last four are reflection and judgment. Most students stop at four — exactly where the levels stop rising.\n\n' +
          'One stage done deeply beats five stages listed. Depth in testing with numbers and a changed protocol outweighs a tour of the whole process.',
        examples: [
          {
            weak: 'In the testing stage we built the prototype and tested it. The results were good and we moved to the final design.',
            strong:
              'In testing we tried full-device retests after every fix — and trial four cost us six hours for a one-line gasket change. The evidence (time logs across five trials) showed retest cost scaled with device size, not fix size. We switched to isolated retests of changed parts only, cutting average retest time to ninety minutes. Any team retesting full assemblies should isolate first: the rule generalizes beyond our device.',
            why: 'All eight questions answered, with the final one — usefulness to others — stated as a general rule. The weak version answers none beyond "we tested."',
          },
        ],
      },
      {
        title: 'Iteration logic and value judgment',
        objective: 'Explain WHY an iteration happened and judge what it was worth.',
        body_md:
          'Iteration is not "we tried again." It is: evidence → diagnosis → change → verification. Write all four links or the iteration reads as luck.\n\n' +
          'Value judgment means saying what something was worth: "The dye test cost twenty minutes and caught two seal failures — the highest value-per-minute step in our plan." Compare options, name tradeoffs, recommend.\n\n' +
          'Close with reuse: who faces a similar choice, and what should they do? That sentence is the EDP rubric\u2019s top band in plain form.',
        examples: [
          {
            weak: 'We improved the design several times until it worked well.',
            strong:
              'Three iterations, three diagnoses: trial one failed on sealing (fixed with a gasket), trial two on flow (fixed with gravel pre-filter), trial three passed fully. The pattern taught us failures migrate downstream as each bottleneck clears — so we now test end-to-end after every single fix, not just the changed part.',
            why: 'Each iteration carries diagnosis and fix; the pattern across them becomes a reusable testing principle. "Several times until it worked" carries nothing.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which question belongs to reflection rather than description?',
        payload: {
          options: [
            'WHAT DID WE TRY?',
            'WHAT HAPPENED?',
            'HOW COULD SOMEONE ELSE LEARN FROM THIS?',
          ],
          correct: 2,
          explanation: 'Correct. The first two record events; the third demands judgment valuable beyond your project — the top of the EDP band.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'short_answer', difficulty: 'medium', points: 2,
        prompt: 'Write the iteration logic (evidence → diagnosis → change → verification) for a failed test you ran, in 2–4 sentences.',
        payload: {
          keywords: ['because', 'showed', 'found', 'changed', 'retest', 'trial', 'result', 'evidence', 'fixed', 'verified'],
          threshold: 0.4,
          sample: 'Trial two clogged at minute four (evidence), which pointed at fine sand, not pump power (diagnosis). We swapped in a gravel pre-filter (change) and flow held for the full ten minutes across three trials (verification).',
          explanation: 'All four links must appear: what you saw, what you concluded, what you changed, and the proof it worked.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which elements make EDP writing reach the top band? Select ALL that apply.',
        payload: {
          options: [
            'Evidence from tests with numbers',
            'Reasons for each change',
            'Judgment about what was worth the effort',
            'A rule other teams could reuse',
            'A list of all stages visited',
          ],
          correct: [0, 1, 2, 3],
          explanation: 'Correct. Evidence, reasons, value judgment, and reusability are the band. A stage list is a table of contents, not reflection.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: '"We built the prototype." Why does this sentence earn almost nothing?',
        payload: {
          options: [
            'It is too short; EDP answers must be long.',
            'It states existence, not reasoning — no attempt rationale, evidence, change, lesson, or reusable judgment.',
            'It uses the wrong tense for academic writing.',
          ],
          correct: 1,
          explanation: 'Correct. Graders reward reasoning about the work, not the work\u2019s existence. Length and tense are irrelevant.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: covering one EDP stage deeply is better than listing all stages shallowly.',
        payload: {
          correct: true,
          explanation: 'True. Depth with evidence and judgment outranks breadth every time. One stage, eight questions, full marks potential.',
        },
      },
    ],
    tricks: [
      { title: 'Eight-question drill', body: 'Pick your most important stage and answer all eight. That is your EDP paragraph.' },
      { title: 'Worth-it sentence', body: 'End every method discussion with what it cost versus what it caught.' },
      { title: 'Steal-this-rule', body: 'If no sentence in your answer helps another team, you have not reached judgment yet.' },
    ],
    mistakes: [
      { title: 'Existence reporting', body: '"We built/tested/designed X" with no reasoning attached.' },
      { title: 'Luck narratives', body: '"We tried again and it worked" — no diagnosis, no verification.' },
      { title: 'Stage tourism', body: 'Ten stages named, zero stages understood.' },
    ],
  },
];
