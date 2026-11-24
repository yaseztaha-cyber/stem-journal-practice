import { AcademyUnitSeed } from './academyTypes';

// Units 1-5: foundations (answer quality, questions, paragraphs, evidence, reflection)
export const ACADEMY_PART1: AcademyUnitSeed[] = [
  {
    slug: 'strong-academic-answer',
    unit_number: 1,
    title: 'What Is a Strong Academic Answer?',
    description: 'Learn what academic writing really is, how the BLUE/GREEN/YELLOW/RED rubric works, and why specific, well-reasoned answers win.',
    est_minutes: 35,
    video: {
      title: 'Unit 1 — What Makes an Answer Strong?',
      description: 'EAP Foundation\'s tour of the seven features of academic writing — structured, evidenced, critical, precise, balanced, objective, formal. Watch how each feature shows up in real academic text, then apply the checklist in this unit\'s lessons. (Video: EAPFoundation.com)',
      video_url: 'https://www.youtube.com/watch?v=Cq4J8bPBcck',
      thumbnail_url: 'https://i.ytimg.com/vi/Cq4J8bPBcck/hqdefault.jpg',
      duration_seconds: 252,
      transcript: '',
    },
    lessons: [
      {
        title: 'Academic writing vs casual writing',
        objective: 'Explain the difference between casual and academic writing in your own words.',
        body_md:
          'Casual writing tells someone what happened. Academic writing proves what you claim, using specific evidence and clear reasoning.\n\n' +
          'A teacher reading your journal is asking four silent questions: Did you answer every part? Is there specific evidence? Did you explain WHY and HOW? Did you show what you learned?\n\n' +
          'An academic answer has four layers: a CLAIM (your point), EVIDENCE (a specific, observable example), EXPLANATION (why it matters), and ANALYSIS (what you conclude from it). Casual answers usually stop at the claim.',
        examples: [
          {
            weak: 'I learned teamwork.',
            strong:
              'I learned teamwork when my team had different opinions about our prototype design. Instead of insisting on my idea, I listened to the other members, compared the advantages of both approaches, and we combined parts of both ideas. This changed how I approach disagreements because I learned that collaboration can improve the final solution.',
            why: 'The stronger version names a specific situation (prototype disagreement), shows actions (listened, compared, combined), and ends with a changed behavior — claim, evidence, explanation, and analysis are all present.',
          },
        ],
      },
      {
        title: 'The four rubric levels',
        objective: 'Describe what separates RED, YELLOW, GREEN, and BLUE responses.',
        body_md:
          'RED means the answer misses the question or is too generic to evaluate. YELLOW means it is relevant but thin — on topic, yet missing evidence or depth.\n\n' +
          'GREEN means a concrete, honest answer with real detail and some reflection. BLUE means all of that plus insight: reasoning or judgment that another team could actually reuse.\n\n' +
          'Notice that vocabulary difficulty appears nowhere in this ladder. A simple sentence with strong evidence beats a complicated sentence with none. Write clearly, then check each layer.',
        examples: [
          {
            weak: 'Our project faced challenges but we overcame them successfully.',
            strong:
              'Our water filter clogged on the third test because fine sand blocked the mesh. We replaced the top sand layer with coarse gravel, retested twice, and flow rate recovered from 0.4 to 1.1 liters per minute. This taught me to test one variable at a time instead of rebuilding everything.',
            why: 'The stronger answer is checkable: a named event, a cause, an action, measured results, and a transferable lesson. A grader can point at each rubric requirement and find it.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which sentence shows academic writing rather than casual writing?',
        payload: {
          options: [
            'The experiment taught me a lot of things.',
            'When the pH dropped to 4.2 the aluminum dissolved, so we added a buffer and repeated the trial to confirm the reading.',
            'Science is very important for our project and our future.',
          ],
          correct: 1,
          explanation: 'Correct. It names a specific observation (pH 4.2), an action (added a buffer), and a verification step — evidence plus reasoning, not just a claim.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'A student writes: "We had some issues with the design, but overall it went well." Which level does this most resemble, and why?',
        payload: {
          options: [
            'BLUE, because it summarizes the whole project positively.',
            'RED, because it is too generic to evaluate — no specific issue, evidence, or reasoning.',
            'GREEN, because it honestly admits there were issues.',
          ],
          correct: 1,
          explanation: 'Correct. Honesty alone is not evidence. Without a specific issue, action, or result, a grader cannot check any rubric requirement.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 2,
        prompt: 'What does a BLUE answer require that a GREEN answer lacks?',
        payload: {
          options: [
            'Longer vocabulary and more complex grammar.',
            'Full coverage plus insight or judgment valuable beyond the student\u2019s own project.',
            'Mentioning every team member by name.',
            'Writing more than 300 words.',
          ],
          correct: 1,
          explanation: 'Correct. BLUE is about satisfying the criterion strongly — complete coverage, evidence, reasoning, and transferable insight — not word count or fancy words.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Select ALL the layers of a strong academic answer.',
        payload: {
          options: ['Claim', 'Evidence', 'Explanation', 'Complicated vocabulary', 'Analysis', 'Long introduction'],
          correct: [0, 1, 2, 4],
          explanation: 'Correct. Claim, evidence, explanation, and analysis are the four layers. Vocabulary and long introductions add nothing without them.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: using more complicated words automatically moves an answer toward BLUE.',
        payload: {
          correct: false,
          explanation: 'False. Graders reward satisfied criteria — coverage, evidence, reasoning — not word difficulty. Complicated words without evidence stay RED or YELLOW.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Identify the stronger paragraph.',
        payload: {
          options: [
            'A: "I developed leadership skills during the project and it was a great experience for my future."',
            'B: "I led the testing schedule after we missed two deadlines. I assigned each test to one owner with a visible checklist, and we finished the remaining six tests in four days. I learned that leadership here meant removing ambiguity, not giving orders."',
          ],
          correct: 1,
          explanation: 'Correct. B names the situation (missed deadlines), the action (owners + checklist), the result (six tests in four days), and the lesson. A is a claim with no evidence.',
        },
      },
    ],
    tricks: [
      { title: 'The four silent questions', body: 'Before submitting, ask: did I answer every part? Is there specific evidence? Did I explain WHY and HOW? Did I show what I learned?' },
      { title: 'Highlight test', body: 'Highlight every specific example in your draft. If nothing is highlighted, you have claims without evidence.' },
      { title: 'Simple beats fancy', body: 'If a simpler word says the same thing, use it. Clarity is what graders reward.' },
    ],
    mistakes: [
      { title: 'Mistaking length for depth', body: 'More words without more evidence or reasoning never raises a level.' },
      { title: 'Answering a different question', body: 'Writing about the project in general instead of what was actually asked caps you at YELLOW.' },
      { title: 'Hiding behind complicated words', body: '"Utilized the implementation of" instead of "used" signals insecurity, not scholarship.' },
    ],
  },
  {
    slug: 'understanding-questions',
    unit_number: 2,
    title: 'Understanding the Question',
    description: 'Decode action verbs (describe, explain, analyze, evaluate…), pull any question apart into parts, and never miss half a question again.',
    est_minutes: 40,
    video: {
      title: 'Unit 2 — Read the Question Like a Grader',
      description: 'A step-by-step breakdown of what exam questions actually demand: how keywords tell you whether to analyse or describe, and how to structure the answer. Pairs directly with this unit\'s Question Decoder. (Video: Schooled for Success Academy)',
      video_url: 'https://www.youtube.com/watch?v=bPBSw-d5eTI',
      thumbnail_url: 'https://i.ytimg.com/vi/bPBSw-d5eTI/hqdefault.jpg',
      duration_seconds: 294,
      transcript: '',
    },
    lessons: [
      {
        title: 'What question verbs actually demand',
        objective: 'Match common academic verbs to the thinking each one requires.',
        body_md:
          'Describe asks for observable detail: what happened, step by step. Explain asks for cause: WHY it happened and HOW it works.\n\n' +
          'Analyze asks you to break something into parts and show how they relate. Compare asks for similarities AND differences, not just two descriptions side by side.\n\n' +
          'Evaluate asks for a judgment backed by criteria and evidence. Reflect asks what an experience taught you and what you would change. Justify asks for reasons that defend a choice. Synthesize asks you to combine ideas into something new — a decision, an insight, a solution.',
        examples: [
          {
            weak: 'Question: "Evaluate your testing strategy." Answer: "Our testing strategy had three stages and took two weeks."',
            strong: 'Question: "Evaluate your testing strategy." Answer: "Our three-stage strategy worked for catching leaks early — the dye test found two seal failures before assembly — but it wasted a week because we retested the full device instead of only changed parts. Against the criteria of speed and coverage, I rate it 6/10, and next time I would isolate retests."',
            why: 'The weak answer only describes. Evaluate demands a judgment against criteria plus evidence, which the stronger answer provides: what worked, what failed, a rating, and a change.',
          },
        ],
      },
      {
        title: 'The Question Decoder: number, action, object, context, reason',
        objective: 'Dissect a question into its five checkable parts.',
        body_md:
          'Take "Describe two strategies you will apply in your next project based on previous experience." Number: two — one strategy caps you at partial coverage. Action: describe — observable detail, not opinion.\n\n' +
          'Object: strategies — the thing itself, not background. Context: next project — future application, not past summary. Reason: based on previous experience — each strategy must link to something that actually happened.\n\n' +
          'Missing any one of these weakens the response. After writing, re-read the question and tick each part off against your answer.',
        examples: [
          {
            weak: 'Answer gives one well-described strategy with no link to past experience and no mention of the next project.',
            strong: 'Answer gives two strategies, each described concretely, each tied to a past event, each stating how it will be used next time.',
            why: 'The decoder turns "did I answer well?" into five yes/no checks. The weak answer fails three of them: number, context, and reason.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'match', difficulty: 'medium', points: 2,
        prompt: 'Match each verb to what it demands.',
        payload: {
          pairs: [
            { left: 'Describe', right: 'Observable detail of what happened' },
            { left: 'Justify', right: 'Reasons defending a choice' },
            { left: 'Reflect', right: 'What was learned and what would change' },
            { left: 'Compare', right: 'Similarities and differences' },
          ],
          explanation: 'Correct. Each verb triggers different thinking: describe shows, justify defends, reflect extracts lessons, compare contrasts both sides.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'decoder', difficulty: 'medium', points: 2,
        prompt: 'Decode: "Explain two factors that affected your prototype results and how you would control each one."',
        payload: {
          question: 'Explain two factors that affected your prototype results and how you would control each one.',
          blanks: [
            { label: 'NUMBER', options: ['One', 'Two', 'As many as possible'], correct: 1 },
            { label: 'ACTION', options: ['List', 'Explain causes and control methods', 'Describe appearance'], correct: 1 },
            { label: 'OBJECT', options: ['Factors affecting results', 'Team members', 'Tools used'], correct: 0 },
          ],
          explanation: 'Correct. Two factors, explained (cause + control method each), focused on what affected results. Listing factors without control methods misses half the question.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 2,
        prompt: '"Compare the two filtration materials you tested." What MUST the answer contain?',
        payload: {
          options: [
            'A full description of the first material only, in great detail.',
            'Similarities and differences between both materials, with evidence from tests.',
            'A personal opinion about which material is more interesting.',
            'The history of filtration.',
          ],
          correct: 1,
          explanation: 'Correct. Compare requires both sides plus the relationship between them — similarities AND differences grounded in test evidence.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'decoder', difficulty: 'medium', points: 2,
        prompt: 'Decode: "Reflect on a disagreement in your team and how it changed your approach to collaboration."',
        payload: {
          question: 'Reflect on a disagreement in your team and how it changed your approach to collaboration.',
          blanks: [
            { label: 'OBJECT', options: ['A disagreement in the team', 'The final prototype', 'The project schedule'], correct: 0 },
            { label: 'REQUIRED THINKING', options: ['Summary of events', 'Lesson plus behavior change', 'Praise for teammates'], correct: 1 },
          ],
          explanation: 'Correct. Reflect demands the lesson and the change, not just the story. An answer that only narrates the disagreement stays descriptive.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which checks belong in a final re-read of the question? Select ALL that apply.',
        payload: {
          options: [
            'Did I cover every numbered part?',
            'Did I match the action verb (describe vs explain vs evaluate)?',
            'Did I include the required context and reason?',
            'Did I use at least three complicated words?',
          ],
          correct: [0, 1, 2],
          explanation: 'Correct. Number, action, object, context, and reason are the checkable parts. Vocabulary difficulty is never a requirement.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: "Synthesize" means summarizing each source one after another.',
        payload: {
          correct: false,
          explanation: 'False. Summarizing lists ideas separately; synthesizing combines them into a new decision or insight. Unit 8 covers this in depth.',
        },
      },
    ],
    tricks: [
      { title: 'Circle the verbs first', body: 'Before writing, circle every action verb in the question. Each verb is a grading checkpoint.' },
      { title: 'Count the numbers', body: 'Words like two, three, or each signal how many parts the grader will look for. Match that count exactly.' },
      { title: 'Re-read after writing', body: 'Tick each decoded part against your finished answer. The part you forgot is the part that costs a level.' },
    ],
    mistakes: [
      { title: 'Answering half the question', body: 'The most common YELLOW: a great answer to part one, silence on part two.' },
      { title: 'Describing when asked to evaluate', body: 'No judgment, no criteria, no rating — just a summary that dodges the verb.' },
      { title: 'Ignoring context words', body: '"In your next project" and "based on experience" are requirements, not decoration.' },
    ],
  },
  {
    slug: 'strong-paragraphs',
    unit_number: 3,
    title: 'Building a Strong Paragraph',
    description: 'Master CLAIM → EVIDENCE → EXPLANATION → CONNECTION as flexible thinking, plus topic sentences and natural flow.',
    est_minutes: 35,
    video: {
      title: 'Unit 3 — Paragraphs That Prove Things',
      description: 'Point, Evidence, Explain, Link — a clear walkthrough of the PEEL paragraph system with a worked example. The same four moves as this unit\'s CLAIM → EVIDENCE → EXPLANATION → CONNECTION. (Video: Doodlecation)',
      video_url: 'https://www.youtube.com/watch?v=_lspxz7wiPI',
      thumbnail_url: 'https://i.ytimg.com/vi/_lspxz7wiPI/hqdefault.jpg',
      duration_seconds: 228,
      transcript: '',
    },
    lessons: [
      {
        title: 'The four moves: claim, evidence, explanation, connection',
        objective: 'Identify the four moves in a paragraph and explain what each contributes.',
        body_md:
          'CLAIM states your point in one sentence — the topic sentence. EVIDENCE shows something specific and observable that supports it. EXPLANATION tells why the evidence matters — the cause, mechanism, or reasoning.\n\n' +
          'CONNECTION links the point forward: to the question, to your project decision, or to what you learned. A paragraph missing evidence is an opinion; missing explanation is a story; missing connection is a dead end.\n\n' +
          'Adapt naturally: sometimes evidence comes first and the claim follows as a conclusion. What matters is that all four moves appear, not their exact order.',
        examples: [
          {
            weak: 'Testing is important. We did many tests and they helped us a lot. Testing should always be done carefully.',
            strong:
              'Our retest policy saved the prototype (claim). After the seal failed on trial two, we retested only the changed gasket instead of the full device, which cut testing time from six hours to ninety minutes (evidence). Isolating the changed part works because most failures come from the last modification (explanation). I now apply this rule to every test plan I write (connection).',
            why: 'The weak paragraph repeats one claim three ways with zero evidence. The strong one proves its claim with numbers, explains the mechanism, and connects to future behavior.',
          },
        ],
      },
      {
        title: 'Diagnose and repair weak paragraphs',
        objective: 'Given a weak paragraph, name the missing move and rewrite it.',
        body_md:
          'Read any paragraph and ask four questions: What is the point? What proves it? Why does the proof matter? So what — what follows from it?\n\n' +
          'The first question you cannot answer names the missing move. Add exactly that, in your own voice, and the paragraph usually jumps a full level.\n\n' +
          'Common repair patterns: claim-only paragraphs need one observable event; story paragraphs need a "because" sentence; floating facts need a final sentence saying what changed.',
        examples: [
          {
            weak: 'I communicated better with my team. We talked every day and shared updates. Communication is the key to success.',
            strong:
              'Daily updates fixed our coordination problem (claim). Before them, two members built conflicting sensor mounts because neither knew the other had started (evidence). Talking every morning worked because conflicts surfaced when they were still cheap to fix (explanation). I now open every team task by asking who else touches it (connection).',
            why: 'Diagnosis of the weak version: claim present, evidence absent, explanation absent, connection reduced to a slogan. The repair adds all three missing moves.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which sentence is doing the EXPLANATION move? "The filter clogged because fine sand blocked the mesh. Flow dropped to 0.4 L/min. This taught me to test one variable at a time."',
        payload: {
          options: [
            '"The filter clogged because fine sand blocked the mesh."',
            '"Flow dropped to 0.4 L/min."',
            '"This taught me to test one variable at a time."',
          ],
          correct: 0,
          explanation: 'Correct. The "because" sentence gives the cause — explanation. The flow number is evidence; the lesson is connection.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: '"We collected daily temperature readings for two weeks. The average rose 1.8 degrees after insulation. Warmer boxes dry samples faster." What is missing?',
        payload: {
          options: [
            'Evidence — there are no observations.',
            'Connection — it never says what follows: what decision or lesson comes from this.',
            'Claim — there is no point being made.',
          ],
          correct: 1,
          explanation: 'Correct. Claim, evidence, and explanation are present, but the paragraph ends without a decision, lesson, or link forward.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'order_steps', difficulty: 'medium', points: 2,
        prompt: 'Put these paragraph moves in their most natural order.',
        payload: {
          steps: ['Claim: state your point', 'Evidence: show something specific', 'Explanation: say why it matters', 'Connection: link it forward'],
          explanation: 'Correct. Claim first, then proof, then reasoning, then the link forward. Remember the order can flex — but all four moves must appear.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'easy', points: 2,
        prompt: 'A paragraph has a clear claim and vivid evidence but never explains why the evidence matters. What is it?',
        payload: {
          options: [
            'A complete BLUE paragraph.',
            'A story, not an argument — it needs the explanation move.',
            'An academic paragraph that only needs longer words.',
          ],
          correct: 1,
          explanation: 'Correct. Evidence without explanation is narration. The "because" sentence is what turns observation into reasoning.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'hard', points: 3,
        prompt: 'Repair this claim-only paragraph in 2–4 sentences by adding evidence and explanation: "Planning is essential for project success."',
        payload: {
          keywords: ['because', 'when', 'week', 'day', 'test', 'result', 'hour', 'delay', 'schedule', 'measured', 'found', 'specific'],
          threshold: 0.35,
          sample: 'Planning saved our testing week: when we mapped all six tests to owners and days, we finished in four days instead of the usual seven, because no one waited on anyone else. I learned a plan is only real when every task has both an owner and a date.',
          explanation: 'Strong repairs add something observable (days, owners, results) plus a because-sentence. Compare yours with the sample: does it contain a checkable fact and a cause?',
        },
      },
    ],
    tricks: [
      { title: 'The four-question scan', body: 'Point? Proof? Why? So what? The first unanswered question is your missing move.' },
      { title: 'One because per paragraph', body: 'If a paragraph has no because/so/therefore sentence, it probably has no explanation.' },
      { title: 'End with forward motion', body: 'Last sentence rule: a decision, a lesson, or a link — never just stop.' },
    ],
    mistakes: [
      { title: 'Claim stacking', body: 'Three claims in a row with no evidence is three missed opportunities, not depth.' },
      { title: 'Slogan conclusions', body: '"Communication is key" explains nothing. Say what YOU will do differently.' },
      { title: 'Formula writing', body: 'Forcing identical sentence order every paragraph sounds robotic. Vary the order, keep the moves.' },
    ],
  },
  {
    slug: 'evidence-examples',
    unit_number: 4,
    title: 'Evidence & Specific Examples',
    description: 'The biggest BLUE skill: replace vague claims with observable events, data, and project evidence.',
    est_minutes: 40,
    video: {
      title: 'Unit 4 — Evidence & Specific Examples',
      description: 'When claims need sources, which sources count, and how to connect each source to your point so the reader never has to guess. Includes peer-review versus website guidance. (Video: Presenting Psychology)',
      video_url: 'https://www.youtube.com/watch?v=2pMrYDH-fkg',
      thumbnail_url: 'https://i.ytimg.com/vi/2pMrYDH-fkg/hqdefault.jpg',
      duration_seconds: 222,
      transcript: '',
    },
    lessons: [
      {
        title: 'Generic vs specific: what graders can check',
        objective: 'Rewrite vague claims as observable, checkable statements.',
        body_md:
          'Generic: "Our team had many problems." Nothing here can be verified — which problems, when, with what effect? Specific: "During the prototype stage, our original closure did not seal correctly, which caused moisture to enter the package."\n\n' +
          'Evidence comes in flavors: personal (what you did), project (what happened in your Capstone), scientific (concepts and mechanisms), experimental (measurements, trials, data), and observational (what you saw and when).\n\n' +
          'Strong answers mix at least two flavors: a measurement plus the decision it caused, an event plus the lesson it taught.',
        examples: [
          {
            weak: 'I improved my communication.',
            strong:
              'In week four, our sensor and housing sub-teams built conflicting mounts because neither posted updates. I started a five-minute morning check-in; within a week, blocking conflicts dropped from three to zero, and I learned that communication means making work visible, not just talking.',
            why: 'WHEN (week four), WHAT HAPPENED (conflicting mounts), WHAT YOU DID (morning check-in), WHAT CHANGED (three conflicts to zero), WHAT YOU LEARNED (visibility). Every vague word got replaced by something checkable.',
          },
        ],
      },
      {
        title: 'The five-question converter',
        objective: 'Apply WHEN / WHAT HAPPENED / WHAT YOU DID / WHAT CHANGED / WHAT YOU LEARNED to any vague draft.',
        body_md:
          'Take any sentence with "improved", "learned", "helped", "problems", or "a lot" — these are vagueness alarms. Run the five questions on it.\n\n' +
          'WHEN pins it in time. WHAT HAPPENED names the observable event. WHAT YOU DID shows your agency. WHAT CHANGED gives the result — ideally measured. WHAT YOU LEARNED extracts the transferable lesson.\n\n' +
          'You rarely need all five in one sentence; spread them across the paragraph. If none of your sentences answer any of them, you have no evidence yet.',
        examples: [
          {
            weak: 'The new design worked better.',
            strong:
              'After switching from mesh to gravel pre-filtration in trial three, flow held above 1.0 L/min for the full ten minutes instead of clogging at minute four. The coarser layer catches leaves while letting water through, so I now size pre-filters by debris type first.',
            why: 'Trial number, measurements before and after, the mechanism, and a design rule for next time — the vague "better" became four checkable facts.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which sentence contains usable evidence?',
        payload: {
          options: [
            'The results were quite good overall.',
            'Yield rose from 41% to 68% after we doubled the aeration time.',
            'Everyone agreed the new method was better.',
          ],
          correct: 1,
          explanation: 'Correct. Only the middle sentence gives checkable facts: two numbers and the change that caused them.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'short_answer', difficulty: 'medium', points: 2,
        prompt: 'Convert to specific evidence (answer all five): "We had trouble with testing." WHEN? WHAT HAPPENED? WHAT DID YOU DO? WHAT CHANGED? WHAT DID YOU LEARN?',
        payload: {
          keywords: ['when', 'week', 'day', 'because', 'measured', 'test', 'changed', 'learned', 'result', 'trial', 'found', 'fixed'],
          threshold: 0.4,
          sample: 'In week five our dye test failed three mornings in a row because the seals were installed dry. We added a lubrication step to the checklist, failures dropped to zero over the next six runs, and I learned that most "random" failures have a skipped step behind them.',
          explanation: 'Strong conversions answer all five questions with at least one checkable fact. Count yours: time, event, action, measured change, lesson.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Two students describe the same event. Which is stronger evidence, and why?',
        payload: {
          options: [
            'A: "The pump broke and it was a disaster for our timeline." — stronger, because it shows emotion.',
            'B: "The pump seized on day two of trials; we lost one day sourcing a replacement and reran trials three to five on schedule." — stronger, because time, cause, and recovery are all checkable.',
            'Both are equally strong evidence.',
          ],
          correct: 1,
          explanation: 'Correct. Emotion is not evidence. Checkable facts — when, what, cost, recovery — are what graders can reward.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which of these count as evidence flavors taught in this unit? Select ALL that apply.',
        payload: {
          options: ['Personal actions', 'Project events', 'Measurements and data', 'Vague adjectives', 'Observations with time', 'Complicated words'],
          correct: [0, 1, 2, 4],
          explanation: 'Correct. Personal, project, experimental, and observational evidence all count. Adjectives and fancy words are decoration, not proof.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: adding adjectives like "very big" or "extremely important" fixes vague writing.',
        payload: {
          correct: false,
          explanation: 'False. Adjectives intensify a claim without making it checkable. Replace them with events, numbers, and observations.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'hard', points: 3,
        prompt: 'Convert: "My time management got better." Use at least three of the five converter questions.',
        payload: {
          keywords: ['week', 'day', 'when', 'because', 'schedule', 'deadline', 'finished', 'hour', 'plan', 'changed', 'learned', 'result'],
          threshold: 0.35,
          sample: 'After missing two Friday deadlines in March, I started blocking 45-minute task slots each evening. In the next two weeks I submitted all six deliverables on time, which taught me that a plan without time slots is just a wish list.',
          explanation: 'Check yours for time, event, action, measured change, and lesson. Three or more present means the vague claim became evidence.',
        },
      },
    ],
    tricks: [
      { title: 'Vagueness alarms', body: 'Circle improved, learned, helped, problems, a lot, very. Each one owes you a fact.' },
      { title: 'Numbers beat adjectives', body: '"From 0.4 to 1.1 L/min" ends all debate. Measure one thing per claim.' },
      { title: 'Two flavors minimum', body: 'Pair every event with a number, or every number with a decision it caused.' },
    ],
    mistakes: [
      { title: 'Adjective stuffing', body: '"Very extremely critical problems" is still zero evidence.' },
      { title: 'Example without a point', body: 'A vivid story that never connects to the question is decoration.' },
      { title: 'Borrowed evidence', body: 'Citing what "people say" instead of what you observed or measured.' },
    ],
  },
  {
    slug: 'reflection-depth',
    unit_number: 5,
    title: 'Reflection: Beyond Description',
    description: 'Move from DESCRIPTION to REFLECTION to DEEP REFLECTION with EVENT → INTERPRETATION → LESSON → CHANGE.',
    est_minutes: 40,
    video: {
      title: 'Unit 5 — Reflection That Earns Levels',
      description: 'Gibbs\' six-stage reflective cycle — description, feelings, evaluation, analysis, conclusion, action plan — explained with a worked scenario. Use it to push any description up to deep reflection. (Video: Global Assignment Help)',
      video_url: 'https://www.youtube.com/watch?v=RbMxfcsdoBU',
      thumbnail_url: 'https://i.ytimg.com/vi/RbMxfcsdoBU/hqdefault.jpg',
      duration_seconds: 246,
      transcript: '',
    },
    lessons: [
      {
        title: 'Description, reflection, deep reflection',
        objective: 'Classify a passage on the four-stage ladder and explain what would lift it.',
        body_md:
          'DESCRIPTION says what happened: "My prototype failed." REFLECTION adds cause: "…because the material was not strong enough."\n\n' +
          'ANALYSIS breaks it down: "…because I chose by availability instead of checking load requirements, and the joints carried twice their rated stress."\n\n' +
          'DEEP REFLECTION extracts change: "The failure showed me availability is never a selection criterion alone. I now list structural requirements before choosing any material — a rule that already saved our second build."\n\n' +
          'Each stage answers a deeper question: what → why → how exactly → so what now. Graders climb with you only if you climb.',
        examples: [
          {
            weak: 'Our presentation went badly. The judges asked hard questions and we were nervous.',
            strong:
              'The judges stalled us on cost justification because our slides showed prototype photos but no budget table. I realized we had prepared to impress, not to defend — so I rebuilt the deck around one question per slide: "what will they challenge here?" Our next review had zero undefended claims, and I now prepare every presentation from the critic\u2019s seat.',
            why: 'The weak version stops at description plus feeling. The strong version interprets the cause (no defense prepared), states the lesson (prepare to defend, not impress), and shows changed behavior with a result.',
          },
        ],
      },
      {
        title: 'EVENT → INTERPRETATION → LESSON → CHANGE',
        objective: 'Apply the four-stage chain to your own project experience.',
        body_md:
          'EVENT: one specific thing that happened — no generalizations. INTERPRETATION: what you think it meant — your reading of the cause, with a "because" that goes past the surface.\n\n' +
          'LESSON: the principle you extracted — stated so someone else could use it. CHANGE: what you actually did differently afterwards, with the result.\n\n' +
          'Test your chain backwards: if the change does not logically follow the lesson, or the lesson does not follow the interpretation, one link is decoration. Rewrite that link until the chain holds.',
        examples: [
          {
            weak: 'We argued about the design, then we agreed, and I learned teamwork matters.',
            strong:
              'We deadlocked for a week because both sub-teams optimized their own part instead of the whole device (event + interpretation). I learned that local optimization can wreck system performance (lesson), so I proposed a single shared success metric — liters per hour per pound — and the next integration round took two days instead of nine (change + result).',
            why: 'Every link carries weight: the interpretation names the real cause (sub-optimization), the lesson is transferable, and the change is verified by a measured result.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: '"The pump failed because the voltage spiked." Which stage is this?',
        payload: {
          options: ['Description', 'Reflection (cause given, lesson and change missing)', 'Deep reflection', 'Analysis with full breakdown'],
          correct: 1,
          explanation: 'Correct. A cause alone is reflection started. Analysis would break down why the spike happened; deep reflection would add the lesson and the change.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'order_steps', difficulty: 'easy', points: 1,
        prompt: 'Order the reflection chain correctly.',
        payload: {
          steps: ['EVENT: name one specific thing that happened', 'INTERPRETATION: explain what you think it meant', 'LESSON: state the transferable principle', 'CHANGE: show what you did differently'],
          explanation: 'Correct. Event first, then your reading of it, then the principle, then the verified change. Skip a link and the chain breaks.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Which passage shows DEEP reflection?',
        payload: {
          options: [
            'A: "The test failed three times, which was frustrating for the whole team."',
            'B: "The test failed three times because we changed two variables at once. I realized our "quick" shortcut actually cost us a week, so I now enforce one-variable changes — and our last four tests each passed on the second run at most."',
          ],
          correct: 1,
          explanation: 'Correct. B carries interpretation (two variables), lesson (shortcuts cost time), and verified change (one-variable rule, four tests as proof). A is description plus feeling.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'A student writes only what happened, step by step. What is missing? Select ALL that apply.',
        payload: {
          options: ['Interpretation of causes', 'A transferable lesson', 'Evidence of changed behavior', 'More adjectives'],
          correct: [0, 1, 2],
          explanation: 'Correct. Pure narration needs interpretation, lesson, and change. Adjectives never fix a missing link.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: describing your feelings about an event counts as deep reflection.',
        payload: {
          correct: false,
          explanation: 'False. Feelings are description of inner events. Reflection needs causes, lessons, and change — what you think and do differently, not just how you felt.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'short_answer', difficulty: 'hard', points: 3,
        prompt: 'Push this to deep reflection in 3–5 sentences: "Our team missed the deadline."',
        payload: {
          keywords: ['because', 'realized', 'learned', 'changed', 'now', 'next', 'lesson', 'cause', 'result', 'different'],
          threshold: 0.4,
          sample: 'We missed the deadline because tasks had owners but no dates, so everything slid silently. I realized accountability without a calendar is fiction. I now attach a date to every task I assign, and in the next sprint we hit all nine milestones.',
          explanation: 'Deep reflection needs cause, lesson, and verified change. Check yours for all three — "because", a lesson sentence, and something you now do differently.',
        },
      },
    ],
    tricks: [
      { title: 'The backwards test', body: 'Read your chain backwards: change ← lesson ← interpretation ← event. Any link that does not follow gets rewritten.' },
      { title: 'Ban feeling-only endings', body: 'Never end on "it was great/hard." End on what you do differently now.' },
      { title: 'One event, fully mined', body: 'A single event carried through all four stages beats three events stuck at description.' },
    ],
    mistakes: [
      { title: 'Stopping at because', body: 'A cause without a lesson or change is reflection abandoned halfway.' },
      { title: 'Lesson without proof', body: '"I learned planning matters" means nothing unless your behavior visibly changed.' },
      { title: 'Generic lessons', body: '"Teamwork is important" fits every project, so it proves nothing about yours.' },
    ],
  },
];
