import { AcademyUnitSeed } from './academyTypes';

// Units 11-15: research track (fundamentals, paper, sources, results, revision)
export const ACADEMY_PART3: AcademyUnitSeed[] = [
  {
    slug: 'research-fundamentals',
    unit_number: 11,
    title: 'Research Fundamentals',
    description: 'From topic to focused research question: problems, sources, credibility, variables, methods, ethics — plus the Question Builder.',
    est_minutes: 45,
    video: {
      title: 'Unit 11 — From Topic to Research Question',
      description: 'What makes a research question focused, feasible, rooted, and aligned — with a five-step build process and a quality checklist. (Video: Scribbr)',
      video_url: 'https://www.youtube.com/watch?v=71-GucBaM8U',
      thumbnail_url: 'https://i.ytimg.com/vi/71-GucBaM8U/hqdefault.jpg',
      duration_seconds: 312,
      transcript: '',
    },
    lessons: [
      {
        title: 'Topic vs question vs problem',
        objective: 'Convert a broad topic into a focused, investigable research question.',
        body_md:
          '"I want to research food packaging" is a topic — it asks nothing. A research question asks something answerable: "Does chitosan coating extend the shelf life of strawberries at room temperature compared to no coating?"\n\n' +
          'Behind every question sits a problem: something costly, harmful, or unknown that justifies the work. No problem, no research — only a school exercise.\n\n' +
          'A researchable question names: the factor you vary, the outcome you measure, and the context. If any is missing, the question is still a topic in disguise.',
        examples: [
          {
            weak: 'Topic: "Water pollution." (No question, no variables, no context — unresearchable as stated.)',
            strong: 'Question: "Does gravel pre-filtration reduce turbidity of canal water below 5 NTU within ten minutes?" Factor, outcome with threshold, time frame — immediately testable.',
            why: 'The strong version can be answered by an experiment tomorrow. The weak version can only be "written about" vaguely — which is how literature reviews become copy-paste.',
          },
        ],
      },
      {
        title: 'Sources: scholarly vs noise, primary vs secondary',
        objective: 'Judge source credibility and choose the right source type for each need.',
        body_md:
          'Primary sources carry direct evidence: your measurements, published datasets, original papers\u2019 methods and results. Secondary sources interpret: reviews, textbooks, articles about studies.\n\n' +
          'Scholarly sources show methods, data, and references you can check. Non-scholarly sources (blogs, marketing pages, social posts) may spark ideas but never anchor claims.\n\n' +
          'Credibility checklist: who wrote it, what evidence they show, whether methods are described, who reviewed it, and whether it is current enough for your question. One failed check means find a better source.',
        examples: [
          {
            weak: 'Citing a packaging company blog that "chitosan is the future of fresh food" as proof of effectiveness.',
            strong: 'Citing a peer-reviewed trial reporting shelf-life days with and without coating, then noting its sample size and limits before applying it.',
            why: 'Marketing claims are not evidence. The strong citation carries data, and the writer shows judgment by stating limits — exactly what Unit 14 will deepen.',
          },
        ],
      },
      {
        title: 'Build your research question',
        objective: 'Use the Builder to narrow a topic into a testable question.',
        body_md:
          'Fill the Builder with your topic, the problem behind it, the population or context, the factor you will vary, and the outcome you will measure. The tool composes candidate questions — then YOU judge which is truly investigable with your resources.\n\n' +
          'The Builder narrows; it never writes your paper. Reject any candidate you could not test, and keep narrowing until the question fits your time, materials, and access.\n\n' +
          'A good final question passes three tests: answerable by evidence, narrow enough for your resources, and tied to a real problem.',
        examples: [
          {
            weak: 'Builder output accepted blindly: a question requiring lab equipment the school does not have.',
            strong: 'Builder output judged and narrowed twice until it fit a two-week classroom trial with a phone camera as the instrument.',
            why: 'Tools propose; researchers dispose. The skill is judging feasibility, not generating text.',
          },
        ],
        widget: 'rq_builder',
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Which is a researchable question?',
        payload: {
          options: [
            '"Renewable energy."',
            '"Does a 30-degree tilt increase daily output of a classroom solar panel versus flat mounting over one week?"',
            '"Why is science important?"',
          ],
          correct: 1,
          explanation: 'Correct. Factor (tilt), outcome (daily output), context and timeframe — answerable by measurement. The others are a topic and a slogan.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'You need the exact shelf-life numbers from a coating trial. Which source type?',
        payload: {
          options: [
            'A secondary review summarizing many studies.',
            'The original paper\u2019s results section (primary source).',
            'A supplier blog post about the coating.',
          ],
          correct: 1,
          explanation: 'Correct. Numbers live in primary results. Reviews interpret; blogs sell. Always trace data to its origin.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which signal a credible scholarly source? Select ALL that apply.',
        payload: {
          options: ['Described methods', 'Checkable data and references', 'Peer review', 'Anonymous authorship', 'Current for the question', 'Exciting headlines'],
          correct: [0, 1, 2, 4],
          explanation: 'Correct. Methods, data, review, and currency build trust. Anonymity and excitement build clicks.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: '"I want to research food packaging." What is the FIRST correct move?',
        payload: {
          options: [
            'Start collecting sources about packaging immediately.',
            'Narrow it: name a problem, factor, outcome, and context until it becomes a testable question.',
            'Pick the packaging material with the most blog coverage.',
          ],
          correct: 1,
          explanation: 'Correct. Research starts from a question, not a pile. Sources serve the question — never the reverse.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: variables, hypothesis, and limitations belong in research planning before drawing conclusions.',
        payload: {
          correct: true,
          explanation: 'True. Naming what varies, what you expect, and what could go wrong is what separates research from hoping.',
        },
      },
    ],
    tricks: [
      { title: 'Question-first rule', body: 'No sources until the question is written. Sources answer; they do not ask.' },
      { title: 'Three-test finish', body: 'Answerable by evidence? Fits your resources? Tied to a real problem? All three, or keep narrowing.' },
      { title: 'Trace to origin', body: 'Every number you cite must survive one click back to primary data.' },
    ],
    mistakes: [
      { title: 'Topic as question', body: '"Water pollution" submitted as a research question. Unanswerable by design.' },
      { title: 'Blog-anchored claims', body: 'Marketing copy cited as evidence. Instant credibility loss.' },
      { title: 'Impossible scope', body: 'A question needing a lab you will never enter. Narrow until testable.' },
    ],
  },
  {
    slug: 'research-paper',
    unit_number: 12,
    title: 'How to Write a Research Paper',
    description: 'The full IMRaD journey: title to references — what each section must accomplish, and why.',
    est_minutes: 45,
    video: {
      title: 'Unit 12 — Anatomy of a Research Paper',
      description: 'IMRaD section by section: CARS-model introductions, repeatable methods, plain results, and discussions that move from findings outward. (Video: Academic Writing channel)',
      video_url: 'https://www.youtube.com/watch?v=-Zud3lIXxdM',
      thumbnail_url: 'https://i.ytimg.com/vi/-Zud3lIXxdM/hqdefault.jpg',
      duration_seconds: 330,
      transcript: '',
    },
    lessons: [
      {
        title: 'Title, abstract, introduction: the promise',
        objective: 'Draft a title, abstract skeleton, and introduction outline for a study.',
        body_md:
          'TITLE names variables and context, not hopes: "Effect of gravel pre-filtration on canal-water turbidity" — never "An amazing journey into clean water."\n\n' +
          'ABSTRACT (150–250 words, one paragraph) delivers purpose, method, key result, and conclusion — a miniature paper a busy reader can trust.\n\n' +
          'INTRODUCTION answers five questions: What is the problem? Why does it matter? What is already known? What is NOT known? What will this study investigate? Miss the fourth and your study has no gap to fill; miss the fifth and it has no direction.',
        examples: [
          {
            weak: 'Introduction: three pages on the history of water, no gap, no question — the study could be about anything.',
            strong: 'Introduction: canal turbidity harms drip lines (problem, with local relevance), prior work covers sand filters (known), none test gravel pre-filters under ten minutes (gap), so this study tests gravel stages against a 5 NTU target (direction).',
            why: 'The strong version earns its existence in four moves: problem, known, gap, direction. The weak version is decoration before research.',
          },
        ],
      },
      {
        title: 'Methods, results: what you did, what you found',
        objective: 'Separate method from result and write each so others could repeat or verify.',
        body_md:
          'METHODS answers "what did you actually do?" with repeatable detail: materials, setup, procedure, measurements, controls. A stranger with your section should be able to rerun the study.\n\n' +
          'RESULTS answers "what did you observe?" — data, tables, figures, plain reporting. No interpretation here: "flow held at 1.1 L/min" belongs; "proving our genius design" does not.\n\n' +
          'The classic mix-up is interpreting in Results ("showing the method works great") or hiding procedure in Discussion. Keep each section on its job.',
        examples: [
          {
            weak: 'Results: "The new filter was clearly much better, which proves our approach was right and should be adopted widely."',
            strong: 'Results: "Mean flow across six trials: 1.1 L/min (SD 0.08) versus 0.4 L/min (SD 0.21) for mesh-only. Clogging onset moved from minute four to beyond minute ten in all runs."',
            why: 'Numbers a reader can check versus adjectives no one can verify. Judgment waits for Discussion; Results just reports.',
          },
        ],
      },
      {
        title: 'Discussion, limitations, conclusion, references',
        objective: 'Interpret honestly, limit fairly, conclude within evidence, and cite cleanly.',
        body_md:
          'DISCUSSION answers "what do the results mean?" — connect findings to the gap, compare with prior work, explain surprises. LIMITATIONS state what could weaken the claims: sample size, time frame, instruments. Stating limits strengthens trust; hiding them destroys it.\n\n' +
          'CONCLUSION answers "what can reasonably be concluded?" — only what the evidence supports (Unit 14 goes deep here). REFERENCES list every source actually used, in consistent format.\n\n' +
          'Read your paper backwards: conclusion → discussion → results → methods. Each step back must support the step forward; any gap is a rewrite target.',
        examples: [
          {
            weak: 'Conclusion: "This proves gravel filters solve water pollution everywhere forever." (Evidence: six classroom trials.)',
            strong: 'Conclusion: "Under classroom conditions, gravel pre-filtration held canal-water flow above 1.0 L/min for ten minutes across six trials — sufficient for our drip-line use case; field and long-term testing remain open."',
            why: 'Scope matches evidence: conditions named, numbers cited, limits admitted, next work stated. The weak version claims the planet on six trials.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'An introduction covers the problem and prior work but never states a gap or a research question. What is wrong?',
        payload: {
          options: [
            'Nothing — history sections are always sufficient.',
            'The study has no reason to exist and no direction; add the gap and the question.',
            'It needs more citations, any citations.',
          ],
          correct: 1,
          explanation: 'Correct. Known-without-gap means no contribution; question-less means no direction. Both are required, not decorative.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'match', difficulty: 'medium', points: 2,
        prompt: 'Match each section to its job.',
        payload: {
          pairs: [
            { left: 'Methods', right: 'What was actually done, repeatably' },
            { left: 'Results', right: 'What was observed, plainly reported' },
            { left: 'Discussion', right: 'What the results mean' },
            { left: 'Conclusion', right: 'What can reasonably be concluded' },
          ],
          explanation: 'Correct. Each section has exactly one job. Mix-ups — interpreting in Results, concluding beyond evidence — are the classic paper killers.',
        },
      },
      {
        lesson: 2, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'A discussion states limits honestly and explains one surprise. A second discussion hides both. Which earns more trust, and why?',
        payload: {
          options: [
            'The second — flawless stories convince faster.',
            'The first — stated limits frame the claim as true-within-bounds, and a handled surprise proves the process was honest.',
            'Neither — discussions do not affect trust.',
          ],
          correct: 1,
          explanation: 'Correct. Transparency converts problems into credibility. Readers trust writers who show their work, including the warts.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Where does "the dye test caught two seal failures in twenty minutes" belong?',
        payload: {
          options: [
            'Results — it is an observation from the work.',
            'Introduction — it motivates the study.',
            'References — it needs a citation.',
          ],
          correct: 0,
          explanation: 'Correct. Observed outcomes live in Results. Interpretation of their value belongs in Discussion.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'A strong Discussion does which of these? Select ALL that apply.',
        payload: {
          options: [
            'Connects findings back to the research gap',
            'Compares with prior work',
            'Explains surprising results honestly',
            'Repeats the Results tables verbatim',
            'Admits limitations',
          ],
          correct: [0, 1, 2, 4],
          explanation: 'Correct. Interpret, compare, explain, limit. Repeating results adds pages, not meaning.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: the abstract should be written as one paragraph of 150–250 words covering purpose, method, result, and conclusion.',
        payload: {
          correct: true,
          explanation: 'True. The abstract is a miniature paper — a busy reader should trust the study from those lines alone.',
        },
      },
    ],
    tricks: [
      { title: 'Backwards read', body: 'Read conclusion → discussion → results → methods. Each step back must support the step forward.' },
      { title: 'One-job rule', body: 'Every paragraph gets exactly one section-job. Two jobs means split it.' },
      { title: 'Gap first', body: 'Write the gap sentence before anything else. No gap, no paper.' },
    ],
    mistakes: [
      { title: 'Template filling', body: 'Words in every heading, purpose in none. Learn jobs, not layouts.' },
      { title: 'Results with opinions', body: '"Clearly much better" smuggled into data reporting.' },
      { title: 'Conclusion creep', body: 'Six trials concluding for the whole planet. Scope must match evidence.' },
    ],
  },
  {
    slug: 'sources-citations',
    unit_number: 13,
    title: 'Sources, Citations & Integrity',
    description: 'Find, record, paraphrase, quote, and cite honestly — and understand exactly where plagiarism begins.',
    est_minutes: 35,
    video: {
      title: 'Unit 13 — Borrow Honestly',
      description: 'Citations, full references, quoting rules, and paraphrasing technique — plus the mistakes that trigger similarity-index trouble. (Video: Academic Carnival)',
      video_url: 'https://www.youtube.com/watch?v=xpyOcRqujIA',
      thumbnail_url: 'https://i.ytimg.com/vi/xpyOcRqujIA/hqdefault.jpg',
      duration_seconds: 240,
      transcript: '',
    },
    lessons: [
      {
        title: 'Use, copy, paraphrase, synthesize — the four lines',
        objective: 'Classify source use and paraphrase a passage genuinely.',
        body_md:
          'USING a source means its idea supports your point, with citation. COPYING means its words appear as yours — plagiarism, always.\n\n' +
          'PARAPHRASING rebuilds the idea in your own sentence structure with citation — same meaning, your words, your order. Swapping synonyms while keeping the skeleton is still copying.\n\n' +
          'SUMMARIZING compresses a whole work into its essence, cited. SYNTHESIZING combines several sources into your own conclusion, each cited — the highest form of source use.',
        examples: [
          {
            weak: 'Source: "Gravel pre-filters extended stable flow by reducing surface clogging." Student: "Gravel pre-filters prolonged steady flow by decreasing surface blockage." (Synonym swap, same skeleton — still copying.)',
            strong: 'Student: "Because clogging concentrates at the surface layer, a coarse first stage keeps flow stable longer (Author, year) — which is why our design opens with gravel." (Rebuilt structure, applied to the project, cited.)',
            why: 'The strong version thinks with the source instead of repainting it. New structure plus application plus citation equals genuine paraphrase.',
          },
        ],
      },
      {
        title: 'Notes, quotes, and killing accidental plagiarism',
        objective: 'Keep research notes that make accidental copying impossible.',
        body_md:
          'Record every source the day you read it: author, year, title, where published, pages, and the exact claim you took. Future-you will not remember; notes must.\n\n' +
          'In notes, mark every copied phrase with QUOTE + page number, and write your own reactions in a separate color or column. Accidental plagiarism is born the day quotes and thoughts mix unlabeled.\n\n' +
          'Quote sparingly (definitions, striking claims), paraphrase mostly, and cite everything that is not your own finding or common knowledge. When unsure whether to cite — cite.',
        examples: [
          {
            weak: 'Notes: pasted paragraph, no marks. Paper: lightly edited paste, no citation. Result: plagiarism neither planned nor noticed.',
            strong: 'Notes: "QUOTE p.4: ..." in one column, "MY TAKE: ..." in another. Paper: rebuilt argument with citation. Result: clean conscience, clean paper.',
            why: 'Systems beat intentions. Labeled notes make honest writing the default instead of a memory test months later.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Which is genuine paraphrasing?',
        payload: {
          options: [
            'Keeping the sentence order and swapping in synonyms.',
            'Rebuilding the idea in your own structure, applied to your point, with citation.',
            'Deleting every third word of the original.',
          ],
          correct: 1,
          explanation: 'Correct. New structure plus your application plus citation. The other two keep the author\u2019s skeleton — still copying.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Your notes mix copied phrases with your own thoughts, unlabeled. What is the risk?',
        payload: {
          options: [
            'None — you will remember which is which.',
            'Accidental plagiarism months later when the paste looks like your writing.',
            'Your paper will be too short.',
          ],
          correct: 1,
          explanation: 'Correct. Memory fades; labels do not. Mark quotes with page numbers and keep reactions separate, from day one.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which must be cited? Select ALL that apply.',
        payload: {
          options: [
            'A claim taken from a paper',
            'A paraphrased idea from a review',
            'Your own measured results',
            'A direct quotation',
            'General common knowledge ("water boils at 100°C at sea level")',
          ],
          correct: [0, 1, 3],
          explanation: 'Correct. Others\u2019 ideas in any form — plus direct quotes — need citations. Your own findings and common knowledge do not.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Rank these from weakest to strongest source use.',
        payload: {
          options: [
            'Copying → paraphrasing → summarizing → synthesizing.',
            'Synthesizing → summarizing → copying → paraphrasing.',
            'All forms are equal once cited.',
          ],
          correct: 0,
          explanation: 'Correct. Copying adds nothing; paraphrase restates; summary compresses; synthesis creates. Citation is required at every level — it does not equalize them.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: changing three words in a sentence makes it your own writing.',
        payload: {
          correct: false,
          explanation: 'False. Skeleton-preserving edits are still copying. Rebuild the structure, add your application, and cite.',
        },
      },
    ],
    tricks: [
      { title: 'Two-column notes', body: 'Left: labeled quotes with pages. Right: your reactions. Never mix.' },
      { title: 'Cite when unsure', body: 'The cost of an extra citation is zero; the cost of a missing one is everything.' },
      { title: 'Skeleton test', body: 'Cover the original. If your sentence follows its word order, rebuild it.' },
    ],
    mistakes: [
      { title: 'Synonym laundering', body: 'Same skeleton, new words — still plagiarism.' },
      { title: 'Mystery numbers', body: 'Statistics with no source. Every number has an origin; name it.' },
      { title: 'Citation amnesia', body: '"I will add citations later." Later never comes. Cite while writing.' },
    ],
  },
  {
    slug: 'results-discussion',
    unit_number: 14,
    title: 'Results, Discussion & Conclusion',
    description: 'Separate DATA from INTERPRETATION from CLAIM — and never conclude more than your evidence allows.',
    est_minutes: 35,
    video: {
      title: 'Unit 14 — Claim Only What You Proved',
      description: 'Results versus discussion: the four questions every figure must answer — why this analysis, what was found, why it matters, what it means — with a worked published example. (Video: Science Grad School Coach)',
      video_url: 'https://www.youtube.com/watch?v=eGfwE4ZuxmQ',
      thumbnail_url: 'https://i.ytimg.com/vi/eGfwE4ZuxmQ/hqdefault.jpg',
      duration_seconds: 228,
      transcript: '',
    },
    lessons: [
      {
        title: 'Data, interpretation, claim, overclaim',
        objective: 'Label sentences correctly and deflate overclaims to supported size.',
        body_md:
          'DATA: "Flow held at 1.1 L/min across six trials." Checkable, no judgment. INTERPRETATION: "The gravel layer prevented surface clogging." Your reading of the data — reasonable, arguable.\n\n' +
          'CLAIM: "Gravel pre-filtration keeps classroom drip lines flowing for ten-minute cycles." Supported if your trials match those conditions. OVERCLAIM: "…solves agricultural water scarcity." Nothing you measured touches continents.\n\n' +
          'Test every claim with: under what conditions, for whom, for how long, compared to what? Any unanswered question marks the overclaim boundary.',
        examples: [
          {
            weak: 'Data (six classroom trials) → Claim ("best solution for all farms everywhere"). The evidence lifts grams; the claim demands tons.',
            strong: 'Same data → "sufficient for our drip-line use case; field and long-term testing remain open." Scope matches evidence exactly.',
            why: 'Restrained claims signal strength because they show the writer knows what was and was not tested. Overclaiming signals the opposite.',
          },
        ],
      },
      {
        title: 'Discussing surprises and limits fairly',
        objective: 'Turn unexpected results and limitations into trust-builders.',
        body_md:
          'Surprises are gold: "Trial five clogged despite gravel — inspection showed leaves bypassing the intake screen." Explain honestly (bypass found), adjust (screen added), and report the fix. Graders reward surprises handled well more than smooth stories.\n\n' +
          'State limits before critics do: sample size, duration, instruments, conditions. "Six trials, classroom water, ten-minute windows" is not weakness — it is the frame that makes your claim true.\n\n' +
          'A discussion that admits limits and explains one surprise outscores a flawless story no one believes.',
        examples: [
          {
            weak: 'One failed trial silently dropped from the table; limits section empty. Reader trust: zero.',
            strong: 'Failed trial reported, cause found (bypassed screen), fix tested, limits listed. Reader trust: full — the conclusion is believed because the process was honest.',
            why: 'Transparency converts problems into credibility. Hidden problems convert everything into doubt.',
          },
        ],
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'single_choice', difficulty: 'medium', points: 1,
        prompt: 'Label this: "Gravel pre-filtration is the ultimate answer to global water scarcity." (Evidence: six classroom trials.)',
        payload: {
          options: ['Data', 'Interpretation', 'Claim', 'Overclaim'],
          correct: 3,
          explanation: 'Correct. Continents and "ultimate" from six trials — the evidence cannot lift this sentence. Deflate to classroom conditions.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'A trial failed unexpectedly and you found the cause. What earns the most trust?',
        payload: {
          options: [
            'Dropping that trial quietly from the results.',
            'Reporting it with the cause, the fix, and the retest outcome.',
            'Blaming the equipment supplier in the discussion.',
          ],
          correct: 1,
          explanation: 'Correct. Handled surprises become your best credibility evidence. Hidden ones poison everything around them once noticed.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which questions bound a claim honestly? Select ALL that apply.',
        payload: {
          options: ['Under what conditions?', 'For whom and for how long?', 'Compared to what?', 'How impressive does it sound?'],
          correct: [0, 1, 2],
          explanation: 'Correct. Conditions, scope, duration, and comparison draw the claim\u2019s true borders. Impressiveness draws nothing.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Which belongs in Discussion rather than Results?',
        payload: {
          options: [
            '"Mean flow: 1.1 L/min across six trials."',
            '"The pattern suggests clogging migrates downstream as each bottleneck clears, so future tests should run end-to-end after every fix."',
            '"Six trials were conducted in March."',
          ],
          correct: 1,
          explanation: 'Correct. Meaning, patterns, and recommendations interpret — Discussion work. Measurements and logistics report — Results work.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: stating limitations weakens your paper.',
        payload: {
          correct: false,
          explanation: 'False. Stated limits frame your claim as true-within-bounds. Hidden limits frame everything as suspect.',
        },
      },
    ],
    tricks: [
      { title: 'Scope stamp', body: 'End every conclusion with conditions: where, how long, compared to what.' },
      { title: 'Deflate test', body: 'Replace proves with suggests/shows-under-conditions. If nothing is lost, it was inflated.' },
      { title: 'Surprise bonus', body: 'One honestly handled surprise beats three smooth paragraphs for trust.' },
    ],
    mistakes: [
      { title: 'Continent claims', body: 'Classroom evidence, planetary conclusions.' },
      { title: 'Vanishing failures', body: 'Dropped trials that reappear as reader suspicion.' },
      { title: 'Discussion as repeat', body: 'Restating results instead of interpreting them.' },
    ],
  },
  {
    slug: 'revision-editing',
    unit_number: 15,
    title: 'Revision & Self-Editing',
    description: 'Revise in layers — answer, reasoning, evidence, structure, wording, mechanics — with the Review-My-Draft habit.',
    est_minutes: 30,
    video: {
      title: 'Unit 15 — Revise Like a Grader',
      description: 'Revision versus editing versus proofreading: content first, then sentences, then mechanics — with checklists for each layer. (Video: GC Writing Center)',
      video_url: 'https://www.youtube.com/watch?v=z_x8ZbsCU4c',
      thumbnail_url: 'https://i.ytimg.com/vi/z_x8ZbsCU4c/hqdefault.jpg',
      duration_seconds: 216,
      transcript: '',
    },
    lessons: [
      {
        title: 'The seven layers in order',
        objective: 'List the revision layers and explain why order matters.',
        body_md:
          '1. Does it answer the question? (All parts, right verbs.) 2. Is the reasoning clear? (A stranger could follow it.) 3. Is evidence present? (Checkable facts per claim.)\n\n' +
          '4. Is the explanation deep enough? (Past description to lesson and change.) 5. Is the structure logical? (Claim → evidence → explanation → connection.) 6. Is the wording precise? (Verbs carrying weight, fog removed.)\n\n' +
          '7. Are grammar and spelling affecting clarity? Fix mechanics LAST — only where they cloud meaning. A misplaced comma in a BLUE paragraph costs nothing; a missing evidence layer costs a level.',
        examples: [
          {
            weak: 'Revision session: fixed twelve commas, upgraded five adjectives. Draft still half-answers the question with zero evidence. Level unchanged.',
            strong: 'Same hour spent: added the missing second strategy with its trial numbers, inserted two because-sentences, cut one slogan paragraph. Level up, commas untouched.',
            why: 'Revision ROI follows the layer order. Meaning layers move levels; mechanics layers polish them.',
          },
        ],
      },
      {
        title: 'Review My Draft: the pre-submit ritual',
        objective: 'Run the BLUE CHECK ritual on a real draft before submitting.',
        body_md:
          'Open your draft with the ten BLUE CHECK boxes beside it (available on every journal writing screen). Check each box only with text highlighted as proof — a tick without highlighted evidence is theater.\n\n' +
          'Read the draft aloud once. Every stumble marks unclear reasoning; every yawn marks missing stakes. Fix stumbles first.\n\n' +
          'Finish with fresh-eyes tricks: change the font, read backwards paragraph by paragraph, or sleep on it. Familiarity hides flaws; strangeness reveals them.',
        examples: [
          {
            weak: 'Submitted after a spellcheck. Feedback: half the question unanswered — a layer-1 failure no spellchecker can see.',
            strong: 'Submitted after ten checked boxes with highlighted proof plus one read-aloud pass. Feedback confirms the predicted strong points.',
            why: 'The ritual converts hope into verification. Use the widget below on your next draft — for real, not as a demo.',
          },
        ],
        widget: 'blue_check',
      },
    ],
    items: [
      {
        lesson: 0, quiz: false, kind: 'order_steps', difficulty: 'easy', points: 1,
        prompt: 'Order the first three revision layers.',
        payload: {
          steps: ['Does it answer the question?', 'Is the reasoning clear?', 'Is evidence present?'],
          explanation: 'Correct. Answer first, then reasoning, then evidence — meaning before everything else.',
        },
      },
      {
        lesson: 1, quiz: false, kind: 'single_choice', difficulty: 'easy', points: 1,
        prompt: 'Why do mechanics come last?',
        payload: {
          options: [
            'Grammar never matters in academic writing.',
            'Polishing wording before fixing meaning shines the error instead of removing it.',
            'Graders cannot see spelling mistakes.',
          ],
          correct: 1,
          explanation: 'Correct. Fix what moves levels first. Polish only the meaning that survives.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'single_choice', difficulty: 'medium', points: 2,
        prompt: 'Two students revise for one hour. Who improves more?',
        payload: {
          options: [
            'A: fixes spelling, upgrades vocabulary, reformats headings.',
            'B: adds the missing question part with evidence, inserts because-sentences, cuts one slogan.',
          ],
          correct: 1,
          explanation: 'Correct. B works the meaning layers that decide levels. A polishes a draft that still fails them.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'multi_select', difficulty: 'medium', points: 2,
        prompt: 'Which belong in a real pre-submit ritual? Select ALL that apply.',
        payload: {
          options: [
            'Tick each checklist box only with highlighted proof text',
            'Read the draft aloud once',
            'Verify every question part is answered',
            'Change the font color to look academic',
          ],
          correct: [0, 1, 2],
          explanation: 'Correct. Proof-backed checks, read-aloud, and coverage verification. Cosmetics never moved a level.',
        },
      },
      {
        lesson: null, quiz: true, kind: 'true_false', difficulty: 'easy', points: 1,
        prompt: 'True or false: revision means correcting grammar and spelling.',
        payload: {
          correct: false,
          explanation: 'False. That is the last of seven layers. Revision is re-seeing: answer, reasoning, evidence, depth, structure, wording — then mechanics.',
        },
      },
    ],
    tricks: [
      { title: 'Proof-backed ticks', body: 'No highlighted text, no tick. Checklists without evidence are theater.' },
      { title: 'Read aloud', body: 'Stumbles mark unclear reasoning; yawns mark missing stakes.' },
      { title: 'Stranger eyes', body: 'Change the font or sleep on it. Familiarity hides flaws.' },
    ],
    mistakes: [
      { title: 'Comma-first revision', body: 'Perfect punctuation on a half-answered, evidence-free draft.' },
      { title: 'Adjective upgrades', body: 'New decorations on old claims. Levels do not move.' },
      { title: 'One-pass hope', body: 'Submitting the first draft with a prayer instead of layers.' },
    ],
  },
];
