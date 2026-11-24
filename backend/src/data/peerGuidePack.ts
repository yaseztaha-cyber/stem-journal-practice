import { Category } from '../lib/rubric';

// Peer-guide practice questions extracted from "Road to Oceaned Journals".
// source='practice' ALWAYS — peer work, never official. Answers are peer
// exemplars shown after submission with the guide named as source.
// Auto-generated from peer_guide_candidates.json — do not hand-edit.
export interface PeerQ {
  category: Category;
  question_text: string;
  what_testing: string;
  difficulty: 'easy' | 'medium' | 'hard';
  required_components: { key: string; label: string; keywords: string[] }[];
  source: 'practice';
  source_label: string;
  tags: string[];
  reference_answer?: string;
  scope: {
    grade: number | null; semester: number | null; school_year: string;
    question_number: number | null; question_slot: number | null;
    question_type: string; learning_objectives: string[];
  };
}

export const PEER_GUIDE_PACK: PeerQ[] = [
  {
    category: 'personal_reflection',
    question_text: `This is the start of a new semester in your STEM journey, describe in detail two different methods of studying, one you have decided to modify and the other you should keep as it is, with explaining the reasons for that.`,
    what_testing: `Whether the answer gives a specific lived situation plus an explained personal lesson, not generic advice.`,
    difficulty: 'medium',
    required_components: [
      { key: 'specific_situation', label: `Describe a specific situation from your STEM experience`, keywords: ['when', 'during', 'example', 'semester', 'team', 'project', 'school'] },
      { key: 'personal_lesson', label: `Explain what you learned or how you changed`, keywords: ['learned', 'changed', 'realized', 'lesson', 'growth', 'because'] },
      { key: 'advice_grounding', label: `Ground any advice in that experience`, keywords: ['advice', 'should', 'recommend', 'therefore', 'so'] },
    ],
    source: 'practice',
    source_label: 'Peer guide · Road to Oceaned Journals',
    tags: ['peer-guide', 'oceaned-journals'],
    reference_answer: `"DO NOT GO WHERE THE PATH MAY LEAD, GO INSTEAD WHERE THERE IS NO PATH AND LEAVE A TRAIL." This quote have been always mentioned in our minds since we joined STEM Schools, to lay a trail in our academic journey, the way one study must be effective. It was the first time for us to study from references and reading research papers that give a lot of information in each concept, so following and developing new study techniques was crucial for example: 1- mind mapping method, this method shows visual techniques used to organize information, brainstorm ideas, and improve memory retention, this method has its pros and cons, for example, it shows large information in small charts that facilitates summarizing large concepts, however, it don’t provide all pieces of information. So I modified it by mixing it with other study techniques like tables and small texts and performed it during studying from large references to collect the needed information , 2- Feynman technique, is a powerful method for learning and understanding complex concepts deeply, and explain them in simple terms, during last semester I used this technique during research to facilitate equations like Bernoulli's equation and complex information I got to get the whole idea in easy figures. This method is excellent without any modifications as it provides information in a perfect way that helps get the whole picture across clearly.`,
    scope: { grade: 10, semester: 1, school_year: '', question_number: null, question_slot: 1, question_type: 'PERSONAL_REFLECTION', learning_objectives: [] },
  },
  {
    category: 'learning_transfer',
    question_text: `Imagine that you use electrostatics principal in your project . Explain two points that show how could the principles of electrostatics, such as Coulomb's Law, electric fields, and electric potential be applied to the design and optimization of your waste-derived material for air pollution mitigation in the Capstone Challenge.`,
    what_testing: `Whether the answer names the concept precisely and applies it to the project with specifics.`,
    difficulty: 'medium',
    required_components: [
      { key: 'concept_named', label: `Name the learning concept precisely`, keywords: ['concept', 'principle', 'outcome', 'studied', 'law', 'theory'] },
      { key: 'project_application', label: `Apply it to the project with specifics`, keywords: ['project', 'prototype', 'applied', 'used', 'measured', 'because'] },
      { key: 'insight', label: `Explain what the application shows or proves`, keywords: ['shows', 'proves', 'therefore', 'conclusion', 'insight'] },
    ],
    source: 'practice',
    source_label: 'Peer guide · Road to Oceaned Journals',
    tags: ['peer-guide', 'oceaned-journals'],
    reference_answer: `The principles of electrostatics are major concepts in all fields of electric devices such as coulombs law which states that electric charges are conserved, and electric fields that carry the charges themselves, in this learning outcome we learned about these principles and how to apply them. In our challenge, we are designing a solution that filters air from contaminates and uses sensors to measure the percentage of pollution before and after treatment, these sensors have a maximum potential difference to pass through which can be calculated by the formula V= W/Q where v is the potential difference, W is the stored potential energy and q is the charge passing,1- to control the passing charges we control the electric field passing through the wire that is calculated by E= F/Q , f is force exerted by particles, Q is the charge, by using resistors that slows this potential difference in order to get the perfect amount passing (1.5 V),2- in addition to this procedures, we utilized coulombs law that charges is conserved to control the passing charges by lowering the amount of the entering ones from the source of electricity which will decrease the passing the charges too. After utilizing these principles, we could control and monitor the air treatment process more reliably.`,
    scope: { grade: 10, semester: 1, school_year: '', question_number: null, question_slot: 3, question_type: 'LEARNING_TRANSFER', learning_objectives: [] },
  },
  {
    category: 'personal_reflection',
    question_text: `After enrolling in a STEM school, one of grade 10 students hesitated to continue in the STEM system due to the challenging new life style. Advise him/her by using three pieces of advice.`,
    what_testing: `Whether the answer gives a specific lived situation plus an explained personal lesson, not generic advice.`,
    difficulty: 'medium',
    required_components: [
      { key: 'specific_situation', label: `Describe a specific situation from your STEM experience`, keywords: ['when', 'during', 'example', 'semester', 'team', 'project', 'school'] },
      { key: 'personal_lesson', label: `Explain what you learned or how you changed`, keywords: ['learned', 'changed', 'realized', 'lesson', 'growth', 'because'] },
      { key: 'advice_grounding', label: `Ground any advice in that experience`, keywords: ['advice', 'should', 'recommend', 'therefore', 'so'] },
    ],
    source: 'practice',
    source_label: 'Peer guide · Road to Oceaned Journals',
    tags: ['peer-guide', 'oceaned-journals'],
    reference_answer: `After spending three capstones in STEM, I initially encountered many issues that delayed my progress in STEM, but I finally addressed these issues by different strategies. Since this is my third semester in STEM, I have gained much experience about dealing with difficulties. There is some crucial advice that I can provide to convince any hesitator to continue his journey in STEM. Firstly, during his journey in STEM he will gain crucial skills for instance ability to be a leader, speaker, and how to deal with different personalities. As an example, In the first semester, I was the leader of my capstone team, and a member in my team was uncooperative. So, I tried many strategies to convince him about the impact of the capstone project on his grades. Secondly, the traditional way of education has many demerits for instance The system is based on just studying without interacting or making presentations which enhances the speaking skill. Lastly, The skill of problem solving, this skill is an essential skill for life not just in STEM. The capstone project is a challenge, and teams work hard to find the proper solution for the challenge. In conclusion, “Life is filled with Difficulties” said by kal new port, every time stamp in life you will encounter difficulties, but it is a must to find strategies to resolve these issues. You can imagine that STEM school is a preparation for you before the real test of life.`,
    scope: { grade: 10, semester: 1, school_year: '', question_number: null, question_slot: 1, question_type: 'PERSONAL_REFLECTION', learning_objectives: [] },
  },
  {
    category: 'learning_transfer',
    question_text: `In ES2.01 you have studied the properties of water which indicate its purity, depending on the same idea in studying the properties of your air sample. Explain two common properties between water and air and how they helped you to treat the type of pollutant(s) in the sample of air you worked on in your project`,
    what_testing: `Whether the answer names the concept precisely and applies it to the project with specifics.`,
    difficulty: 'medium',
    required_components: [
      { key: 'concept_named', label: `Name the learning concept precisely`, keywords: ['concept', 'principle', 'outcome', 'studied', 'law', 'theory'] },
      { key: 'project_application', label: `Apply it to the project with specifics`, keywords: ['project', 'prototype', 'applied', 'used', 'measured', 'because'] },
      { key: 'insight', label: `Explain what the application shows or proves`, keywords: ['shows', 'proves', 'therefore', 'conclusion', 'insight'] },
    ],
    source: 'practice',
    source_label: 'Peer guide · Road to Oceaned Journals',
    tags: ['peer-guide', 'oceaned-journals'],
    reference_answer: `In the first learning outcome (ES2.01), we learnt about water, its properties and characteristics, also how it is polluted, and types of water purity. There are types of water: The first one is soft water which indicates that water is pure for drinking, that because of its low composition of contaminants such as Calcium and magnesium. The second one is hard water which has a high percentage of contaminants. Some properties between water and air were analyzed to know how to purify air from pollutants. The first common characteristic was that water pollutants were Ca and Mg which were metals, and the same pollutants were found in the polluted air sample, and as we know from this learning outcome how water treatment for these types of contaminants occur, we used two magnets in our prototype design to attract these metals and purify air from them. The second common property was that water solubility increases when decreasing the temperature that is because of the decrease in kinetic movement. Same in air, which we utilized this property by keeping our prototype and the air sample in a cold region to make the pollutants coagulate and form high density objects to trap them easily. As a summary, two common properties were analyzed between water and air, the first one was metallic pollutants which were treated by magnets, the second one was water and air solubility`,
    scope: { grade: 10, semester: 1, school_year: '', question_number: null, question_slot: 4, question_type: 'LEARNING_TRANSFER', learning_objectives: ['ES.2.01'] },
  },
  {
    category: 'learning_transfer',
    question_text: `In CS (02.05), you learned about the structure of mobile applications, which consists of multiple layers. Explain which of these layers and their tools can be used to collect, store, and analyze reading data for monitoring water quality parameters and the procedures followed to achieve this.`,
    what_testing: `Whether the answer names the concept precisely and applies it to the project with specifics.`,
    difficulty: 'medium',
    required_components: [
      { key: 'concept_named', label: `Name the learning concept precisely`, keywords: ['concept', 'principle', 'outcome', 'studied', 'law', 'theory'] },
      { key: 'project_application', label: `Apply it to the project with specifics`, keywords: ['project', 'prototype', 'applied', 'used', 'measured', 'because'] },
      { key: 'insight', label: `Explain what the application shows or proves`, keywords: ['shows', 'proves', 'therefore', 'conclusion', 'insight'] },
    ],
    source: 'practice',
    source_label: 'Peer guide · Road to Oceaned Journals',
    tags: ['peer-guide', 'oceaned-journals'],
    reference_answer: `In the fifth learning outcome in Computer Science (CS (02.05), we studied and learnt crucial mobile and computer applications, and their composition to be utilized in the capstone project. As we learned, mobile applications consist of multiple layers each with distinct purpose, such as the UI/UX design layer which is the page that the user deals with that contains the buttons and appearance of the application. One of the layers that every mobile application has is the feedback, storing layer which is monitored by backend code which is not visible to the user and only the programmer can edit on it using languages such as JDK, XML, HTML. This layer is utilized in our capstone project in the Arduino UNO application, in which all the sensors and motors are connected. It works as the brain of the water treatment system. In our project there are several commands, tools in the Arduino app utilized for storage, analyzing of the data resulting from the sensors reading, as an example the (if condition) is used where the thresholds of the parameters of contaminated water (pH, turbidity, TDS) are met at this example of code : “if (value_Of_TDS >= 500); cout << “Threshold is Met” << endl;” which says that if the value of TDS is smaller or equal to 500, do the certain condition, which is type “Threshold is Met” As a summary, different tools and layers in the Arduino application are utilized such as if statement condition for effective feedback system. During this semester's challenge, you are required to treat wastewater to achieve a salinity level of less than 500 ppm. In (MA 2.06), you studied the concept of limits. Explain how you will apply this concept in your project? Learning Transfer. In the sixth learning outcome in Mathematics (MA 2.06), essential concepts were learned such as limits, continuity, and others. These crucial concepts were highly utilized in the sensors section in the feedback system of the prototype. The meaning of limit is the value of a function when the change approaches another parameter. In the sensors section, the concept of limits is utilized to know effectiveness of the sensor’s reading. As an example, a limit exists at C If limit when x→ c+ approaches c from the positive side is equal (=) to the limit when x→ c- approaches c from the negative side. This property was utilized to know if the reading of the sensor is continuous or there are certain holes in the graph of the function. Moreover, when the sensor of TDS was bought, we applied certain conditions to know its efficiency, therefore, we measured the salinity of 780 ppm water. The reading in the beginning when the salinity reducing material was put inside the water jar was constantly decreasing by rate of 23.8 ppm known by the slope function [(𝑦2 − 𝑦1) / (𝑥2 − 𝑥1)] → x2 – x1 = 3, y2 – y1 = 71.4. However, at a certain instant the sensor wasn’t reading anything which means that there was a hole in the function (not continuous when the limit approaches→ C). therefore, we bought another one for better reading which was TCS2300 EC. In conclusion, the concepts of limit and continuity were utilized to ensure the efficiency of`,
    scope: { grade: 10, semester: 2, school_year: '', question_number: null, question_slot: 3, question_type: 'LEARNING_TRANSFER', learning_objectives: ['CS.2.05'] },
  },
  {
    category: 'learning_transfer',
    question_text: `As you studied in (ES.2.10), the Earth’s spheres underwent several stages, cycles, and feedback to reach their current compositions. Compare and explain your wastewater sample's and earth spheres' stages, cycles, and feedback mechanisms to obtain their optimum conditions`,
    what_testing: `Whether the answer names the concept precisely and applies it to the project with specifics.`,
    difficulty: 'medium',
    required_components: [
      { key: 'concept_named', label: `Name the learning concept precisely`, keywords: ['concept', 'principle', 'outcome', 'studied', 'law', 'theory'] },
      { key: 'project_application', label: `Apply it to the project with specifics`, keywords: ['project', 'prototype', 'applied', 'used', 'measured', 'because'] },
      { key: 'insight', label: `Explain what the application shows or proves`, keywords: ['shows', 'proves', 'therefore', 'conclusion', 'insight'] },
    ],
    source: 'practice',
    source_label: 'Peer guide · Road to Oceaned Journals',
    tags: ['peer-guide', 'oceaned-journals'],
    reference_answer: `In the tenth learning outcome in Earth Science (ES.2.10), crucial processes and facts about the formation of earth, the purification of water in early earth’s development were studied, ensuring effective impurities removal in the capstone project. As previously studied in the learning outcome, in the early earth’s crust formation, the water was regularly treated. But how was it purified ?. This is the question I always had, however after studying the learning outcome I learnt that water was purified by the sedimentation process, which mainly involves the role of sand, rocks, and clay for water treatment. The role of the rocks was to purify heavy metals and particles in this range of size (10^3 μ- 10^(5 ) μ), the sand was for purification of particles in this range (10μ- 10^3 μ) such as fine sand particles, and the clay for the small particles (10^(-2) μ- 10^ μ). This information was correctly utilized in our capstone project in the last stage of the prototype, which is the physical treatment by salinity removal from water using fine, coarse sand, crushed stones, and charcoal (activated carbon). After deep search in the effectiveness of these materials in salinity removal it was found to be 96.34%, which is more efficient than the alternative solutions. In conclusion, the tenth learning outcome gave us a practical model for how Earth’s spheres cycle and feedback to maintain balance.`,
    scope: { grade: 10, semester: 2, school_year: '', question_number: null, question_slot: 4, question_type: 'LEARNING_TRANSFER', learning_objectives: ['ES.2.10'] },
  },
];
