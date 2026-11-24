import { Category } from '../lib/rubric';

// Volume 4: +40 transfer questions for G11 S1, one new LO batch per pair.
// Every LO below is quoted from the actual G11 subject documents in the
// project path (see lotext logs) — no LO content invented. All questions tie
// the LO to the Smart Sustainable Food Packaging challenge.
// source='practice' ALWAYS.
type Difficulty = 'easy' | 'medium' | 'hard';
interface Comp { key: string; label: string; keywords: string[] }
export interface PackQ4 {
  category: Category;
  question_text: string;
  what_testing: string;
  difficulty: Difficulty;
  required_components: Comp[];
  source: 'practice';
  source_label: string;
  tags: string[];
  scope: {
    grade: 11; semester: 1; school_year: string; question_number: number;
    question_slot: number; question_type: string; learning_objectives: string[];
  };
}

const LBL = 'Practice · G11 S1';
const SY = '2026–2027';
function sc(slot: number, jn: number, los: string[]) {
  return { grade: 11 as const, semester: 1 as const, school_year: SY, question_number: jn, question_slot: slot, question_type: 'LEARNING_TRANSFER', learning_objectives: los };
}
function C(key: string, label: string, keywords: string[]): Comp { return { key, label, keywords }; }

export const PRACTICE_PACK_VOLUME_4: PackQ4[] = [
  // ---- CH.2.02: aqueous solutions, dissolved substances ----
  {
    category: 'learning_transfer',
    question_text: 'Through (CH.2.02), compare the wash water from three sources (tap, filtered, distilled) by the dissolved substances each carries. Predict which leaves the most residue on natural fibers and explain how you would test the prediction.',
    what_testing: 'Dissolved-substance reasoning across water sources with a test.',
    difficulty: 'medium',
    required_components: [
      C('source_contents', 'State what each water source carries dissolved', ['tap', 'minerals', 'distilled', 'pure', 'filtered', 'dissolved', 'salts']),
      C('prediction', 'Predict the residue ranking with chemistry reasons', ['most', 'residue', 'deposit', 'predict', 'because', 'evaporate']),
      C('test', 'Design the residue comparison test', ['dry', 'weigh', 'compare', 'dish', 'test', 'residue']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'water'],
    scope: sc(3, 1, ['CH.2.02']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (CH.2.02), explain where dissolved substances in your prototype\u2019s environment come from (air dust, hands, water, food itself) and which source most threatens your readings. Propose one control for it.',
    what_testing: 'Environmental-source audit of contamination with a control.',
    difficulty: 'hard',
    required_components: [
      C('sources', 'List the dissolved-substance sources around the test', ['dust', 'hands', 'water', 'food', 'sources', 'air']),
      C('biggest_threat', 'Name the biggest threat to readings with reasons', ['threatens', 'readings', 'most', 'interfere', 'because', 'threat']),
      C('control', 'Propose one concrete control', ['cover', 'gloves', 'rinse', 'control', 'reduce', 'one']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'contamination'],
    scope: sc(4, 1, ['CH.2.02']),
  },
  // ---- CH.2.03: acids, bases, salts ----
  {
    category: 'learning_transfer',
    question_text: 'Through (CH.2.03), explain how you would prepare a set of reference salt solutions to check your pH-based indicator. Include the acid-base reasoning for choosing the pH points.',
    what_testing: 'Salt/acid-base preparation reasoning for calibration.',
    difficulty: 'hard',
    required_components: [
      C('points', 'Choose the pH points with acid-base reasons', ['acidic', 'neutral', 'basic', 'points', 'range', 'food', 'chose']),
      C('preparation', 'Describe the preparation approach', ['dilute', 'vinegar', 'baking soda', 'prepare', 'solutions', 'mix']),
      C('use_link', 'Explain how the set calibrates the indicator', ['compare', 'colors', 'scale', 'reference', 'calibrate', 'match']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'calibration'],
    scope: sc(3, 2, ['CH.2.03']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (CH.2.03), predict what happens when an acidic food (e.g., citrus or tomato) contacts your natural-pigment indicator directly. Explain the acid-base interaction and what design rule follows.',
    what_testing: 'Acid-pigment interaction prediction with a design rule.',
    difficulty: 'medium',
    required_components: [
      C('interaction', 'Explain the acid-pigment interaction', ['acid', 'protonates', 'shifts', 'color', 'pigment', 'reacts']),
      C('consequence', 'State the consequence for readings', ['false', 'misread', 'shifted', 'wrong', 'signal', 'consequence']),
      C('rule', 'Give the design rule that follows', ['separate', 'barrier', 'rule', 'never', 'contact', 'design']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'indicator'],
    scope: sc(4, 2, ['CH.2.03']),
  },
  // ---- CH.2.05: catalysts and rates ----
  {
    category: 'learning_transfer',
    question_text: 'Through (CH.2.05), explain spoilage as a catalyzed process: which biological catalysts accelerate it, and what would slowing them require in packaging terms? Propose one testable intervention.',
    what_testing: 'Catalysis framing of spoilage with a testable intervention.',
    difficulty: 'hard',
    required_components: [
      C('catalysts', 'Name the biological catalysts at work', ['enzymes', 'catalysts', 'accelerate', 'microbes', 'speed', 'spoilage']),
      C('slowing_terms', 'Translate slowing into packaging terms', ['cold', 'dry', 'seal', 'slow', 'terms', 'package']),
      C('intervention', 'Propose one testable intervention', ['test', 'compare', 'lower', 'measure', 'intervene', 'prove']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'catalysis'],
    scope: sc(3, 3, ['CH.2.05']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (CH.2.05), design the experiment that finds which variable (temperature, moisture, or light) most affects your food\u2019s deterioration rate. Hold two constant, vary one, and state how you compare rates fairly.',
    what_testing: 'Rate-variable isolation design with fair comparison.',
    difficulty: 'hard',
    required_components: [
      C('design', 'Design the three-condition comparison', ['hold', 'vary', 'conditions', 'same', 'design', 'compare']),
      C('rate_measure', 'State how each rate is measured', ['rate', 'days', 'mass', 'color', 'measure', 'per day']),
      C('winner_rule', 'Give the rule for declaring the biggest driver', ['biggest', 'steepest', 'wins', 'declare', 'rule', 'compare']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'rates'],
    scope: sc(4, 3, ['CH.2.05']),
  },
  // ---- CH.2.06: equilibrium, Le Chatelier ----
  {
    category: 'learning_transfer',
    question_text: 'Through (CH.2.06), treat package humidity as a dynamic equilibrium between food moisture release and wall absorption. Predict what happens when temperature rises, using Le Chatelier-style reasoning, and say how you would verify it.',
    what_testing: 'Equilibrium-shift reasoning applied to package humidity.',
    difficulty: 'hard',
    required_components: [
      C('equilibrium', 'Describe the humidity equilibrium', ['balance', 'release', 'absorb', 'steady', 'equilibrium', 'moisture']),
      C('shift', 'Predict the temperature-rise shift', ['rises', 'shifts', 'more', 'condense', 'predict', 'heat']),
      C('verify', 'State the verification readings', ['measure', 'humidity', 'droplets', 'verify', 'compare', 'readings']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'equilibrium'],
    scope: sc(3, 4, ['CH.2.06']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (CH.2.06), explain why opening the package to check the food "resets" the preservation experiment. Frame it as disturbing an equilibrium and state what must restart afterward.',
    what_testing: 'Equilibrium-disturbance framing of the no-opening rule.',
    difficulty: 'medium',
    required_components: [
      C('disturbance', 'Explain the equilibrium disturbed by opening', ['oxygen', 'moisture', 'rushes', 'disturb', 'balance', 'opening']),
      C('reset_cost', 'State what the reset costs the experiment', ['restart', 'clock', 'invalid', 'cost', 'days', 'reset']),
      C('rule', 'Give the team rule that follows', ['never', 'window', 'rule', 'observe', 'instead', 'team']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'chemistry', 'equilibrium'],
    scope: sc(4, 4, ['CH.2.06']),
  },
  // ---- PH.2.03: voltage and current ----
  {
    category: 'learning_transfer',
    question_text: 'Through (PH.2.03), your team adds a small fan for air circulation. Calculate the voltage, current, and power needs, and explain why an undersized supply ruins the experiment\u2019s consistency.',
    what_testing: 'Circuit quantities computed for a real prototype need.',
    difficulty: 'medium',
    required_components: [
      C('needs', 'State voltage, current, and power needs', ['volts', 'amps', 'watts', 'needs', 'fan', 'calculate']),
      C('consistency_link', 'Link power stability to consistency', ['stable', 'fluctuate', 'vary', 'consistency', 'supply', 'same']),
      C('undersize_cost', 'Explain the undersupply failure mode', ['stall', 'weak', 'die', 'ruin', 'undersized', 'fail']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'physics', 'circuits'],
    scope: sc(3, 5, ['PH.2.03']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (PH.2.03), explain the safety reasoning for battery-powered parts at exhibition: what voltages are safe to touch, what must be insulated, and how you prove it to a teacher.',
    what_testing: 'Electrical safety reasoning with a proof plan.',
    difficulty: 'easy',
    required_components: [
      C('safe_levels', 'State safe touch voltages and why', ['low', 'volts', 'safe', 'touch', 'battery', 'levels']),
      C('insulate_what', 'Name what must be insulated', ['exposed', 'wires', 'terminals', 'insulate', 'tape', 'cover']),
      C('proof', 'Describe proving safety to a teacher', ['demonstrate', 'meter', 'show', 'prove', 'teacher', 'check']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'physics', 'safety'],
    scope: sc(4, 5, ['PH.2.03']),
  },
  // ---- PH.2.04: DC circuits ----
  {
    category: 'learning_transfer',
    question_text: 'Through (PH.2.04), design the simple circuit that lights an LED when your indicator reaches the "replace" color: sensor, threshold, and output. Explain each block\u2019s job in circuit terms.',
    what_testing: 'Sensor-threshold-output circuit design explained functionally.',
    difficulty: 'hard',
    required_components: [
      C('blocks', 'Describe sensor, threshold, and output blocks', ['sensor', 'resistor', 'threshold', 'led', 'blocks', 'circuit']),
      C('jobs', 'Explain each block\u2019s electrical job', ['divides', 'switches', 'lights', 'current', 'job', 'voltage']),
      C('calibration_link', 'Link the threshold to your color scale', ['matches', 'color', 'tuned', 'scale', 'threshold', 'link']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'physics', 'circuits'],
    scope: sc(3, 1, ['PH.2.04']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (PH.2.04), your sensor readings drift as the battery drains. Explain the circuit reason and propose two fixes — one electrical, one procedural.',
    what_testing: 'Supply-drift diagnosis with two-domain fixes.',
    difficulty: 'hard',
    required_components: [
      C('reason', 'Explain the drift electrically', ['drains', 'voltage', 'drops', 'reference', 'drift', 'supply']),
      C('electrical_fix', 'Propose the electrical fix', ['regulator', 'fresh', 'stable', 'fix', 'circuit', 'reference']),
      C('procedural_fix', 'Propose the procedural fix', ['recalibrate', 'schedule', 'replace', 'log', 'procedure', 'routine']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'physics', 'drift'],
    scope: sc(4, 1, ['PH.2.04']),
  },
  // ---- BI.2.03: DNA replication ----
  {
    category: 'learning_transfer',
    question_text: 'Through (BI.2.03), explain why identifying a spoilage microbe by its DNA is more reliable than by how the colony looks. Connect replication fidelity to why cultures change over your 5-day test.',
    what_testing: 'DNA-identity reasoning versus appearance, plus culture drift.',
    difficulty: 'hard',
    required_components: [
      C('dna_reliability', 'Explain DNA-based identification reliability', ['dna', 'sequence', 'unique', 'reliable', 'identify', 'code']),
      C('appearance_limits', 'Explain the limits of look-based ID', ['looks', 'similar', 'mislead', 'colony', 'limits', 'appearance']),
      C('drift', 'Connect replication errors to culture change', ['mutate', 'copy', 'errors', 'change', 'replicate', 'drift']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'biology', 'dna'],
    scope: sc(3, 2, ['BI.2.03']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (BI.2.03), explain base-pairing fidelity as an information story, then analogize it to your measurement records: what is your project\u2019s "mutation rate," and how do you lower it?',
    what_testing: 'Fidelity analogy transferred to data quality.',
    difficulty: 'medium',
    required_components: [
      C('fidelity_story', 'Tell the base-pairing fidelity story', ['pairs', 'copy', 'accurate', 'errors', 'fidelity', 'dna']),
      C('analogy', 'Map it onto your records', ['records', 'copy', 'errors', 'transcribe', 'analogy', 'like']),
      C('lowering', 'State how you lower your mutation rate', ['double', 'check', 'photos', 'lower', 'verify', 'rule']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'biology', 'fidelity'],
    scope: sc(4, 2, ['BI.2.03']),
  },
  // ---- BI.2.10: fossil evidence ----
  {
    category: 'learning_transfer',
    question_text: 'Through (BI.2.10), paleontologists infer whole animals from fragments. Explain how that evidence logic mirrors reading your prototype\u2019s fate from partial readings — and where the mirror breaks.',
    what_testing: 'Fragment-to-whole inference compared across domains.',
    difficulty: 'hard',
    required_components: [
      C('fossil_logic', 'Explain fragment-based inference', ['fragments', 'infer', 'reconstruct', 'fossil', 'evidence', 'whole']),
      C('mirror', 'Mirror it onto your partial readings', ['partial', 'readings', 'infer', 'trend', 'mirror', 'prototype']),
      C('break_point', 'State where the analogy breaks', ['breaks', 'unlike', 'controlled', 'limit', 'analogy', 'differs']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'biology', 'evidence'],
    scope: sc(3, 3, ['BI.2.10']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (BI.2.10), apply selection thinking to your preservation: if your package kills 90% of microbes but not all, what evolves in the survivors over repeated use — and what design answer follows?',
    what_testing: 'Selection-pressure reasoning about preservation limits.',
    difficulty: 'hard',
    required_components: [
      C('selection', 'Explain the selection effect', ['survive', 'resistant', 'select', 'multiply', 'pressure', 'evolve']),
      C('consequence', 'State the consequence for reuse', ['reuse', 'weaker', 'adapted', 'consequence', 'over time', 'fails']),
      C('design_answer', 'Give the design answer', ['rotate', 'combine', 'multi-hurdle', 'answer', 'design', 'therefore']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'biology', 'evolution'],
    scope: sc(4, 3, ['BI.2.10']),
  },
  // ---- BI.2.14: biodiversity and human impact ----
  {
    category: 'learning_transfer',
    question_text: 'Through (BI.2.14), assess your material sourcing against biodiversity: what habitat or species could your harvest affect, and what sourcing rule would a biodiversity-minded team adopt?',
    what_testing: 'Sourcing impact assessment with a team rule.',
    difficulty: 'medium',
    required_components: [
      C('impact_path', 'Trace harvest to habitat impact', ['harvest', 'habitat', 'species', 'affect', 'clear', 'impact']),
      C('rule', 'State the biodiversity sourcing rule', ['rule', 'waste-first', 'certified', 'avoid', 'adopt', 'source']),
      C('check', 'Explain how you verify compliance', ['verify', 'ask', 'supplier', 'check', 'prove', 'comply']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'biology', 'biodiversity'],
    scope: sc(3, 4, ['BI.2.14']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (BI.2.14), argue whether 200 students switching to your wrapper helps or harms local biodiversity overall. Count both the plastic avoided and the harvest pressure added.',
    what_testing: 'Net-biodiversity accounting with both sides.',
    difficulty: 'hard',
    required_components: [
      C('avoided_harm', 'Quantify the plastic harm avoided', ['plastic', 'avoided', 'litter', 'harm', 'less', 'quantify']),
      C('added_pressure', 'Quantify the harvest pressure added', ['harvest', 'pressure', 'acres', 'demand', 'added', 'scale']),
      C('net_verdict', 'Deliver the net verdict with conditions', ['net', 'if', 'verdict', 'depends', 'overall', 'conclude']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'biology', 'impact'],
    scope: sc(4, 4, ['BI.2.14']),
  },
  // ---- MA.2.05: probability ----
  {
    category: 'learning_transfer',
    question_text: 'Through (MA.2.05), your seal test passes 4 of 5 trials. What is the chance the next one fails, and what does that probability mean — and NOT mean — for exhibition confidence?',
    what_testing: 'Small-sample probability interpretation with limits.',
    difficulty: 'medium',
    required_components: [
      C('estimate', 'Estimate the failure chance from data', ['one', 'five', '20%', 'estimate', 'chance', 'data']),
      C('meaning', 'State what the number means', ['means', 'long-run', 'expect', 'likely', 'interpret', 'probability']),
      C('not_meaning', 'State what it does NOT mean', ['guarantee', 'not mean', 'could', 'still', 'limits', 'warn']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'math', 'probability'],
    scope: sc(3, 5, ['MA.2.05']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (MA.2.05), compute the expected number of spoiled samples out of 30 if each has an independent 10% daily spoilage chance over 5 days. Show the tree or complement reasoning and the assumptions.',
    what_testing: 'Expected-value computation with stated assumptions.',
    difficulty: 'hard',
    required_components: [
      C('setup', 'Set up the probability model', ['independent', '10%', 'daily', 'model', 'setup', 'assume']),
      C('computation', 'Compute via complement or tree', ['complement', 'multiply', 'expected', 'compute', 'tree', 'steps']),
      C('assumptions', 'Name the load-bearing assumptions', ['assume', 'independent', 'same', 'breaks', 'assumptions', 'if']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'math', 'probability'],
    scope: sc(4, 5, ['MA.2.05']),
  },
  // ---- MA.2.07: derivatives ----
  {
    category: 'learning_transfer',
    question_text: 'Through (MA.2.07), use your 0–120 h mass readings to estimate the instantaneous spoilage rate at 72 h. Explain the difference-quotient idea in words and why the estimate is rough.',
    what_testing: 'Derivative-as-rate applied to own data with honesty.',
    difficulty: 'hard',
    required_components: [
      C('idea', 'Explain the difference quotient in words', ['slope', 'between', 'change', 'divide', 'idea', 'rate']),
      C('estimate', 'Compute the 72 h estimate from neighbors', ['48', '96', 'difference', 'per hour', 'estimate', 'compute']),
      C('roughness', 'Explain why it is rough', ['rough', 'sparse', 'noisy', 'approximate', 'only', 'warn']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'math', 'derivatives'],
    scope: sc(3, 1, ['MA.2.07']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (MA.2.07), find when your preservation benefit grows fastest: compare early-day vs late-day slopes of prototype-minus-control and explain what the maximum slope tells the team.',
    what_testing: 'Comparative slope analysis driving a team insight.',
    difficulty: 'hard',
    required_components: [
      C('slopes', 'Compute early and late slopes', ['early', 'late', 'slope', 'difference', 'compute', 'per day']),
      C('comparison', 'Compare and locate the fastest growth', ['faster', 'grows', 'peak', 'compare', 'maximum', 'where']),
      C('insight', 'State the team insight from the max slope', ['means', 'window', 'critical', 'insight', 'tells', 'act']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'math', 'rates'],
    scope: sc(4, 1, ['MA.2.07']),
  },
  // ---- MA.2.09: quadratics ----
  {
    category: 'learning_transfer',
    question_text: 'Through (MA.2.09), fit a quadratic to three of your readings and find its vertex. What does the vertex mean in project terms, and why should you distrust predictions far from your data?',
    what_testing: 'Quadratic modeling with vertex interpretation and limits.',
    difficulty: 'hard',
    required_components: [
      C('fit', 'Fit the quadratic to three readings', ['points', 'fit', 'parabola', 'solve', 'coefficients', 'three']),
      C('vertex_meaning', 'Interpret the vertex in project terms', ['vertex', 'peak', 'maximum', 'means', 'spoilage', 'point']),
      C('distrust', 'Explain extrapolation distrust', ['beyond', 'distrust', 'curve', 'real', 'extrapolate', 'warn']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'math', 'quadratics'],
    scope: sc(3, 2, ['MA.2.09']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (MA.2.09), explain first and second differences to a teammate using your own reading series, then use them to argue whether your trend is linear, accelerating, or neither.',
    what_testing: 'Finite-differences analysis taught through own data.',
    difficulty: 'medium',
    required_components: [
      C('differences', 'Compute first and second differences', ['subtract', 'differences', 'first', 'second', 'compute', 'series']),
      C('teaching', 'Explain what each difference reveals', ['constant', 'change', 'reveals', 'linear', 'accelerating', 'teach']),
      C('verdict', 'Deliver the trend verdict', ['trend', 'linear', 'neither', 'verdict', 'data', 'conclude']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'math', 'differences'],
    scope: sc(4, 2, ['MA.2.09']),
  },
  // ---- ES.2.02: aqueous solutions (environment) ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ES.2.02), trace the dissolved substances in your local tap water to their environmental sources (pipes, soil, treatment). Which source most likely affects natural-fiber packaging, and how would you test that link?',
    what_testing: 'Source-to-effect tracing with a testable link.',
    difficulty: 'medium',
    required_components: [
      C('sources', 'Trace tap-water substances to sources', ['pipes', 'soil', 'treatment', 'minerals', 'sources', 'trace']),
      C('top_threat', 'Name the top packaging threat with reasons', ['fiber', 'weaken', 'deposit', 'threat', 'most', 'because']),
      C('link_test', 'Design the link-testing comparison', ['soak', 'compare', 'strength', 'test', 'link', 'prove']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'water'],
    scope: sc(3, 3, ['ES.2.02']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ES.2.02), your wash step uses 2 L per prototype. Scale that to a classroom producing 30 prototypes and propose two concrete conservation measures with estimated savings.',
    what_testing: 'Water-use scaling with quantified conservation.',
    difficulty: 'medium',
    required_components: [
      C('scale', 'Scale the usage to classroom level', ['liters', 'thirty', 'total', 'scale', 'multiply', 'classroom']),
      C('measures', 'Propose two concrete measures', ['reuse', 'rinse', 'catch', 'measures', 'two', 'concrete']),
      C('savings', 'Estimate savings for each', ['save', 'percent', 'liters', 'estimate', 'each', 'savings']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'conservation'],
    scope: sc(4, 3, ['ES.2.02']),
  },
  // ---- ES.2.03: water resources ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ES.2.03), place your project\u2019s water use inside Egypt\u2019s freshwater picture: which reservoir would supply it, who shares that reservoir, and what conservation duty follows?',
    what_testing: 'Local-to-national water reasoning with a duty.',
    difficulty: 'medium',
    required_components: [
      C('reservoir', 'Name the supplying reservoir and sharers', ['nile', 'groundwater', 'shares', 'farmers', 'city', 'reservoir']),
      C('share_logic', 'Explain your share\u2019s significance honestly', ['tiny', 'still', 'counts', 'share', 'honest', 'significance']),
      C('duty', 'State the conservation duty that follows', ['duty', 'conserve', 'reuse', 'minimize', 'therefore', 'must']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'water'],
    scope: sc(3, 4, ['ES.2.03']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ES.2.03), evaluate drip versus flood thinking for your prototype\u2019s water needs: where can a "drip" (precise, minimal) approach replace a "flood" (generous, wasteful) one in your protocol?',
    what_testing: 'Precision-frugality audit of a wet protocol.',
    difficulty: 'easy',
    required_components: [
      C('floods', 'Find the flood steps in your protocol', ['excess', 'running', 'soak', 'flood', 'waste', 'steps']),
      C('drips', 'Convert two steps to drip equivalents', ['spray', 'measured', 'milliliters', 'convert', 'drip', 'two']),
      C('savings_claim', 'Claim the total saving honestly', ['save', 'total', 'honest', 'about', 'claim', 'liters']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'frugality'],
    scope: sc(4, 4, ['ES.2.03']),
  },
  // ---- ES.2.05: drainage basins ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ES.2.05), draw your project as a drainage basin: inputs flow in, processes channel them, outputs drain out. Label the divides, then name what "floods" when the team is overloaded.',
    what_testing: 'Systems mapping with overload diagnosis.',
    difficulty: 'medium',
    required_components: [
      C('basin_map', 'Map inputs, channels, and outputs', ['inputs', 'tasks', 'flow', 'outputs', 'basin', 'map']),
      C('divides', 'Label the team\u2019s divides', ['divides', 'roles', 'separate', 'bounds', 'label', 'streams']),
      C('flood', 'Name the overload flood and its fix', ['flood', 'overload', 'spills', 'missed', 'fix', 'channel']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'systems'],
    scope: sc(3, 5, ['ES.2.05']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ES.2.05) structure-function thinking: a river\u2019s form fits its function. Analyze your package the same way — which feature\u2019s form best fits its function, and which is merely inherited habit?',
    what_testing: 'Structure-function audit separating fit from habit.',
    difficulty: 'hard',
    required_components: [
      C('best_fit', 'Defend the best form-function fit', ['fits', 'shape', 'serves', 'seal', 'curve', 'best']),
      C('habit_part', 'Expose one inherited-habit feature', ['habit', 'copied', 'always', 'inherited', 'never', 'questioned']),
      C('redesign', 'Propose the habit feature\u2019s redesign', ['redesign', 'instead', 'fit', 'purpose', 'propose', 'change']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'design'],
    scope: sc(4, 5, ['ES.2.05']),
  },
  // ---- ES.2.06: rivers and communities ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ES.2.06), communities adapt to their river\u2019s behavior. Explain how your team adapted its testing to the school\u2019s "river" — its schedules, spaces, and rules — with two concrete adaptations.',
    what_testing: 'Institutional adaptation with concrete examples.',
    difficulty: 'easy',
    required_components: [
      C('river', 'Describe the school\u2019s constraints as a river', ['schedule', 'rooms', 'rules', 'flow', 'constraints', 'river']),
      C('adapt_one', 'Give the first adaptation', ['moved', 'timed', 'asked', 'adapted', 'first', 'changed']),
      C('adapt_two', 'Give the second adaptation', ['second', 'also', 'stored', 'split', 'adapted', 'another']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'adaptation'],
    scope: sc(3, 1, ['ES.2.06']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ES.2.06) slope-velocity skills, explain how you would measure whether your package "flows" well through a real supply chain: define the slope, the velocity, and the sediment (delays) in your analogy carefully.',
    what_testing: 'Analogy discipline: mapping slope/velocity/sediment to logistics.',
    difficulty: 'hard',
    required_components: [
      C('mapping', 'Map slope, velocity, and sediment precisely', ['slope', 'difficulty', 'velocity', 'speed', 'sediment', 'delays']),
      C('measure', 'Explain how each is measured in reality', ['measure', 'days', 'count', 'track', 'real', 'metric']),
      C('limits', 'State where the analogy breaks', ['breaks', 'unlike', 'limits', 'rivers', 'boxes', 'honest']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'earth_science', 'analogy'],
    scope: sc(4, 1, ['ES.2.06']),
  },
  // ---- CS.2.07: experimental design ----
  {
    category: 'learning_transfer',
    question_text: 'Through (CS.2.07), design a qualitative analysis that identifies an unknown white powder found near your materials bench. Give the decision tree: first test, branch on result, confirm at the end.',
    what_testing: 'Qualitative-analysis decision tree design.',
    difficulty: 'hard',
    required_components: [
      C('first_test', 'State the first test and why first', ['first', 'flame', 'solubility', 'test', 'because', 'screen']),
      C('branches', 'Branch on both possible results', ['if', 'positive', 'negative', 'then', 'branches', 'next']),
      C('confirm', 'Give the final confirmation', ['confirm', 'conclude', 'identify', 'final', 'prove', 'match']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'cs', 'analysis'],
    scope: sc(3, 2, ['CS.2.07']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (CS.2.07) composition-from-structure thinking, predict one property of your layered wall from its structure alone (before testing), then state how the test confirmed or embarrassed the prediction.',
    what_testing: 'Structure-to-property prediction with a scorecard.',
    difficulty: 'medium',
    required_components: [
      C('prediction', 'Predict from structure before testing', ['predict', 'layers', 'should', 'because', 'structure', 'before']),
      C('test_result', 'Report what the test actually showed', ['tested', 'showed', 'measured', 'actual', 'result', 'found']),
      C('scorecard', 'Score the prediction honestly', ['right', 'wrong', 'partly', 'score', 'honest', 'embarrassed']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'cs', 'prediction'],
    scope: sc(4, 2, ['CS.2.07']),
  },
  // ---- ME.2.01: friction ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ME.2.01), analyze every sliding contact in your prototype and test setup (lids, stacked boxes, phone on table for photos). Which friction helps you, which hurts, and what did you change?',
    what_testing: 'Friction audit across the whole workflow.',
    difficulty: 'medium',
    required_components: [
      C('contacts', 'List the sliding contacts', ['slides', 'lid', 'stack', 'phone', 'contacts', 'list']),
      C('help_hurt', 'Sort each as helping or hurting with reasons', ['helps', 'grip', 'hurts', 'sticks', 'sort', 'because']),
      C('change', 'State one friction change made', ['added', 'reduced', 'felt', 'changed', 'tape', 'grip']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'mechanics', 'friction'],
    scope: sc(3, 3, ['ME.2.01']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ME.2.01) inclined-plane thinking, design a 5-minute test that compares the slipperiness of two candidate sealing surfaces. Specify angle control, the slip criterion, and repetitions.',
    what_testing: 'Inclined-plane comparison designed completely.',
    difficulty: 'medium',
    required_components: [
      C('setup', 'Describe the ramp setup and angle control', ['ramp', 'angle', 'raise', 'same', 'setup', 'incline']),
      C('criterion', 'Define the slip criterion precisely', ['slips', 'moves', 'criterion', 'starts', 'define', 'moment']),
      C('reps', 'State repetitions and decision rule', ['three', 'repeat', 'average', 'wins', 'rule', 'decide']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'mechanics', 'experiment'],
    scope: sc(4, 3, ['ME.2.01']),
  },
  // ---- ME.2.02: work via dot product ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ME.2.02), compute the work your team does pressing a seal shut: estimate force, distance, and angle, then explain why pressing straight down beats pressing at an angle.',
    what_testing: 'Work computation with the angle insight.',
    difficulty: 'medium',
    required_components: [
      C('estimate', 'Estimate force, distance, and angle', ['newtons', 'centimeters', 'angle', 'estimate', 'press', 'guess']),
      C('compute', 'Compute the work with the dot product idea', ['multiply', 'cosine', 'joules', 'compute', 'work', 'dot']),
      C('straight_win', 'Explain the straight-down advantage', ['straight', 'full', 'wasted', 'angle', 'wins', 'because']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'mechanics', 'work'],
    scope: sc(3, 4, ['ME.2.02']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ME.2.02), compare carrying prototypes across school by hand versus on a cart: where does the work go in each case, and which costs the team more energy over exhibition week?',
    what_testing: 'Work accounting across transport options.',
    difficulty: 'easy',
    required_components: [
      C('hand_work', 'Account the hand-carry work', ['lift', 'hold', 'stairs', 'arms', 'work', 'carry']),
      C('cart_work', 'Account the cart work', ['push', 'roll', 'friction', 'cart', 'less', 'work']),
      C('week_verdict', 'Deliver the exhibition-week verdict', ['week', 'trips', 'tired', 'verdict', 'choose', 'total']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'mechanics', 'energy'],
    scope: sc(4, 4, ['ME.2.02']),
  },
  // ---- ME.2.03: work-energy theorem ----
  {
    category: 'learning_transfer',
    question_text: 'Through (ME.2.03), your drop test lets a 200 g prototype fall 1 m onto tile. Predict the impact energy, explain where it goes (crack, bounce, heat), and state what survival proves about the design.',
    what_testing: 'Drop-test energy prediction with dissipation accounting.',
    difficulty: 'hard',
    required_components: [
      C('predict', 'Predict the impact energy with math', ['mgh', 'joules', 'grams', 'meter', 'predict', 'compute']),
      C('sinks', 'Trace where the energy goes', ['crack', 'bounce', 'heat', 'deform', 'goes', 'sinks']),
      C('proof', 'State what survival proves and does not prove', ['proves', 'survived', 'strength', 'not prove', 'drop', 'claim']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'mechanics', 'energy'],
    scope: sc(3, 5, ['ME.2.03']),
  },
  {
    category: 'learning_transfer',
    question_text: 'Using (ME.2.03), explain why a heavier package is not automatically sturdier: separate mass, structural design, and material strength with one example where light beat heavy in your experience.',
    what_testing: 'Mass-vs-design disentanglement with an example.',
    difficulty: 'medium',
    required_components: [
      C('separation', 'Separate the three factors clearly', ['mass', 'design', 'material', 'separate', 'heavy', 'factors']),
      C('example', 'Give the light-beats-heavy example', ['lighter', 'held', 'heavier', 'broke', 'example', 'beat']),
      C('lesson', 'State the design lesson', ['design', 'matters', 'shape', 'lesson', 'more', 'than']),
    ],
    source: 'practice', source_label: LBL, tags: ['learning_transfer', 'mechanics', 'design'],
    scope: sc(4, 5, ['ME.2.03']),
  },
];
