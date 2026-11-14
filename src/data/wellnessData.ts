export const IMAGES = {
  hero: '/src/assets/images/hero_wellness_sanctuary_1794634643390.jpg',
  treePose: '/src/assets/images/yoga_vrikshasana_tree_1794634644117.jpg',
  warriorPose: '/src/assets/images/yoga_warrior_alignment_1794634644719.jpg',
  meditation: '/src/assets/images/meditation_mindfulness_1794634644753.jpg',
  knowledge: '/src/assets/images/ayurveda_knowledge_hub_1794634645600.jpg',
  breathing: '/src/assets/images/breathing_pranayama_studio_1794634646673.jpg',
};

export type YogaCategory =
  | 'Beginner Yoga'
  | 'Intermediate Yoga'
  | 'Advanced Yoga'
  | 'Morning Yoga'
  | 'Evening Yoga'
  | 'Flexibility'
  | 'Strength'
  | 'Relaxation'
  | 'Back Care'
  | 'Stress Relief';

export const YOGA_CATEGORIES: YogaCategory[] = [
  'Beginner Yoga',
  'Intermediate Yoga',
  'Advanced Yoga',
  'Morning Yoga',
  'Evening Yoga',
  'Flexibility',
  'Strength',
  'Relaxation',
  'Back Care',
  'Stress Relief',
];

export interface YogaFlowCue {
  phaseName: string;
  breath: 'Inhale' | 'Exhale' | 'Steady Breath';
  seconds: number;
  cue: string;
}

export interface YogaPose {
  id: string;
  sanskritName: string;
  englishName: string;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  categories: YogaCategory[];
  summary: string;
  steps: string[];
  breathingInstructions: string;
  benefits: string[];
  precautions: string[];
  commonMistakes: string[];
  modifications: string[];
  relatedIds: string[];
  guidedCues: YogaFlowCue[];
}

export const YOGA_POSES: YogaPose[] = [
  {
    id: 'tadasana',
    sanskritName: 'Tadasana',
    englishName: 'Mountain Pose',
    image: IMAGES.treePose,
    difficulty: 'Beginner',
    durationMinutes: 5,
    categories: ['Beginner Yoga', 'Morning Yoga', 'Back Care', 'Stress Relief'],
    summary: 'Foundational standing posture that aligns the spine, grounds the feet, and awakens postural awareness.',
    steps: [
      'Stand with your big toes touching or feet hip-width apart for stability.',
      'Lift and spread your toes, then place them softly back down to distribute weight evenly across heel and ball.',
      'Engage your quadriceps gently so the kneecaps lift without locking the joints.',
      'Draw the tailbone slightly down, lengthen the crown of the head toward the ceiling, and soften shoulders down away from ears.',
      'Rest arms alongside your torso with palms facing inward or gently forward.'
    ],
    breathingInstructions: 'Inhale to lengthen upward through the crown of the head; exhale to root evenly through all four corners of both feet.',
    benefits: ['Improves posture and spinal alignment', 'Strengthens thighs, ankles, and core awareness', 'Establishes calm focus before standing sequences'],
    precautions: ['Keep feet hip-width apart if you experience dizziness or low blood pressure', 'Avoid locking knees backward'],
    commonMistakes: ['Flaring lower ribs forward', 'Hunching shoulders toward the ears', 'Shifting all weight onto the heels'],
    modifications: ['Stand with your back lightly touching a wall to feel neutral spinal alignment', 'Use a yoga block squeezed gently between thighs to engage inner legs'],
    relatedIds: ['vrikshasana', 'uttanasana', 'virabhadrasana-2'],
    guidedCues: [
      { phaseName: 'Ground the Feet', breath: 'Exhale', seconds: 20, cue: 'Press evenly through heels and big toe mounds.' },
      { phaseName: 'Lengthen the Spine', breath: 'Inhale', seconds: 25, cue: 'Lift through the sternum and crown of the head.' },
      { phaseName: 'Soften Shoulders', breath: 'Steady Breath', seconds: 30, cue: 'Relax jaw and neck while holding steady alignment.' },
    ],
  },
  {
    id: 'vrikshasana',
    sanskritName: 'Vrikshasana',
    englishName: 'Tree Pose',
    image: IMAGES.treePose,
    difficulty: 'Beginner',
    durationMinutes: 6,
    categories: ['Beginner Yoga', 'Morning Yoga', 'Strength', 'Stress Relief'],
    summary: 'Single-leg standing balance cultivating mental stillness, hip mobility, and ankle stability.',
    steps: [
      'Begin in Mountain Pose (Tadasana) and shift weight smoothly into your left foot.',
      'Bend your right knee and place the sole of your right foot against your left ankle, calf, or upper inner thigh (avoiding the knee joint).',
      'Press foot and standing leg gently into one another to create midline stability.',
      'Bring palms together at heart center in Anjali Mudra, or extend arms overhead like branches.',
      'Fix your gaze (drishti) softly on an unmoving point ahead for 5–8 slow breaths, then switch sides.'
    ],
    breathingInstructions: 'Breathe smoothly through the nose; use slow exhales to settle micro-wobbles in the standing ankle.',
    benefits: ['Strengthens ankles, calves, and gluteus medius', 'Improves proprioception and balance', 'Quiets scattered thoughts through steady gaze'],
    precautions: ['Never press the lifted foot directly onto the side of the knee joint', 'Use wall support if recovering from ankle sprain or vertigo'],
    commonMistakes: ['Letting the standing hip jut out to the side', 'Holding the breath while balancing', 'Placing foot directly on the knee'],
    modifications: ['Keep toes lightly resting on the mat as a kickstand', 'Place one fingertip lightly on a wall or chair back'],
    relatedIds: ['tadasana', 'virabhadrasana-2', 'garudasana'],
    guidedCues: [
      { phaseName: 'Establish Base', breath: 'Inhale', seconds: 20, cue: 'Root left foot firmly and set a soft eye gaze.' },
      { phaseName: 'Right Side Hold', breath: 'Steady Breath', seconds: 35, cue: 'Press foot into calf or inner thigh; lift heart.' },
      { phaseName: 'Left Side Hold', breath: 'Steady Breath', seconds: 35, cue: 'Switch sides gracefully with steady nasal breaths.' },
    ],
  },
  {
    id: 'virabhadrasana-2',
    sanskritName: 'Virabhadrasana II',
    englishName: 'Warrior II Pose',
    image: IMAGES.warriorPose,
    difficulty: 'Beginner',
    durationMinutes: 8,
    categories: ['Beginner Yoga', 'Morning Yoga', 'Strength', 'Flexibility'],
    summary: 'Expansive standing lunge building lower-body endurance, hip opening, and calm resolve.',
    steps: [
      'Step feet 3.5 to 4 feet apart lengthwise on your mat.',
      'Turn your front right foot 90 degrees forward and angle your back left toes slightly inward.',
      'Bend your right knee directly over the right ankle, tracking toward the second toe.',
      'Extend both arms parallel to the floor, reaching actively from fingertips to fingertips.',
      'Soften shoulders down and look softly over your front middle finger for 5–8 breaths per side.'
    ],
    breathingInstructions: 'Inhale to broaden across the collarbones; exhale to sink gently into the front knee without collapsing the torso.',
    benefits: ['Builds endurance in thighs and glutes', 'Opens hips and chest', 'Supports grounded focus and stamina'],
    precautions: ['Keep front knee aligned over ankle, never collapsing inward', 'Shorten stance if experiencing knee or groin discomfort'],
    commonMistakes: ['Leaning torso forward toward the front leg', 'Front knee drifting inward past the big toe', 'Tensing upper trapezius muscles'],
    modifications: ['Shorten stance width for less hip intensity', 'Rest hands on hips if shoulders feel fatigued'],
    relatedIds: ['tadasana', 'trikonasana', 'adho-mukha-svanasana'],
    guidedCues: [
      { phaseName: 'Set Stance', breath: 'Inhale', seconds: 20, cue: 'Open feet wide and align front heel with back arch.' },
      { phaseName: 'Right Warrior Hold', breath: 'Steady Breath', seconds: 40, cue: 'Bend right knee deeply; reach arms level.' },
      { phaseName: 'Left Warrior Hold', breath: 'Steady Breath', seconds: 40, cue: 'Switch feet and hold steady over front fingertips.' },
    ],
  },
  {
    id: 'adho-mukha-svanasana',
    sanskritName: 'Adho Mukha Svanasana',
    englishName: 'Downward-Facing Dog',
    image: IMAGES.hero,
    difficulty: 'Beginner',
    durationMinutes: 7,
    categories: ['Beginner Yoga', 'Morning Yoga', 'Flexibility', 'Strength', 'Back Care'],
    summary: 'Inverted V posture that lengthens the entire posterior chain while building shoulder stability.',
    steps: [
      'Begin on hands and knees with wrists under shoulders and knees under hips.',
      'Spread fingers wide, pressing firmly through thumb and index finger knuckles.',
      'Tuck toes and lift hips up and back toward the ceiling, keeping knees softly bent.',
      'Lengthen your spine by pressing chest gently toward thighs without dropping ribs.',
      'Pedal heels gently or hold steady for 5–10 breaths.'
    ],
    breathingInstructions: 'Inhale to expand the back ribs; exhale to release the head and lengthen tailbone upward.',
    benefits: ['Decompresses the spine', 'Stretches hamstrings, calves, and shoulders', 'Energizes circulation gently'],
    precautions: ['Avoid or shorten hold with uncontrolled high blood pressure, carpal tunnel flare-up, or late pregnancy'],
    commonMistakes: ['Rounding the upper back to force heels to the floor', 'Dumping weight into the outer edges of the wrists'],
    modifications: ['Bend knees generously to prioritize a long spine', 'Use yoga blocks under hands or practice against a wall (Half Dog)'],
    relatedIds: ['marjaryasana-bitilasana', 'bhujangasana', 'balasana'],
    guidedCues: [
      { phaseName: 'Root Hands & Lift', breath: 'Exhale', seconds: 25, cue: 'Lift sit bones high while keeping knees soft.' },
      { phaseName: 'Pedal & Lengthen', breath: 'Steady Breath', seconds: 35, cue: 'Alternate bending knees slowly to ease calves.' },
      { phaseName: 'Stillness Hold', breath: 'Steady Breath', seconds: 30, cue: 'Hold symmetrical shape with relaxed neck.' },
    ],
  },
  {
    id: 'marjaryasana-bitilasana',
    sanskritName: 'Marjaryasana-Bitilasana',
    englishName: 'Cat-Cow Flow',
    image: IMAGES.breathing,
    difficulty: 'Beginner',
    durationMinutes: 5,
    categories: ['Beginner Yoga', 'Morning Yoga', 'Back Care', 'Relaxation', 'Stress Relief'],
    summary: 'Breath-synchronized spinal flexion and extension to lubricate vertebrae and calm the nervous system.',
    steps: [
      'Start on all fours in a neutral tabletop position.',
      'Inhale into Cow Pose: lower the belly gently, lift sit bones and chest, and gaze softly forward.',
      'Exhale into Cat Pose: press palms into the mat, round the spine toward the ceiling, and tuck chin gently.',
      'Continue flowing smoothly for 8–12 breath cycles.'
    ],
    breathingInstructions: 'Lead every movement with the breath: full inhale initiates Cow; full exhale initiates Cat.',
    benefits: ['Gently mobilizes the spine and neck', 'Coordinates breath and movement', 'Relieves desk-related back stiffness'],
    precautions: ['Keep neck movement gentle if experiencing cervical sensitivity', 'Pad knees with a folded blanket'],
    commonMistakes: ['Moving faster than the breath', 'Cranking the head back sharply during Cow'],
    modifications: ['Perform seated in a chair with hands on knees', 'Place forearms on blocks if wrists are sensitive'],
    relatedIds: ['balasana', 'adho-mukha-svanasana', 'setu-bandhasana'],
    guidedCues: [
      { phaseName: 'Cow Extension', breath: 'Inhale', seconds: 20, cue: 'Broaden collarbones and soften belly downward.' },
      { phaseName: 'Cat Flexion', breath: 'Exhale', seconds: 20, cue: 'Dome upper back and release head completely.' },
      { phaseName: 'Continuous Flow', breath: 'Steady Breath', seconds: 45, cue: 'Move fluidly in rhythm with slow nasal breathing.' },
    ],
  },
  {
    id: 'bhujangasana',
    sanskritName: 'Bhujangasana',
    englishName: 'Cobra Pose',
    image: IMAGES.warriorPose,
    difficulty: 'Beginner',
    durationMinutes: 6,
    categories: ['Beginner Yoga', 'Back Care', 'Flexibility', 'Morning Yoga'],
    summary: 'Gentle prone backbend strengthening spinal extensors and opening the front chest.',
    steps: [
      'Lie face down with tops of feet pressing into the mat and legs hip-width apart.',
      'Place palms under shoulders with elbows hugged close to your ribcage.',
      'On an inhale, peel chest lightly off the mat using back muscle strength rather than pushing hard with arms.',
      'Keep lower ribs anchored for Baby Cobra or lift slightly higher with soft elbows.',
      'Exhale slowly back to the mat and rest cheek to one side.'
    ],
    breathingInstructions: 'Inhale as the chest rises and collarbones widen; exhale gently to release back down.',
    benefits: ['Counteracts forward-slouched posture', 'Strengthens upper and mid-back muscles', 'Opens chest and diaphragmatic space'],
    precautions: ['Avoid pinching the lower back; stay low if lumbar discomfort arises', 'Avoid during pregnancy or acute spinal injury'],
    commonMistakes: ['Shrugging shoulders up toward ears', 'Straightening elbows completely and jamming lower back'],
    modifications: ['Practice Sphinx Pose on forearms for softer spinal support', 'Place a rolled blanket under the pelvis'],
    relatedIds: ['balasana', 'setu-bandhasana', 'marjaryasana-bitilasana'],
    guidedCues: [
      { phaseName: 'Anchor Lower Body', breath: 'Exhale', seconds: 15, cue: 'Press tops of feet and pubic bone gently downward.' },
      { phaseName: 'Lift Heart', breath: 'Inhale', seconds: 25, cue: 'Draw shoulder blades down and float chest softly.' },
      { phaseName: 'Release & Rest', breath: 'Exhale', seconds: 20, cue: 'Lower forehead to stacked hands and relax.' },
    ],
  },
  {
    id: 'balasana',
    sanskritName: 'Balasana',
    englishName: "Child's Pose",
    image: IMAGES.meditation,
    difficulty: 'Beginner',
    durationMinutes: 6,
    categories: ['Beginner Yoga', 'Evening Yoga', 'Relaxation', 'Back Care', 'Stress Relief'],
    summary: 'Restorative resting posture offering gentle lumbar release and quiet inward grounding.',
    steps: [
      'Kneel on your mat with big toes touching and knees separated comfortably wide.',
      'Sit hips back toward your heels and fold your torso forward between your thighs.',
      'Rest your forehead on the mat or a block, extending arms forward or resting them beside your shins.',
      'Allow your belly to soften completely with each breath.'
    ],
    breathingInstructions: 'Breathe slowly into the back body, feeling the lower ribs expand laterally on every inhale.',
    benefits: ['Calms sympathetic nervous activation', 'Gently stretches hips, thighs, and ankles', 'Provides a safe resting pause anytime'],
    precautions: ['Place a rolled blanket behind knees or under ankles if flexion is uncomfortable'],
    commonMistakes: ['Forcing hips down onto heels when knees feel tight', 'Holding neck tension while forehead hangs'],
    modifications: ['Rest torso lengthwise over a bolster or pillow', 'Place a folded towel under the forehead so the neck stays neutral'],
    relatedIds: ['marjaryasana-bitilasana', 'savasana', 'viparita-karani'],
    guidedCues: [
      { phaseName: 'Settle Hips', breath: 'Exhale', seconds: 25, cue: 'Allow hips to sink heavily toward heels.' },
      { phaseName: 'Back-Body Breath', breath: 'Steady Breath', seconds: 45, cue: 'Expand breath gently into the lower back.' },
    ],
  },
  {
    id: 'setu-bandhasana',
    sanskritName: 'Setu Bandhasana',
    englishName: 'Bridge Pose',
    image: IMAGES.hero,
    difficulty: 'Beginner',
    durationMinutes: 7,
    categories: ['Beginner Yoga', 'Back Care', 'Strength', 'Evening Yoga', 'Stress Relief'],
    summary: 'Supported or active supine backbend opening the chest and strengthening posterior glutes and hamstrings.',
    steps: [
      'Lie on your back with knees bent and feet planted hip-width apart close to your sit bones.',
      'Keep arms beside your body, palms down, and gaze straight upward.',
      'Press evenly into both feet to lift hips upward, keeping thighs parallel.',
      'Hold for 5–8 steady breaths, then roll spine down one vertebra at a time.'
    ],
    breathingInstructions: 'Inhale to lift the chest toward the chin; keep breathing smoothly without holding the breath at the top.',
    benefits: ['Strengthens glutes, hamstrings, and pelvic floor', 'Gently opens hip flexors and chest', 'Supports evening nervous-system settling'],
    precautions: ['Do not turn your head side to side while weight is on the shoulders', 'Keep knees tracking forward rather than splaying out'],
    commonMistakes: ['Splaying knees wide apart', 'Over-arching lumbar spine instead of engaging glutes'],
    modifications: ['Slide a yoga block horizontally under the sacrum for Supported Bridge', 'Squeeze a block gently between thighs'],
    relatedIds: ['balasana', 'viparita-karani', 'savasana'],
    guidedCues: [
      { phaseName: 'Lift Hips', breath: 'Inhale', seconds: 20, cue: 'Press heels down and elevate pelvis smoothly.' },
      { phaseName: 'Steady Hold', breath: 'Steady Breath', seconds: 35, cue: 'Keep knees parallel and neck completely neutral.' },
      { phaseName: 'Slow Lower', breath: 'Exhale', seconds: 20, cue: 'Unfurl spine gently down onto the mat.' },
    ],
  },
  {
    id: 'trikonasana',
    sanskritName: 'Utthita Trikonasana',
    englishName: 'Extended Triangle Pose',
    image: IMAGES.warriorPose,
    difficulty: 'Intermediate',
    durationMinutes: 8,
    categories: ['Intermediate Yoga', 'Flexibility', 'Strength', 'Morning Yoga'],
    summary: 'Lateral standing stretch lengthening hamstrings, side waist, and thoracic rotation.',
    steps: [
      'Stand with feet wide apart, front foot pointing straight ahead and back foot angled slightly inward.',
      'Keep both legs straight with a micro-softness in the front knee.',
      'Extend arms wide, hinge from the front hip crease (not the waist), and reach forward.',
      'Rest the lower hand lightly on your shin, ankle, or a yoga block, reaching the top arm straight up.',
      'Hold 5–7 breaths per side.'
    ],
    breathingInstructions: 'Inhale to lengthen both sides of the waist equally; exhale to soften the gaze and open the chest.',
    benefits: ['Lengthens hamstrings, groin, and side body', 'Improves lateral spinal mobility', 'Builds core and leg stability'],
    precautions: ['Look straight ahead or down if turning the gaze upward strains the neck'],
    commonMistakes: ['Collapsing the bottom ribcage downward to touch the floor', 'Hyperextending the front knee'],
    modifications: ['Place a tall yoga block outside the front shin', 'Practice with back lightly aligned along a wall'],
    relatedIds: ['virabhadrasana-2', 'tadasana', 'paschimottanasana'],
    guidedCues: [
      { phaseName: 'Hinge & Lengthen', breath: 'Inhale', seconds: 25, cue: 'Create space equally along both sides of the torso.' },
      { phaseName: 'Right Side Hold', breath: 'Steady Breath', seconds: 35, cue: 'Stack shoulders cleanly and breathe deeply.' },
      { phaseName: 'Left Side Hold', breath: 'Steady Breath', seconds: 35, cue: 'Repeat symmetrically on the left side.' },
    ],
  },
  {
    id: 'paschimottanasana',
    sanskritName: 'Paschimottanasana',
    englishName: 'Seated Forward Fold',
    image: IMAGES.breathing,
    difficulty: 'Intermediate',
    durationMinutes: 8,
    categories: ['Intermediate Yoga', 'Evening Yoga', 'Flexibility', 'Relaxation', 'Stress Relief'],
    summary: 'Introspective seated forward bend calming the mind and lengthening hamstrings and lower back.',
    steps: [
      'Sit tall with legs extended forward; sit on the edge of a folded blanket if your lower back rounds.',
      'Flex feet gently so toes point upward.',
      'Inhale to lift arms overhead and lengthen the spine; exhale to hinge forward from the hip joints.',
      'Rest hands on shins, ankles, or a strap looped around the feet without pulling aggressively.',
      'Hold 8–10 slow breaths.'
    ],
    breathingInstructions: 'On every inhale, lengthen slightly forward through the chest; on every exhale, soften deeper without force.',
    benefits: ['Stretches hamstrings, calves, and spinal erectors', 'Encourages parasympathetic calm before sleep'],
    precautions: ['Bend knees generously if experiencing hamstring tendon irritation or lumbar disc sensitivity'],
    commonMistakes: ['Pulling hard on the feet and rounding the upper spine', 'Locking knees flat against the floor'],
    modifications: ['Bend knees slightly and place a rolled towel underneath', 'Use a yoga strap around the balls of the feet'],
    relatedIds: ['balasana', 'viparita-karani', 'savasana'],
    guidedCues: [
      { phaseName: 'Tall Spine', breath: 'Inhale', seconds: 20, cue: 'Lift out of the pelvis before folding.' },
      { phaseName: 'Mindful Fold', breath: 'Exhale', seconds: 45, cue: 'Lead with sternum and keep shoulders relaxed.' },
    ],
  },
  {
    id: 'ardha-matsyendrasana',
    sanskritName: 'Ardha Matsyendrasana',
    englishName: 'Half Lord of the Fishes Twist',
    image: IMAGES.breathing,
    difficulty: 'Intermediate',
    durationMinutes: 7,
    categories: ['Intermediate Yoga', 'Flexibility', 'Back Care', 'Evening Yoga'],
    summary: 'Seated spinal rotation restoring thoracic mobility and easing mid-back tightness.',
    steps: [
      'Sit tall with legs extended; bend your right knee and step the right foot outside your left thigh.',
      'Keep your left leg extended straight or gently bent beside your right hip.',
      'Inhale to lift tall through the spine; exhale to rotate gently toward the right thigh.',
      'Place right fingertips behind you for height and hug the right knee with your left arm.',
      'Breathe 6 slow cycles per side.'
    ],
    breathingInstructions: 'Inhale to grow taller through the crown; exhale to deepen the rotation gently from the mid-torso.',
    benefits: ['Improves thoracic spinal rotation', 'Stretches outer hips and piriformis', 'Releases upper-back tension'],
    precautions: ['Keep twists gentle during pregnancy or acute spinal disc issues'],
    commonMistakes: ['Slumping into the back hand', 'Cranking the neck around further than the chest'],
    modifications: ['Keep the bottom leg straight forward', 'Sit on a folded blanket to keep hips level'],
    relatedIds: ['marjaryasana-bitilasana', 'paschimottanasana', 'savasana'],
    guidedCues: [
      { phaseName: 'Right Twist', breath: 'Steady Breath', seconds: 35, cue: 'Rotate from the ribcage while keeping both sit bones rooted.' },
      { phaseName: 'Left Twist', breath: 'Steady Breath', seconds: 35, cue: 'Unwind slowly and mirror on the left side.' },
    ],
  },
  {
    id: 'bakasana',
    sanskritName: 'Bakasana',
    englishName: 'Crow Pose',
    image: IMAGES.hero,
    difficulty: 'Advanced',
    durationMinutes: 8,
    categories: ['Advanced Yoga', 'Strength', 'Morning Yoga'],
    summary: 'Foundational arm balance cultivating core integration, wrist resilience, and focused confidence.',
    steps: [
      'Begin in a low squat (Malasana) with hands planted shoulder-width apart and fingers spread wide.',
      'Lift hips slightly and tuck knees high onto the backs of your upper arms.',
      'Look 12 inches forward on the floor (not straight down) and shift weight gradually into your fingertips.',
      'Lift one foot toward your glutes, test balance, and optionally float the second foot up.',
      'Hold 3–5 steady breaths and lower with control.'
    ],
    breathingInstructions: 'Keep breathing steadily rather than holding your breath; engage core on every exhale.',
    benefits: ['Strengthens wrists, forearms, shoulders, and deep core', 'Builds proprioception and mental composure'],
    precautions: ['Warm up wrists thoroughly first', 'Place a folded blanket or bolster in front of your face while learning'],
    commonMistakes: ['Looking straight down between the hands instead of forward', 'Jumping feet up instead of shifting weight slowly'],
    modifications: ['Stand feet on a yoga block to elevate hips higher', 'Practice lifting one toe at a time ("toe taps")'],
    relatedIds: ['adho-mukha-svanasana', 'virabhadrasana-2', 'balasana'],
    guidedCues: [
      { phaseName: 'Wrist Prep & Set', breath: 'Inhale', seconds: 20, cue: 'Grip the mat gently with fingertips.' },
      { phaseName: 'Shift & Balance', breath: 'Steady Breath', seconds: 35, cue: 'Gaze forward and draw heels smoothly toward hips.' },
    ],
  },
  {
    id: 'natarajasana',
    sanskritName: 'Natarajasana',
    englishName: 'Dancer Pose',
    image: IMAGES.treePose,
    difficulty: 'Advanced',
    durationMinutes: 8,
    categories: ['Advanced Yoga', 'Flexibility', 'Strength', 'Morning Yoga'],
    summary: 'Graceful standing backbend and single-leg balance opening shoulders, chest, and quadriceps.',
    steps: [
      'Stand in Mountain Pose and shift weight onto your left leg.',
      'Bend your right knee and catch the inside edge of your right ankle with your right hand.',
      'Extend your left arm forward and upward for counterbalance.',
      'Kick your right foot gently back and upward into your hand while lifting your chest forward.',
      'Hold 5 steady breaths per side.'
    ],
    breathingInstructions: 'Breathe smoothly into the upper chest; avoid clenching the jaw or holding breath.',
    benefits: ['Opens shoulders, chest, and hip flexors', 'Strengthens standing leg and ankle stabilizers'],
    precautions: ['Avoid over-arching the lower back; keep kick balanced with chest lift'],
    commonMistakes: ['Opening the lifted hip sharply sideways', 'Dropping the chest toward the floor'],
    modifications: ['Loop a yoga strap around the back ankle', 'Stand near a wall for light fingertip support'],
    relatedIds: ['vrikshasana', 'bhujangasana', 'virabhadrasana-2'],
    guidedCues: [
      { phaseName: 'Right Balance', breath: 'Steady Breath', seconds: 35, cue: 'Kick back softly into hand while lifting heart.' },
      { phaseName: 'Left Balance', breath: 'Steady Breath', seconds: 35, cue: 'Mirror evenly on the opposite side.' },
    ],
  },
  {
    id: 'savasana',
    sanskritName: 'Savasana',
    englishName: 'Corpse Pose',
    image: IMAGES.meditation,
    difficulty: 'Beginner',
    durationMinutes: 10,
    categories: ['Beginner Yoga', 'Evening Yoga', 'Relaxation', 'Stress Relief'],
    summary: 'Conscious deep rest allowing the nervous system to integrate physical practice and down-regulate.',
    steps: [
      'Lie comfortably on your back with legs extended wider than hip-width and feet falling outward.',
      'Rest arms a few inches from your sides with palms facing upward.',
      'Tuck shoulder blades lightly underneath you and lengthen the back of your neck.',
      'Close your eyes, soften the jaw and forehead, and let breathing become effortless.'
    ],
    breathingInstructions: 'Release control of the breath completely; observe natural inhales and exhales like gentle waves.',
    benefits: ['Lowers perceived stress and heart rate', 'Integrates neuromuscular recovery after yoga', 'Supports deeper sleep quality'],
    precautions: ['Place a bolster under knees if lower back feels sensitive lying flat'],
    commonMistakes: ['Skipping Savasana after active flow', 'Fidgeting instead of allowing 3+ minutes of stillness'],
    modifications: ['Place a rolled bolster under knees and cover with a light blanket', 'Practice lying on your side during late pregnancy'],
    relatedIds: ['balasana', 'setu-bandhasana', 'paschimottanasana'],
    guidedCues: [
      { phaseName: 'Body Softening', breath: 'Exhale', seconds: 30, cue: 'Let heels, hips, and shoulders sink heavily.' },
      { phaseName: 'Effortless Rest', breath: 'Steady Breath', seconds: 60, cue: 'Rest in quiet awareness without effort.' },
    ],
  },
];

export interface MeditationSession {
  id: string;
  title: string;
  category:
    | 'Guided Meditation'
    | 'Mindfulness'
    | 'Sleep'
    | 'Stress Relief'
    | 'Breathing'
    | 'Body Scan'
    | 'Relaxation'
    | 'Focus';
  durationMinutes: number;
  image: string;
  defaultSoundscape:
    | 'tanpura-drone'
    | 'raga-yaman'
    | 'raga-bhairav'
    | 'santoor-calm'
    | 'om-drone'
    | 'singing-bowl'
    | 'rain'
    | 'forest'
    | 'silence';
  description: string;
  guidancePrompts: string[];
}

export const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: 'mindful-morning-anchor',
    title: 'Morning Breath & Intention Anchor',
    category: 'Mindfulness',
    durationMinutes: 10,
    image: IMAGES.meditation,
    defaultSoundscape: 'singing-bowl',
    description: 'Settle morning mental chatter by anchoring awareness to the rhythm of nasal breathing and one clear daily intention.',
    guidancePrompts: [
      'Sit comfortably with an upright yet unforced spine.',
      'Notice three natural breaths without changing their depth.',
      'When thoughts wander, label them gently as "thinking" and return to the sensation of air at the nostrils.',
      'Before closing, name one calm intention for the next few hours.'
    ],
  },
  {
    id: 'deep-body-scan',
    title: 'Progressive Body Scan Release',
    category: 'Body Scan',
    durationMinutes: 15,
    image: IMAGES.breathing,
    defaultSoundscape: 'forest',
    description: 'Sweep gentle attention from crown to toes to notice and soften hidden muscular tension.',
    guidancePrompts: [
      'Rest upright or lying down on a supportive mat.',
      'Bring warm attention to your forehead, jaw, and shoulders; soften on each exhale.',
      'Move awareness slowly through chest, belly, hips, knees, and feet.',
      'Sense the body as one calm, connected whole.'
    ],
  },
  {
    id: 'sleep-yoga-nidra',
    title: 'Evening Unwind & Sleep Transition',
    category: 'Sleep',
    durationMinutes: 15,
    image: IMAGES.meditation,
    defaultSoundscape: 'rain',
    description: 'Down-regulate evening alertness with slow exhalations and systematic sensory withdrawal.',
    guidancePrompts: [
      'Dim nearby screens and recline comfortably.',
      'Allow your exhale to become slightly longer than your inhale.',
      'Release the weight of the day into the mattress or cushion beneath you.'
    ],
  },
  {
    id: 'stress-reset-5',
    title: 'Five-Minute Nervous System Reset',
    category: 'Stress Relief',
    durationMinutes: 5,
    image: IMAGES.breathing,
    defaultSoundscape: 'om-drone',
    description: 'A compact midday pause designed to interrupt stress spirals between work blocks.',
    guidancePrompts: [
      'Unclench your jaw and drop your shoulders an inch.',
      'Feel both feet resting solidly on the floor.',
      'Follow ten slow breaths from start to finish.'
    ],
  },
  {
    id: 'single-point-focus',
    title: 'Single-Point Focus Clarity',
    category: 'Focus',
    durationMinutes: 10,
    image: IMAGES.knowledge,
    defaultSoundscape: 'silence',
    description: 'Sharpen sustained attention by counting exhales cleanly from one to ten and restarting patiently.',
    guidancePrompts: [
      'Count "one" silently at the end of the first exhale.',
      'Continue up to ten; if you lose count, smile lightly and restart at one.'
    ],
  },
  {
    id: 'guided-compassion',
    title: 'Guided Loving-Kindness & Ease',
    category: 'Guided Meditation',
    durationMinutes: 12,
    image: IMAGES.meditation,
    defaultSoundscape: 'singing-bowl',
    description: 'Cultivate warmth and emotional steadiness toward yourself and others through quiet phrases.',
    guidancePrompts: [
      'Place one hand gently over your heart center.',
      'Silently offer: "May I be calm. May I be steady. May I meet today with patience."',
      'Extend the same wish outward to someone you care about.'
    ],
  },
  {
    id: 'deep-relaxation-drift',
    title: 'Stillness & Deep Relaxation',
    category: 'Relaxation',
    durationMinutes: 20,
    image: IMAGES.hero,
    defaultSoundscape: 'rain',
    description: 'Extended restorative stillness for post-workout recovery or weekend decompression.',
    guidancePrompts: [
      'Wrap up in a light blanket if the room is cool.',
      'Simply listen to the gentle ambient soundscape without analyzing it.'
    ],
  },
  {
    id: 'breath-awareness-8',
    title: 'Nasal Breath Awareness',
    category: 'Breathing',
    durationMinutes: 8,
    image: IMAGES.breathing,
    defaultSoundscape: 'om-drone',
    description: 'Observe the subtle cool inhale and warm exhale at the tip of the nose.',
    guidancePrompts: [
      'Keep lips softly closed and breathe exclusively through the nose.',
      'Notice the tiny pause between each exhale and the next inhale.'
    ],
  },
  {
    id: 'nada-yoga-yaman',
    title: 'Nada Yoga · Evening Raga Yaman',
    category: 'Guided Meditation',
    durationMinutes: 15,
    image: IMAGES.meditation,
    defaultSoundscape: 'raga-yaman',
    description: 'Traditional Indian evening contemplation resting attention on soft Bansuri flute phrases over a resonant Tanpura drone.',
    guidancePrompts: [
      'Sit upright in Sukhasana or on a chair with palms resting open on thighs.',
      'Allow the Tanpura Sa-Pa-Sa drone to settle background thoughts.',
      'Follow each rising and falling Bansuri note like an unhurried breath.'
    ],
  },
  {
    id: 'dawn-tanpura-dhyana',
    title: 'Morning Tanpura & Dawn Raga Bhairav',
    category: 'Mindfulness',
    durationMinutes: 10,
    image: IMAGES.knowledge,
    defaultSoundscape: 'raga-bhairav',
    description: 'Classical dawn Raga Bhairav and 136.1 Hz Tanpura stillness to begin the morning grounded and clear.',
    guidancePrompts: [
      'Listen first to the continuous Tanpura resonance before shaping any thought.',
      'Sync slow abdominal breaths to the gentle dawn flute intervals.',
      'Close with a silent moment of gratitude as the final chime fades.'
    ],
  },
];

export interface BreathingProtocol {
  id: string;
  name: string;
  subtitle: string;
  inhaleSec: number;
  holdInSec: number;
  exhaleSec: number;
  holdOutSec: number;
  defaultCycles: number;
  benefits: string[];
  safetyNote: string;
}

export const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing (Sama Vritti)',
    subtitle: 'Equal four-part cadence for calm focus under pressure',
    inhaleSec: 4,
    holdInSec: 4,
    exhaleSec: 4,
    holdOutSec: 4,
    defaultCycles: 6,
    benefits: ['Steadies heart rate variability', 'Clears pre-meeting mental fog', 'Supports emotional equilibrium'],
    safetyNote: 'If holding the breath feels straining, shorten holds to 2 seconds or switch to Deep Belly Breathing.',
  },
  {
    id: 'deep-belly',
    name: 'Deep Diaphragmatic Breathing',
    subtitle: 'Gentle belly expansion with relaxed longer exhale',
    inhaleSec: 4,
    holdInSec: 2,
    exhaleSec: 6,
    holdOutSec: 0,
    defaultCycles: 8,
    benefits: ['Reduces upper-chest shallow breathing', 'Activates vagal relaxation response', 'Accessible for beginners'],
    safetyNote: 'Keep shoulders relaxed; avoid forcing lungs to maximum capacity.',
  },
  {
    id: 'slow-resonant',
    name: 'Slow Resonant Breathing',
    subtitle: 'Continuous 5.5-second cadence (~5.5 breaths per minute)',
    inhaleSec: 5,
    holdInSec: 0,
    exhaleSec: 6,
    holdOutSec: 0,
    defaultCycles: 8,
    benefits: ['Optimizes cardiorespiratory coherence', 'Gentle enough for daily 10-minute practice'],
    safetyNote: 'Breathe softly and silently; pause if you ever feel lightheaded.',
  },
  {
    id: 'guided-478',
    name: '4-7-8 Evening Relaxation',
    subtitle: 'Extended exhale protocol suited for winding down before sleep',
    inhaleSec: 4,
    holdInSec: 7,
    exhaleSec: 8,
    holdOutSec: 0,
    defaultCycles: 4,
    benefits: ['Slows evening nervous-system arousal', 'Helps transition into restful sleep'],
    safetyNote: 'Beginners should start with 4 cycles maximum. Skip prolonged breath holds if pregnant or dizzy.',
  },
];

export interface DeepDiveLesson {
  id: string;
  title: string;
  durationMinutes: number;
  content: string[];
  practiceTip: string;
}

export interface DeepDiveProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  objectives: string[];
  lessons: DeepDiveLesson[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const DEEP_DIVE_PROGRAMS: DeepDiveProgram[] = [
  {
    id: 'yoga-fundamentals',
    title: 'Yoga Fundamentals',
    category: 'Foundations',
    description: 'Master safe joint stacking, breath-to-movement rhythm, and foundational standing & floor postures.',
    image: IMAGES.treePose,
    objectives: ['Understand neutral spine & joint alignment', 'Coordinate Ujjayi-style nasal breath with movement', 'Use props smartly without ego'],
    lessons: [
      {
        id: 'yf-1',
        title: 'Alignment From the Ground Up',
        durationMinutes: 6,
        content: [
          'Every standing posture begins at the feet. Spreading weight evenly across the big-toe mound, pinky-toe mound, and center heel creates an active arch that protects knees and hips.',
          'Rather than forcing flexibility, prioritize stacking joints safely: knees tracking over second toes, wrists aligned beneath shoulders, and ribs soft over the pelvis.'
        ],
        practiceTip: 'Spend 60 seconds in Mountain Pose before every flow to calibrate your balance.',
      },
      {
        id: 'yf-2',
        title: 'Breath Leads Movement',
        durationMinutes: 5,
        content: [
          'In vinyasa and hatha yoga, movement follows breath rather than the reverse. Inhales naturally accompany upward, expansive motions (lifting arms, lengthening spine); exhales support grounding, folding, and twisting.',
          'If your breath becomes ragged or short, that is your body’s clearest signal to ease back 10%.'
        ],
        practiceTip: 'Practice 6 slow rounds of Cat-Cow letting the breath finish slightly before each posture peak.',
      },
    ],
    quiz: [
      {
        question: 'Which breath phase generally accompanies spinal lengthening or lifting movements?',
        options: ['Inhale', 'Breath retention only', 'Rapid exhale'],
        correctIndex: 0,
        explanation: 'Inhales naturally expand the ribcage and support upward, lengthening postures.',
      },
      {
        question: 'What is the most reliable cue that you are pushing too far into a pose?',
        options: ['Warm muscles', 'Short, strained, or held breathing', 'Mild stretching sensation'],
        correctIndex: 1,
        explanation: 'Smooth, steady nasal breathing indicates sustainable effort.',
      },
    ],
  },
  {
    id: 'yoga-philosophy',
    title: 'Yoga Philosophy & Eight Limbs',
    category: 'Philosophy',
    description: 'Explore Patanjali’s classical Ashtanga framework as practical ethical and mindful living tools.',
    image: IMAGES.knowledge,
    objectives: ['Distinguish Yamas & Niyamas in daily life', 'See asana as preparation for stillness', 'Apply Ahimsa (non-harming) on the mat'],
    lessons: [
      {
        id: 'yp-1',
        title: 'Ahimsa & Santosha on the Mat',
        durationMinutes: 7,
        content: [
          'Patanjali’s Yoga Sutras place ethical conduct (Yamas) and personal observances (Niyamas) before physical postures (Asana).',
          'Ahimsa (non-harming) means listening to joint signals instead of competing with photos. Santosha (contentment) invites appreciating your body’s capacity today.'
        ],
        practiceTip: 'Choose one modification today out of self-respect rather than frustration.',
      },
      {
        id: 'yp-2',
        title: 'From Asana to Dhyana',
        durationMinutes: 6,
        content: [
          'Classical yoga progresses from physical steadiness (Asana) and breath regulation (Pranayama) toward sensory quieting (Pratyahara) and effortless meditation (Dhyana).'
        ],
        practiceTip: 'Always reserve at least 3 minutes for Savasana at the end of physical practice.',
      },
    ],
    quiz: [
      {
        question: 'How does Ahimsa apply during physical yoga practice?',
        options: ['Pushing through sharp joint pain', 'Respecting body limits and avoiding strain', 'Practicing only advanced inversions'],
        correctIndex: 1,
        explanation: 'Ahimsa (non-harming) encourages compassionate awareness and injury-free movement.',
      },
    ],
  },
  {
    id: 'breathing-techniques',
    title: 'Breathing Techniques & Pranayama',
    category: 'Breathwork',
    description: 'Learn how CO2 tolerance, diaphragmatic mechanics, and exhale length shape calm focus.',
    image: IMAGES.breathing,
    objectives: ['Engage the diaphragm efficiently', 'Differentiate energizing vs calming breath ratios', 'Practice safely without hyperventilation'],
    lessons: [
      {
        id: 'bt-1',
        title: 'Why Exhale Length Matters',
        durationMinutes: 6,
        content: [
          'Heart rate subtly increases during inhalation and slows slightly during exhalation—a natural physiological rhythm known as respiratory sinus arrhythmia.',
          'Extending the exhale smoothly (such as 4 seconds in, 6 seconds out) encourages parasympathetic calming.'
        ],
        practiceTip: 'Try 5 minutes of 4-2-6 breathing whenever evening restlessness appears.',
      },
    ],
    quiz: [
      {
        question: 'Which breathing pattern best promotes parasympathetic down-regulation?',
        options: ['Rapid mouth breathing', 'Gentle nasal inhales with slightly longer exhales', 'Forceful breath holding until dizzy'],
        correctIndex: 1,
        explanation: 'Longer, unstrained nasal exhales support vagal calming.',
      },
    ],
  },
  {
    id: 'meditation-fundamentals',
    title: 'Meditation Fundamentals',
    category: 'Meditation',
    description: 'Demystify meditation: noticing distraction is the practice, not a failure.',
    image: IMAGES.meditation,
    objectives: ['Build a sustainable 5–10 min daily sit', 'Work skillfully with wandering thoughts', 'Choose comfortable seated ergonomics'],
    lessons: [
      {
        id: 'mf-1',
        title: 'The Myth of the Empty Mind',
        durationMinutes: 6,
        content: [
          'Meditation is not forcing thoughts to stop. Every time you notice your mind has drifted and gently return attention to your breath, you complete one mental repetition of awareness.',
          'Elevating your hips on a cushion or sitting in a supportive chair keeps your lower back relaxed so attention stays clear.'
        ],
        practiceTip: 'Anchor your sit immediately after an existing habit, like morning tea or brushing teeth.',
      },
    ],
    quiz: [
      {
        question: 'What should you do when you notice your mind wandering during meditation?',
        options: ['Stop the session immediately', 'Acknowledge it gently and return to the breath anchor', 'Criticize yourself for losing focus'],
        correctIndex: 1,
        explanation: 'Gently returning attention is the core skill being trained.',
      },
    ],
  },
  {
    id: 'mindfulness-living',
    title: 'Mindfulness in Everyday Life',
    category: 'Mindfulness',
    description: 'Bring presence to walking, meals, digital transitions, and interpersonal listening.',
    image: IMAGES.knowledge,
    objectives: ['Reduce autopilot scrolling', 'Practice single-tasking transitions', 'Use micro-pauses before reacting'],
    lessons: [
      {
        id: 'ml-1',
        title: 'The 30-Second Transition Pause',
        durationMinutes: 5,
        content: [
          'Most daily stress accumulates in rushed transitions between meetings, chores, and screens. Taking three deliberate breaths before opening a new tab or walking through a doorway prevents emotional spillover.'
        ],
        practiceTip: 'Take three slow breaths before unlocking your phone in the morning.',
      },
    ],
    quiz: [
      {
        question: 'How can mindfulness fit into a busy schedule?',
        options: ['Only during 2-hour silent retreats', 'Through intentional 30-second transitions and single-tasking', 'By multitasking faster'],
        correctIndex: 1,
        explanation: 'Short, consistent awareness pauses accumulate meaningfully across the day.',
      },
    ],
  },
  {
    id: 'stress-management',
    title: 'Stress Management & Nervous System Care',
    category: 'Stress Relief',
    description: 'Practical somatic, cognitive, and restorative routines to recover from chronic busyness.',
    image: IMAGES.hero,
    objectives: ['Recognize early somatic stress cues', 'Match practice intensity to energy state', 'Build a restorative evening buffer'],
    lessons: [
      {
        id: 'sm-1',
        title: 'Matching Movement to Stress State',
        durationMinutes: 7,
        content: [
          'When feeling wired and anxious, vigorous movement followed by restorative postures helps discharge adrenaline. When depleted and fatigued, gentle supine poses like Child’s Pose or Legs-Up-the-Wall replenish energy without taxing reserves.'
        ],
        practiceTip: 'Check your mood and energy before picking a flow rather than forcing the hardest routine.',
      },
    ],
    quiz: [
      {
        question: 'Which approach fits best when you feel exhausted and burned out?',
        options: ['High-intensity power flow', 'Restorative poses and gentle breathwork', 'Skipping rest altogether'],
        correctIndex: 1,
        explanation: 'Restorative movement supports recovery when energy reserves are low.',
      },
    ],
  },
  {
    id: 'holistic-wellness',
    title: 'Holistic Wellness & Daily Rhythms',
    category: 'Holistic Health',
    description: 'Integrate sleep consistency, hydration, morning light, and balanced nourishment.',
    image: IMAGES.knowledge,
    objectives: ['Align sleep & wake anchors', 'Connect hydration with afternoon focus', 'Distinguish traditional rituals from medical care'],
    lessons: [
      {
        id: 'hw-1',
        title: 'Circadian Anchors & Daily Rhythm',
        durationMinutes: 6,
        content: [
          'Consistent wake times, early morning natural daylight, regular hydration, and an evening wind-down hour reinforce circadian rhythm—the biological foundation beneath energy, mood, and digestion.'
        ],
        practiceTip: 'Pair your first glass of water with 5 minutes of morning sunlight.',
      },
    ],
    quiz: [
      {
        question: 'Which habit most reliably supports circadian rhythm?',
        options: ['Consistent wake time and morning daylight exposure', 'Late-night caffeine', 'Irregular weekend sleep shifts'],
        correctIndex: 0,
        explanation: 'Morning daylight and consistent wake timing anchor circadian biology.',
      },
    ],
  },
];

export interface KnowledgeArticle {
  id: string;
  title: string;
  category:
    | 'Yoga Science'
    | 'Meditation'
    | 'Ayurveda and Traditional Wellness'
    | 'Mindfulness'
    | 'Healthy Lifestyle'
    | 'Nutrition Fundamentals'
    | 'Breathing Techniques'
    | 'Mental Wellness Education';
  readingMinutes: number;
  image: string;
  evidenceNote: string;
  summary: string;
  paragraphs: string[];
  relatedIds: string[];
}

export const KNOWLEDGE_CATEGORIES = [
  'Yoga Science',
  'Meditation',
  'Ayurveda and Traditional Wellness',
  'Mindfulness',
  'Healthy Lifestyle',
  'Nutrition Fundamentals',
  'Breathing Techniques',
  'Mental Wellness Education',
] as const;

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-yoga-science',
    title: 'How Mindful Movement Supports Joint Mobility & Autonomic Balance',
    category: 'Yoga Science',
    readingMinutes: 5,
    image: IMAGES.warriorPose,
    evidenceNote: 'Evidence Context: Supported by clinical exercise physiology and randomized trials on mobility and stress reduction.',
    summary: 'Explore what modern biomechanics and neurophysiology observe during steady, breath-led yoga practice.',
    paragraphs: [
      'Controlled isometric and eccentric muscle contractions in postures like Warrior II build joint-stabilizing strength around the knees, hips, and shoulders without high-impact joint loading.',
      'Simultaneously, slow nasal breathing coupled with attentive body awareness stimulates mechanoreceptors and modulates autonomic tone, helping practitioners feel both physically engaged and mentally calm.',
      'Yoga complements—rather than replaces—medical rehabilitation when acute orthopedic injuries are present.'
    ],
    relatedIds: ['art-breathing-vagal', 'art-meditation-neuro'],
  },
  {
    id: 'art-meditation-neuro',
    title: 'Attention Training: What Happens When You Notice a Wandering Mind',
    category: 'Meditation',
    readingMinutes: 6,
    image: IMAGES.meditation,
    evidenceNote: 'Evidence Context: Grounded in cognitive neuroscience studies on attentional networks and stress reactivity.',
    summary: 'Understanding default-mode mind wandering and why gentle redirection strengthens emotional regulation.',
    paragraphs: [
      'Neuroimaging research highlights the brain’s Default Mode Network (DMN), active during self-referential rumination and future worry. Focused-attention meditation trains the capacity to recognize distraction early.',
      'Each non-judgmental return to the breath builds metacognitive awareness—the ability to observe a stressful thought as a passing event rather than an immediate emergency.'
    ],
    relatedIds: ['art-mindfulness-habits', 'art-mental-wellness'],
  },
  {
    id: 'art-ayurveda-dinacharya',
    title: 'Dinacharya: Traditional Ayurvedic Daily Rhythms in Modern Schedules',
    category: 'Ayurveda and Traditional Wellness',
    readingMinutes: 6,
    image: IMAGES.knowledge,
    evidenceNote: 'Traditional Wisdom Note: Dinacharya reflects classical Ayurvedic lifestyle traditions; circadian alignment benefits are broadly supported by sleep science, though dosha frameworks are traditional models rather than clinical diagnostics.',
    summary: 'Practical morning and evening rituals adapted from classical Ayurvedic lifestyle wisdom.',
    paragraphs: [
      'Traditional Ayurveda emphasizes Dinacharya—harmonizing daily waking, hydration, gentle movement, meals, and rest with natural solar cycles.',
      'Modern practitioners can adapt simple, low-friction elements: warm water upon waking, 10 minutes of gentle spinal mobility, unhurried lunches away from screens, and dimming lights an hour before sleep.'
    ],
    relatedIds: ['art-healthy-sleep', 'art-nutrition-mindful'],
  },
  {
    id: 'art-mindfulness-habits',
    title: 'Micro-Mindfulness: Replacing Digital Overload With Intentional Pauses',
    category: 'Mindfulness',
    readingMinutes: 4,
    image: IMAGES.breathing,
    evidenceNote: 'Evidence Context: Behavioral habit-formation research supports cue-linked micro-practices for long-term adherence.',
    summary: 'Small 60-second awareness anchors you can weave into workdays without rearranging your calendar.',
    paragraphs: [
      'Consistency beats marathon sessions. Linking three slow breaths to everyday triggers—starting your laptop, waiting for tea to steep, or stepping outdoors—builds steady attentional resilience.',
      'Over several weeks, these micro-pauses reduce reactive multitasking and improve perceived clarity.'
    ],
    relatedIds: ['art-meditation-neuro', 'art-mental-wellness'],
  },
  {
    id: 'art-healthy-sleep',
    title: 'Evening Wind-Down Architecture for Deeper Restorative Sleep',
    category: 'Healthy Lifestyle',
    readingMinutes: 5,
    image: IMAGES.hero,
    evidenceNote: 'Evidence Context: Aligns with established behavioral sleep medicine and circadian light-hygiene guidelines.',
    summary: 'How light, temperature, and gentle restorative poses prepare the body for uninterrupted sleep.',
    paragraphs: [
      'Core body temperature and ambient light strongly signal melatonin onset. Dimming overhead lighting 60 minutes before bed and keeping bedrooms cool eases the transition to sleep.',
      'Pairing 5 minutes of Child’s Pose or Seated Forward Fold with slow 4-6 breathing helps close mental open loops from the workday.'
    ],
    relatedIds: ['art-ayurveda-dinacharya', 'art-breathing-vagal'],
  },
  {
    id: 'art-nutrition-mindful',
    title: 'Hydration, Whole Foods & Mindful Eating Fundamentals',
    category: 'Nutrition Fundamentals',
    readingMinutes: 5,
    image: IMAGES.knowledge,
    evidenceNote: 'Evidence Context: Consistent with evidence-based nutritional guidelines for hydration, fiber, and balanced blood-glucose energy.',
    summary: 'Simple, non-restrictive nutrition habits that sustain steady yoga energy and digestive comfort.',
    paragraphs: [
      'Even mild dehydration contributes to afternoon fatigue and tension headaches. Spacing water intake steadily across morning and afternoon supports focus without late-evening sleep disruption.',
      'Eating slowly without scrolling allows satiety signals to register clearly and improves post-meal lightness before afternoon or evening movement.'
    ],
    relatedIds: ['art-ayurveda-dinacharya', 'art-healthy-sleep'],
  },
  {
    id: 'art-breathing-vagal',
    title: 'Slow Nasal Breathing & Heart-Rate Variability Explained',
    category: 'Breathing Techniques',
    readingMinutes: 5,
    image: IMAGES.breathing,
    evidenceNote: 'Evidence Context: Supported by physiological studies on slow-paced breathing (~6 breaths/min) and autonomic regulation.',
    summary: 'Why gentle nasal inhales and unhurried exhales offer direct leverage over everyday stress.',
    paragraphs: [
      'Nasal breathing warms, filters, and humidifies air while engaging diaphragmatic motion more effectively than rapid upper-chest mouth breathing.',
      'Practicing 5 to 10 minutes of paced breathing at roughly 5 to 6 breaths per minute smoothly supports heart-rate variability and calm alertness.'
    ],
    relatedIds: ['art-yoga-science', 'art-healthy-sleep'],
  },
  {
    id: 'art-mental-wellness',
    title: 'Emotional Check-Ins: Naming Feelings Without Clinical Self-Diagnosis',
    category: 'Mental Wellness Education',
    readingMinutes: 5,
    image: IMAGES.meditation,
    evidenceNote: 'Evidence Context: Affect labeling ("name it to tame it") is studied in affective neuroscience; mood tracking is reflective self-awareness, not medical diagnosis.',
    summary: 'How brief daily mood reflection reveals patterns across sleep, movement, and workload.',
    paragraphs: [
      'Simply putting words to an emotional state—calm, tired, stressed, or steady—helps dampen amygdala reactivity and encourages thoughtful self-care choices.',
      'Tracking patterns alongside yoga or breathing logs highlights which habits genuinely restore your energy. If persistent distress interferes with daily functioning, always consult a licensed mental health clinician.'
    ],
    relatedIds: ['art-meditation-neuro', 'art-mindfulness-habits'],
  },
];

export interface ChallengeDefinition {
  id: string;
  title: string;
  durationDays: number;
  category: string;
  badgeTitle: string;
  description: string;
  dailyPrompt: string;
}

export const WELLNESS_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'challenge-7-yoga',
    title: '7-Day Yoga Consistency Challenge',
    durationDays: 7,
    category: 'Yoga',
    badgeTitle: 'Rooted Mover',
    description: 'Practice at least 10 minutes of mindful yoga asana each day for 7 days to build spinal mobility and habit momentum.',
    dailyPrompt: 'Complete one posture sequence or guided flow from the Yoga Studio.',
  },
  {
    id: 'challenge-7-meditation',
    title: '7-Day Meditation Stillness Challenge',
    durationDays: 7,
    category: 'Meditation',
    badgeTitle: 'Quiet Anchor',
    description: 'Sit for 5 to 15 minutes daily in guided or silent stillness to strengthen attentional steadiness.',
    dailyPrompt: 'Finish one timed Meditation Studio session with your chosen soundscape.',
  },
  {
    id: 'challenge-21-mindfulness',
    title: '21-Day Mindfulness Reset',
    durationDays: 21,
    category: 'Mindfulness',
    badgeTitle: 'Mindful Steward',
    description: 'Three steady weeks combining daily mood check-ins, single-tasking pauses, and evening reflection.',
    dailyPrompt: 'Log your daily mood check-in and take one screen-free mindful pause.',
  },
  {
    id: 'challenge-14-breathing',
    title: '14-Day Daily Breathing Reset',
    durationDays: 14,
    category: 'Breathwork',
    badgeTitle: 'Steady Breath',
    description: 'Reset your nervous system with 4+ rounds of Box, Resonant, or 4-7-8 breathing every day.',
    dailyPrompt: 'Complete one guided protocol in the Breathing Studio.',
  },
  {
    id: 'challenge-10-morning',
    title: '10-Day Morning Wellness Ritual',
    durationDays: 10,
    category: 'Holistic',
    badgeTitle: 'Dawn Ritualist',
    description: 'Start mornings with hydration, light movement, and a clear daily wellness plan before checking feeds.',
    dailyPrompt: 'Drink 2 glasses of water and complete your morning block in the Daily Planner.',
  },
];

export const LANDING_TESTIMONIALS = [
  {
    name: 'Ananya Deshmukh',
    role: 'Product Architect',
    organization: 'Pune',
    quote: 'Replacing late-night scrolling with a 10-minute Child’s Pose and 4-7-8 breath sequence cut my sleep onset time in half within three weeks.',
  },
  {
    name: 'Dr. Rohan Kulkarni',
    role: 'Clinical Physiotherapist',
    organization: 'Mumbai',
    quote: 'FlowState’s emphasis on beginner modifications, breathing cues, and clear non-medical boundaries makes it a resource I comfortably recommend for daily mobility.',
  },
  {
    name: 'Elena Vance',
    role: 'Engineering Lead',
    organization: 'Seattle',
    quote: 'The AI Yoga Coach remembers my stiff lower back and 15-minute morning window, giving me sequences I actually finish before standup.',
  },
];

export const LANDING_FAQS = [
  {
    q: 'Do I need prior yoga experience to start with FlowState Wellness?',
    a: 'Not at all. Every pose includes Beginner modifications, clear precautions, and step-by-step breath cues so you can practice comfortably at your own pace.',
  },
  {
    q: 'How does the AI Wellness Assistant personalize guidance?',
    a: 'Powered by Google Gemini on our server, the assistant considers your selected experience level, wellness goals, preferred practice time, and conversation history—supporting English, Hindi, and Marathi.',
  },
  {
    q: 'Is mood tracking or AI coaching a substitute for medical care?',
    a: 'No. FlowState Wellness provides educational wellness tools and self-reflection logs. It never offers medical diagnoses and encourages consulting licensed clinicians for health concerns.',
  },
  {
    q: 'How is my personal practice data stored?',
    a: 'When you sign in with Google, your profile, practice logs, mood check-ins, daily plans, and conversation history are securely persisted to your private Firebase Firestore account.',
  },
];
