export type CuratedMove = {
  name: string;
  dose: string;
  instruction: string;
};

export type CuratedBlock = {
  heading: string;
  rounds: string;
  rest: string;
  intro: string;
  moves: CuratedMove[];
};

export type CuratedWorkout = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  summary: string;
  duration: string;
  equipment: string;
  space: string;
  level: string;
  format: string;
  bestFor: string[];
  setup: string[];
  warmup: CuratedMove[];
  blocks: CuratedBlock[];
  cooldown: CuratedMove[];
  pacing: string[];
  adaptations: Array<{ heading: string; copy: string }>;
  limitations: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
};

export const curatedWorkouts = [
  {
    slug: 'no-equipment',
    title: 'No-equipment full-body workout',
    seoTitle: 'No-Equipment Workout: A Balanced 24-Minute Session',
    description:
      'Try a practical 24-minute bodyweight workout with a warm-up, balanced full-body circuit, cooldown, pacing guidance, and easier options.',
    eyebrow: 'Bodyweight session',
    summary:
      'This example combines a squat, hip hinge, push, upper-back movement, and trunk exercise without requiring weights or a machine. It is a general session for adults who are comfortable getting down to the floor.',
    duration: 'About 24 minutes',
    equipment: 'None; a wall is useful',
    space: 'Enough room to lie down',
    level: 'Beginner-friendly',
    format: 'Two controlled circuits',
    bestFor: [
      'Home or hotel workouts when no equipment is available',
      'Practising basic movement patterns at a self-selected pace',
      'A full-body session that is not built around jumping',
    ],
    setup: [
      'Clear enough floor space to extend your arms and legs, and check that the surface is not slippery.',
      'Keep a stable wall nearby for the push-up and optional balance support.',
      'Use a timer only if it helps; clean repetitions matter more than finishing quickly.',
    ],
    warmup: [
      {
        name: 'March in Place',
        dose: '60 seconds',
        instruction:
          'Build from an easy march while letting the arms swing naturally.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '5 slow turns each side',
        instruction:
          'Keep the hips mostly forward and rotate through a comfortable range.',
      },
      {
        name: 'Hip Hinge Reach',
        dose: '8 repetitions',
        instruction:
          'Send the hips back with a long spine, then stand tall without rushing.',
      },
    ],
    blocks: [
      {
        heading: 'Circuit A: legs, push, and trunk',
        rounds: '2 rounds',
        rest: 'Rest 20–40 seconds between exercises and 60 seconds after each round.',
        intro:
          'Move in order. Leave a few good repetitions in reserve instead of working to failure.',
        moves: [
          {
            name: 'Bodyweight Squat',
            dose: '8–12 repetitions',
            instruction:
              'Keep the whole foot grounded and use a depth you can control.',
          },
          {
            name: 'Wall Push-Up',
            dose: '8–12 repetitions',
            instruction:
              'Keep the body in one line and bring the chest toward the wall between the hands.',
          },
          {
            name: 'Dead Bug',
            dose: '5–8 repetitions each side',
            instruction:
              'Move one opposite arm and leg only as far as the trunk stays steady.',
          },
        ],
      },
      {
        heading: 'Circuit B: hinge, upper back, and control',
        rounds: '2 rounds',
        rest: 'Rest 20–40 seconds between exercises and 60 seconds after each round.',
        intro: 'Treat this as deliberate strength practice, not a race.',
        moves: [
          {
            name: 'Bodyweight Good Morning',
            dose: '10–15 repetitions',
            instruction:
              'Soften the knees, move the hips back, and stop before the back position changes.',
          },
          {
            name: 'Prone W Raise',
            dose: '6–10 repetitions',
            instruction:
              'Lift the elbows and hands only slightly while keeping the neck relaxed.',
          },
          {
            name: 'Glute Bridge',
            dose: '10–15 repetitions',
            instruction:
              'Press through the feet and finish with the ribs and pelvis controlled rather than arching.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Cat-Cow',
        dose: '5 slow cycles',
        instruction:
          'Move gently between comfortable rounded and extended positions.',
      },
      {
        name: 'Easy walk and breathing',
        dose: '60–90 seconds',
        instruction:
          'Walk slowly until breathing settles; there is no need to force deep breaths.',
      },
    ],
    pacing: [
      'Start with one round of each circuit if two rounds would make technique deteriorate.',
      'When all repetitions feel controlled, add repetitions within the range before adding another round.',
      'Use the wall push-up at a more upright angle to reduce difficulty or choose a lower stable surface to increase it.',
    ],
    adaptations: [
      {
        heading: 'Prefer to stay standing?',
        copy: 'Replace Dead Bug with Standing Cross-Body Knee Drive, Prone W Raise with Standing Scapular Retraction, and Glute Bridge with another controlled set of Hip Hinge Reach.',
      },
      {
        heading: 'Deep knee bending is not comfortable today?',
        copy: 'Use a shallower squat, light wall support, or a stable Chair Sit-to-Stand. This is a preference-based substitution, not injury treatment.',
      },
      {
        heading: 'Need a quieter version?',
        copy: 'Keep every foot placement soft, omit fast transitions, and pause between floor and standing exercises.',
      },
    ],
    limitations: [
      'A bodyweight session cannot provide the same adjustable external loading as dumbbells or bands.',
      'This example assumes floor access and does not account for individual conditions, symptoms, or clinician instructions.',
      'It is a single session, not a personalized progression plan or rehabilitation program.',
    ],
    faqs: [
      {
        question: 'Can a no-equipment workout be challenging?',
        answer:
          'Yes. Range of motion, tempo, pauses, repetitions, exercise leverage, and total rounds can change the challenge. Progress one variable at a time while keeping the movement controlled.',
      },
      {
        question: 'Should I complete every repetition listed?',
        answer:
          'No. The ranges are starting points. Stop the set when you cannot maintain the chosen technique, and use fewer repetitions or an easier variation as needed.',
      },
      {
        question: 'What if I cannot use the floor?',
        answer:
          'Use the standing substitutions on this page or choose the standing-only workout, which avoids floor positions throughout.',
      },
    ],
    relatedSlugs: ['quiet-apartment', 'standing-only', '15-minute'],
  },
  {
    slug: 'one-dumbbell',
    title: 'One-dumbbell full-body workout',
    seoTitle: 'One-Dumbbell Workout: A Practical Full-Body Session',
    description:
      'Use one dumbbell for a balanced 30-minute session with unilateral strength work, clear side handling, load guidance, and substitutions.',
    eyebrow: 'Single-weight session',
    summary:
      'One dumbbell is enough to train a squat, hinge, pull, press, and carry pattern. This session alternates sides deliberately and never assumes that a matching second weight is available.',
    duration: 'About 30 minutes',
    equipment: 'One dumbbell',
    space: 'Small clear area plus a short carry path',
    level: 'Beginner to intermediate',
    format: 'Paired sets and carries',
    bestFor: [
      'Training with a single fixed-weight dumbbell',
      'Full-body practice with deliberate left-right work',
      'A strength-focused session without rapid transitions',
    ],
    setup: [
      'Choose a dumbbell you can lift, hold, and return to the floor without dropping it.',
      'Clear a short walking path for carries; marching in place is an alternative.',
      'Complete both sides of a unilateral exercise before moving on unless the instruction says to alternate.',
    ],
    warmup: [
      {
        name: 'March in Place',
        dose: '60 seconds',
        instruction:
          'Start easily and gradually raise the knees to a comfortable height.',
      },
      {
        name: 'Bodyweight Squat',
        dose: '8 repetitions',
        instruction:
          'Practise the squat unloaded before picking up the dumbbell.',
      },
      {
        name: 'Hip Hinge Reach',
        dose: '8 repetitions',
        instruction:
          'Rehearse sending the hips back while the spine stays long.',
      },
    ],
    blocks: [
      {
        heading: 'Pair A: squat and row',
        rounds: '3 rounds',
        rest: 'Rest 30–60 seconds after each exercise.',
        intro:
          'Perform the squat, rest, then row both sides. A round ends after both sides of the row.',
        moves: [
          {
            name: 'Goblet Squat',
            dose: '8–12 repetitions',
            instruction:
              'Hold one end of the dumbbell close to the chest and keep the feet planted.',
          },
          {
            name: 'One-Arm Dumbbell Row',
            dose: '8–12 repetitions each side',
            instruction:
              'Support the free hand on the thigh or a stable surface and pull without twisting the torso.',
          },
        ],
      },
      {
        heading: 'Pair B: hinge and press',
        rounds: '2 rounds',
        rest: 'Rest 45–75 seconds after each exercise.',
        intro:
          'Use a floor press for a stable pressing position, then practise the suitcase deadlift from a controlled height.',
        moves: [
          {
            name: 'Suitcase Deadlift',
            dose: '8–10 repetitions each side',
            instruction:
              'Keep the weight close to one leg and resist leaning toward it as you stand.',
          },
          {
            name: 'One-Arm Dumbbell Floor Press',
            dose: '8–12 repetitions each side',
            instruction:
              'Keep the forearm controlled and lower until the upper arm meets the floor gently.',
          },
        ],
      },
      {
        heading: 'Carry finish',
        rounds: '2 rounds',
        rest: 'Rest 30–45 seconds between sides.',
        intro:
          'Use a load and distance that let you walk normally without rushing.',
        moves: [
          {
            name: 'Suitcase Carry',
            dose: '20–30 seconds each side',
            instruction:
              'Stand tall, keep the weight away from the thigh, and turn before the path ends.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Standing Hamstring Sweep',
        dose: '5 repetitions each side',
        instruction:
          'Use a small, smooth hinge rather than trying to reach the floor.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '4 slow turns each side',
        instruction:
          'Let the breathing return toward normal while moving easily.',
      },
    ],
    pacing: [
      'Use the weaker or less coordinated side to choose the repetition count, then match it on the other side.',
      'If the dumbbell is heavy, shorten the range or use fewer repetitions; do not speed through the lowering phase.',
      'If it is light, use a three-second lowering phase or a brief pause before adding more total work.',
    ],
    adaptations: [
      {
        heading: 'No comfortable floor position?',
        copy: 'Replace the floor press with a Wall Push-Up or stable Incline Push-Up. Keep the remaining session unchanged.',
      },
      {
        heading: 'No safe carry path?',
        copy: 'Hold the dumbbell at one side and march slowly in place, or use a timed stationary suitcase hold without leaning.',
      },
      {
        heading: 'Overhead work preferred?',
        copy: 'A Half-Kneeling One-Arm Dumbbell Press can replace the floor press for someone already comfortable controlling a weight overhead. It is not required for a balanced session.',
      },
    ],
    limitations: [
      'A fixed dumbbell may be appropriate for some movements but too light or too heavy for others.',
      'Unilateral exercises take extra time because both sides need attention.',
      'This session does not determine a safe load for you or override symptoms and professional guidance.',
    ],
    faqs: [
      {
        question: 'Do I need to switch hands every repetition?',
        answer:
          'No. For the exercises here, complete the listed repetitions on one side and then the other. For the goblet squat, hold the single dumbbell with both hands.',
      },
      {
        question: 'How do I choose a dumbbell weight?',
        answer:
          'Choose a load you can move smoothly through the intended range while keeping a few controlled repetitions in reserve. The same weight does not have to feel equally challenging in every exercise.',
      },
      {
        question: 'Can I do this with a kettlebell?',
        answer:
          'Many movement patterns are similar, but grip and setup differ. Use instructions written for your actual implement rather than assuming every dumbbell cue transfers directly.',
      },
    ],
    relatedSlugs: ['two-dumbbells', '15-minute', 'no-jumping'],
  },
  {
    slug: 'two-dumbbells',
    title: 'Two-dumbbell strength workout',
    seoTitle: 'Two-Dumbbell Workout: A Balanced 35-Minute Plan',
    description:
      'Follow a balanced 35-minute two-dumbbell workout covering squat, hinge, push, pull, and carry patterns with load and pacing guidance.',
    eyebrow: 'Dumbbell-pair session',
    summary:
      'A matched pair makes simultaneous loading practical. This example uses steady straight sets rather than a high-speed circuit so each lift can be set up carefully.',
    duration: 'About 35 minutes',
    equipment: 'Two dumbbells and floor space',
    space: 'Small room plus a clear carry path',
    level: 'Intermediate; scalable for newer lifters',
    format: 'Straight sets with a carry finish',
    bestFor: [
      'A general full-body strength session with a dumbbell pair',
      'People who prefer measured sets over timed circuits',
      'Training the major movement patterns in one session',
    ],
    setup: [
      'Use a pair you can lift into the starting positions and lower to the floor under control.',
      'Keep the floor clear around both sides of the body; never leave a dumbbell where it creates a trip hazard.',
      'Take extra warm-up repetitions with no weight if the first working set would otherwise be abrupt.',
    ],
    warmup: [
      {
        name: 'Step Jack',
        dose: '45 seconds',
        instruction: 'Step one foot out at a time and keep each landing soft.',
      },
      {
        name: 'Bodyweight Good Morning',
        dose: '10 repetitions',
        instruction: 'Rehearse the hip hinge without load.',
      },
      {
        name: 'Wall Slide',
        dose: '6–8 repetitions',
        instruction:
          'Move the arms only through a comfortable, controlled range.',
      },
    ],
    blocks: [
      {
        heading: 'Lower-body strength',
        rounds: '3 sets of each exercise',
        rest: 'Rest 60–90 seconds between sets.',
        intro: 'Finish all sets of the first lift before moving to the second.',
        moves: [
          {
            name: 'Two-Dumbbell Front Squat',
            dose: '6–10 repetitions',
            instruction:
              'Hold the pair at the shoulders and use a squat depth that keeps the feet and torso controlled.',
          },
          {
            name: 'Two-Dumbbell Romanian Deadlift',
            dose: '8–12 repetitions',
            instruction:
              'Slide the weights close to the thighs as the hips move back; stop when the hinge range ends.',
          },
        ],
      },
      {
        heading: 'Upper-body push and pull',
        rounds: '3 sets of each exercise',
        rest: 'Rest 60–90 seconds between sets.',
        intro:
          'The row and floor press use opposing patterns without requiring an overhead lift.',
        moves: [
          {
            name: 'Two-Dumbbell Bent-Over Row',
            dose: '8–12 repetitions',
            instruction:
              'Hold a stable hinge and draw the elbows back without jerking the weights.',
          },
          {
            name: 'Two-Dumbbell Floor Press',
            dose: '8–12 repetitions',
            instruction:
              'Lower both upper arms gently to the floor and keep the wrists stacked over the elbows.',
          },
        ],
      },
      {
        heading: 'Carry finish',
        rounds: '3 carries',
        rest: 'Rest 45–60 seconds between carries.',
        intro: 'Shorten the path before grip or posture changes.',
        moves: [
          {
            name: 'Farmer Carry',
            dose: '20–40 seconds',
            instruction:
              'Walk with controlled steps, shoulders relaxed, and both weights clear of the legs.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Standing Hamstring Sweep',
        dose: '5 repetitions each side',
        instruction:
          'Move slowly through an easy range after the loaded hinges.',
      },
      {
        name: 'Easy march',
        dose: '60 seconds',
        instruction:
          'Let grip and breathing settle before putting equipment away.',
      },
    ],
    pacing: [
      'The last repetition can feel demanding, but it should still look like the first few repetitions.',
      'When you reach the top of the range for every set with consistent control, consider a small load increase next time.',
      'If the pair is too heavy for the press, use one dumbbell at a time and follow the one-dumbbell session’s side handling.',
    ],
    adaptations: [
      {
        heading: 'New to dumbbell training?',
        copy: 'Use two sets rather than three, practise the pattern unloaded first, and allow up to two minutes between working sets.',
      },
      {
        heading: 'No room to carry?',
        copy: 'March in place with the weights or hold them still for 15–30 seconds, provided you can set them down safely.',
      },
      {
        heading: 'Avoiding the floor today?',
        copy: 'Replace the floor press with an Incline Push-Up on a stable surface. The session then remains entirely standing except for equipment pickup.',
      },
    ],
    limitations: [
      'One matched pair cannot perfectly load every movement pattern.',
      'The workout assumes you can safely bring two dumbbells to shoulder and floor positions.',
      'It is a general example, not individual load testing, sport-specific programming, or clinical guidance.',
    ],
    faqs: [
      {
        question: 'Must both dumbbells weigh the same?',
        answer:
          'A matched pair is simplest for this exact session. If the weights differ, use one at a time or switch sides between sets so the loading is deliberate rather than accidental.',
      },
      {
        question: 'Why are there no curls or lateral raises?',
        answer:
          'The session prioritizes a balanced set of compound patterns within 35 minutes. Isolation work can be added, but it is not necessary for this example to cover the main movement categories.',
      },
      {
        question: 'Can I make this a circuit?',
        answer:
          'You can, but rushing equipment transitions may reduce control. Straight sets are the default here so setup and rest remain clear.',
      },
    ],
    relatedSlugs: ['one-dumbbell', 'no-jumping', '15-minute'],
  },
  {
    slug: 'resistance-band',
    title: 'Resistance-band full-body workout',
    seoTitle: 'Resistance-Band Workout: A 30-Minute Full-Body Plan',
    description:
      'Try a 30-minute resistance-band workout with secure self-anchored setups, full-body movement balance, tension guidance, and alternatives.',
    eyebrow: 'Portable-equipment session',
    summary:
      'This workout uses band positions under the feet or around the upper back, so it does not rely on an unverified door anchor. Inspect the band first and keep it away from the face.',
    duration: 'About 30 minutes',
    equipment: 'One intact resistance band',
    space: 'Small standing area plus floor space',
    level: 'Beginner to intermediate',
    format: 'Three paired blocks',
    bestFor: [
      'Travel or home training with a portable band',
      'A full-body session without dumbbells',
      'Learning to control changing resistance through a movement',
    ],
    setup: [
      'Inspect the band for cracks, thin spots, tears, or damaged handles before every session.',
      'Use only positions you can secure under the middle of the feet or as described; this plan does not use furniture or door anchors.',
      'Start with light tension and keep the band path away from the eyes and face.',
    ],
    warmup: [
      {
        name: 'March in Place',
        dose: '60 seconds',
        instruction: 'Use relaxed arm swings and quiet steps.',
      },
      {
        name: 'Bodyweight Squat',
        dose: '8 repetitions',
        instruction:
          'Check your comfortable squat range before adding band tension.',
      },
      {
        name: 'Standing Scapular Retraction',
        dose: '8 repetitions',
        instruction:
          'Gently draw the shoulder blades back without lifting the shoulders.',
      },
    ],
    blocks: [
      {
        heading: 'Pair A: squat and pull',
        rounds: '3 rounds',
        rest: 'Rest 30–60 seconds between exercises.',
        intro: 'Check that the band remains centered before every set.',
        moves: [
          {
            name: 'Resistance-Band Squat',
            dose: '10–15 repetitions',
            instruction:
              'Stand on the middle of the band and hold the ends at the shoulders while squatting smoothly.',
          },
          {
            name: 'Seated Resistance-Band Row',
            dose: '10–15 repetitions',
            instruction:
              'Loop the band around both feet, sit tall, and pull the elbows back without leaning away.',
          },
        ],
      },
      {
        heading: 'Pair B: hinge and push',
        rounds: '3 rounds',
        rest: 'Rest 30–60 seconds between exercises.',
        intro: 'Release tension slowly at the end of every repetition.',
        moves: [
          {
            name: 'Resistance-Band Good Morning',
            dose: '10–15 repetitions',
            instruction:
              'Stand on the band, place it across the upper back over clothing, and hinge with a long spine.',
          },
          {
            name: 'Resistance-Band Chest Press',
            dose: '8–12 repetitions',
            instruction:
              'Run the band across the upper back, press forward, and return before tension pulls the hands back.',
          },
        ],
      },
      {
        heading: 'Pair C: lateral control and trunk',
        rounds: '2 rounds',
        rest: 'Rest 30–45 seconds between exercises.',
        intro:
          'These movements use smaller ranges; extra tension is not the goal.',
        moves: [
          {
            name: 'Resistance-Band Lateral Walk',
            dose: '6–10 steps each direction',
            instruction:
              'Use a secure band position and take small sideways steps without dragging the feet.',
          },
          {
            name: 'Resistance-Band Dead Bug',
            dose: '5–8 repetitions each side',
            instruction:
              'Keep the band centered around both feet and shorten the leg reach if the trunk shifts.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Cat-Cow',
        dose: '5 slow cycles',
        instruction:
          'Use a relaxed range after removing the band from the area.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '4 turns each side',
        instruction: 'Rotate gently and let breathing settle.',
      },
    ],
    pacing: [
      'Shortening or lengthening the band changes tension quickly; make small setup changes and test one repetition first.',
      'Keep tension light enough that the return phase stays controlled.',
      'Progress with repetitions or a slightly more stretched starting position only when the band remains secure.',
    ],
    adaptations: [
      {
        heading: 'Only a loop band?',
        copy: 'Loop bands vary widely in size. Use movements designed for that band and skip any setup that cannot be secured exactly as described.',
      },
      {
        heading: 'Staying off the floor?',
        copy: 'Replace the band dead bug with Standing Cross-Body Knee Drive. The seated row still requires sitting but not lying down.',
      },
      {
        heading: 'Band tension feels uneven?',
        copy: 'Stop, reset the midpoint under both feet, and check for damage. Do not compensate by twisting or gripping closer to a damaged section.',
      },
    ],
    limitations: [
      'Band resistance is difficult to quantify and varies by material, length, age, and stretch.',
      'This plan cannot verify the condition or rating of your band.',
      'It avoids external anchors, so it does not include every possible band exercise.',
    ],
    faqs: [
      {
        question: 'Can I attach the band to a door?',
        answer:
          'This session does not require a door anchor. Use a door only with a purpose-made anchor, equipment instructions, and a setup you have verified; a closing door alone is not a substitute.',
      },
      {
        question: 'How tight should the band be?',
        answer:
          'Begin with enough tension to stay organized but not so much that the band controls the return. You should be able to pause at any point without losing the setup.',
      },
      {
        question: 'When should I replace a band?',
        answer:
          'Follow the manufacturer’s guidance and stop using a band with cracks, tears, thin spots, damaged handles, or other visible deterioration.',
      },
    ],
    relatedSlugs: ['no-equipment', 'quiet-apartment', 'standing-only'],
  },
  {
    slug: 'quiet-apartment',
    title: 'Quiet apartment workout',
    seoTitle: 'Quiet Apartment Workout: 25 Minutes, No Jumping',
    description:
      'Follow a quiet 25-minute apartment workout with soft footwork, no jumping or dropped equipment, small-space instructions, and floor-free options.',
    eyebrow: 'Low-noise session',
    summary:
      'Quiet does not have to mean motionless. This session uses slow bodyweight strength work, soft steps, and no equipment drops. It is designed to reduce avoidable noise, not to guarantee silence in every building.',
    duration: 'About 25 minutes',
    equipment: 'None; a stable wall or chair is optional',
    space: 'Very small standing area',
    level: 'Beginner-friendly',
    format: 'Slow-tempo standing circuit',
    bestFor: [
      'Apartments, hotels, or shared homes where impact noise matters',
      'A small space without floor transitions',
      'A steady session without jumping or running',
    ],
    setup: [
      'Move furniture only if it can be relocated safely, and check rugs or mats for slipping.',
      'Wear footwear or use a surface that lets you place the feet softly without losing traction.',
      'Keep music and timers at a considerate volume; the workout itself cannot control every source of building noise.',
    ],
    warmup: [
      {
        name: 'Quiet weight shifts',
        dose: '45 seconds',
        instruction:
          'Shift side to side while keeping both feet close to the floor.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '5 turns each side',
        instruction: 'Rotate slowly without letting the feet pivot or stamp.',
      },
      {
        name: 'Standing Hamstring Sweep',
        dose: '5 repetitions each side',
        instruction: 'Use a small hinge and return to standing under control.',
      },
    ],
    blocks: [
      {
        heading: 'Quiet strength circuit',
        rounds: '3 rounds',
        rest: 'Rest 20–40 seconds between exercises and 60 seconds between rounds.',
        intro:
          'Use a three-second lowering phase on the squat and calf raise. Place, rather than drop, each foot.',
        moves: [
          {
            name: 'Chair Sit-to-Stand',
            dose: '8–12 repetitions',
            instruction:
              'Use a chair that cannot roll, touch down quietly, and stand without pushing the chair backward.',
          },
          {
            name: 'Wall Push-Up',
            dose: '8–12 repetitions',
            instruction:
              'Keep the feet planted and lower toward the wall slowly.',
          },
          {
            name: 'Bodyweight Good Morning',
            dose: '10–15 repetitions',
            instruction:
              'Hinge at the hips and squeeze the floor with the feet without shuffling them.',
          },
          {
            name: 'Standing Scapular Retraction',
            dose: '10–15 repetitions',
            instruction:
              'Draw the shoulder blades gently back and release without shrugging.',
          },
          {
            name: 'Standing Cross-Body Knee Drive',
            dose: '6–10 repetitions each side',
            instruction:
              'Lift and lower one foot softly; use the wall for light balance support if useful.',
          },
          {
            name: 'Standing Calf Raise',
            dose: '10–15 repetitions',
            instruction:
              'Rise and lower over three seconds, avoiding a heel drop at the bottom.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Slow step-touches',
        dose: '45 seconds',
        instruction: 'Keep the steps narrow and let breathing settle.',
      },
      {
        name: 'Supported calf pause',
        dose: '20 seconds each side',
        instruction:
          'Hold a comfortable staggered stance with both heels down; do not force a stretch.',
      },
    ],
    pacing: [
      'Slow lowering phases add challenge without faster foot contacts.',
      'If a chair creaks or slides, replace sit-to-stand with a shallow Bodyweight Squat rather than trying to brace unsafe furniture.',
      'Finish fewer repetitions before technique or quiet foot placement changes.',
    ],
    adaptations: [
      {
        heading: 'No chair available?',
        copy: 'Use a controlled Bodyweight Squat to a comfortable depth, keeping the feet planted throughout.',
      },
      {
        heading: 'Balance is the limiting factor?',
        copy: 'Keep fingertips on a stable wall and reduce the knee-lift or calf-raise range. Support is a useful training choice, not a failure.',
      },
      {
        heading: 'Want to use one dumbbell?',
        copy: 'A Goblet Squat or stationary suitcase hold can add load, but only if the dumbbell can be picked up and put down quietly under control.',
      },
    ],
    limitations: [
      'Floor construction, footwear, neighbours, and room acoustics differ, so this page cannot promise an inaudible session.',
      'The no-jumping format reduces impact noise but does not make the workout appropriate for every symptom or condition.',
      'Standing-only choices limit some horizontal pushing, pulling, and trunk options when no equipment is available.',
    ],
    faqs: [
      {
        question: 'Is this workout completely silent?',
        answer:
          'No. Movement always creates some sound, and buildings transmit it differently. The plan removes jumps, running, and equipment drops while emphasizing controlled foot placement.',
      },
      {
        question: 'Do I need a workout mat?',
        answer:
          'No. This example stays standing. A mat can also slide or transmit sound differently, so use one only if it improves safe traction.',
      },
      {
        question: 'Can quiet training still feel challenging?',
        answer:
          'Yes. Slower lowering, pauses, controlled range, and additional rounds can increase effort without adding jumping or fast impacts.',
      },
    ],
    relatedSlugs: ['no-jumping', 'standing-only', 'no-equipment'],
  },
  {
    slug: 'no-jumping',
    title: 'No-jumping full-body workout',
    seoTitle: 'No-Jumping Workout: A Low-Impact 28-Minute Session',
    description:
      'Try a 28-minute no-jumping workout with full-body strength, deliberate low-impact conditioning, pacing guidance, and standing alternatives.',
    eyebrow: 'Low-impact format',
    summary:
      'This workout excludes jumps and running while still covering squat, hinge, push, upper-back, trunk, and conditioning patterns. “No jumping” describes impact selection; it is not a medical suitability claim.',
    duration: 'About 28 minutes',
    equipment: 'None; wall and floor space',
    space: 'Small room',
    level: 'Beginner-friendly',
    format: 'Strength circuit plus low-impact interval',
    bestFor: [
      'People who prefer to exclude jumping from today’s session',
      'A full-body home workout with deliberate low-impact conditioning',
      'Small spaces where running is not practical',
    ],
    setup: [
      'Clear the floor and keep a stable wall available for push-ups or balance support.',
      'All foot contacts should be steps, not hops; slow down before that distinction becomes unclear.',
      'Use a folded towel for kneeling only if it is stable and does not slide.',
    ],
    warmup: [
      {
        name: 'March in Place',
        dose: '60 seconds',
        instruction:
          'Increase the arm swing gradually while one foot always stays grounded.',
      },
      {
        name: 'Step Jack',
        dose: '45 seconds',
        instruction:
          'Step out one side at a time instead of hopping both feet apart.',
      },
      {
        name: 'Hip Hinge Reach',
        dose: '8 repetitions',
        instruction: 'Rehearse a smooth hip hinge with a long spine.',
      },
    ],
    blocks: [
      {
        heading: 'Full-body strength circuit',
        rounds: '3 rounds',
        rest: 'Rest 20–45 seconds between exercises and 60 seconds after each round.',
        intro: 'Use controlled repetitions and keep a few in reserve.',
        moves: [
          {
            name: 'Reverse Lunge',
            dose: '6–10 repetitions each side',
            instruction:
              'Step back rather than down fast, and use a shorter step or wall support when useful.',
          },
          {
            name: 'Wall Push-Up',
            dose: '8–15 repetitions',
            instruction:
              'Move the chest toward the wall while the heels stay down.',
          },
          {
            name: 'Glute Bridge',
            dose: '10–15 repetitions',
            instruction: 'Press through both feet and lower the pelvis gently.',
          },
          {
            name: 'Prone W Raise',
            dose: '6–10 repetitions',
            instruction: 'Lift only slightly and keep the neck relaxed.',
          },
          {
            name: 'Dead Bug',
            dose: '5–8 repetitions each side',
            instruction: 'Shorten the reach before the trunk position changes.',
          },
        ],
      },
      {
        heading: 'Low-impact conditioning interval',
        rounds: '4 rounds',
        rest: 'Work 30 seconds, then rest 20 seconds.',
        intro:
          'Alternate the two exercises. The goal is steady movement, not maximum speed.',
        moves: [
          {
            name: 'March in Place',
            dose: '30 seconds',
            instruction:
              'Drive the arms and choose a knee height that preserves balance.',
          },
          {
            name: 'Skater Step',
            dose: '30 seconds',
            instruction:
              'Step sideways and tap behind without hopping from foot to foot.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Slow march',
        dose: '60 seconds',
        instruction: 'Reduce the pace gradually rather than stopping abruptly.',
      },
      {
        name: 'Standing Hamstring Sweep',
        dose: '4 repetitions each side',
        instruction: 'Use a small range and easy breathing.',
      },
    ],
    pacing: [
      'No-jumping does not mean no effort; use range, tempo, and repetitions to adjust difficulty.',
      'Replace the lunge before forcing depth or balance. A Chair Sit-to-Stand is a practical alternative.',
      'Keep conditioning conversational enough that you can still control every step.',
    ],
    adaptations: [
      {
        heading: 'Prefer no floor exercises?',
        copy: 'Replace Glute Bridge with Bodyweight Good Morning, Prone W Raise with Standing Scapular Retraction, and Dead Bug with Standing Cross-Body Knee Drive.',
      },
      {
        heading: 'Lunges do not suit today’s preference?',
        copy: 'Use Chair Sit-to-Stand or Bodyweight Squat at a comfortable depth and keep the same repetition range.',
      },
      {
        heading: 'Need less conditioning?',
        copy: 'Complete two interval rounds or replace the skater step with quiet side-to-side weight shifts.',
      },
    ],
    limitations: [
      'Low impact is not the same as low effort or universal medical suitability.',
      'This example still includes knee bending, wrist-free floor transitions, and getting up from the floor.',
      'It does not diagnose why someone avoids impact or prescribe rehabilitation.',
    ],
    faqs: [
      {
        question: 'Is no jumping the same as low impact?',
        answer:
          'Not exactly. Removing airborne jumps avoids a major source of impact, but speed, step height, surface, and individual movement still affect loading.',
      },
      {
        question: 'Can I do this entirely standing?',
        answer:
          'Yes. Use the three standing replacements listed on this page, or follow the dedicated standing-only session.',
      },
      {
        question: 'Should I add ankle weights?',
        answer:
          'They are not required for this plan and can change movement mechanics. First adjust pace, range, or repetitions within the written session.',
      },
    ],
    relatedSlugs: ['quiet-apartment', 'standing-only', '15-minute'],
  },
  {
    slug: 'standing-only',
    title: 'Standing-only full-body workout',
    seoTitle: 'Standing-Only Workout: No Floor Exercises Needed',
    description:
      'Use this 22-minute standing-only workout for a small space, with no floor transitions, balance support options, and honest movement limitations.',
    eyebrow: 'No-floor session',
    summary:
      'Every exercise begins and ends standing. The plan uses a wall for pushing and optional balance support, then combines knee, hinge, upper-back, trunk, and calf work in a small area.',
    duration: 'About 22 minutes',
    equipment: 'None; a stable wall is recommended',
    space: 'Very small standing area',
    level: 'Beginner-friendly',
    format: 'Standing circuit',
    bestFor: [
      'A session without kneeling, sitting, lying down, or floor transitions',
      'Small-room movement using only a wall',
      'Practising balance with optional stable support',
    ],
    setup: [
      'Check that the wall and floor are dry, clear, and stable.',
      'Keep fingertips near the wall during single-leg or narrow-stance movements if balance is uncertain.',
      'All moves stay standing, but you still choose the depth, range, and pace.',
    ],
    warmup: [
      {
        name: 'March in Place',
        dose: '60 seconds',
        instruction: 'Keep the steps easy and use wall support if helpful.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '5 turns each side',
        instruction:
          'Keep the hips mostly forward while the upper body rotates gently.',
      },
      {
        name: 'Standing Hamstring Sweep',
        dose: '5 repetitions each side',
        instruction:
          'Reach only as far as the standing balance and hinge remain comfortable.',
      },
    ],
    blocks: [
      {
        heading: 'Standing full-body circuit',
        rounds: '3 rounds',
        rest: 'Rest 20–45 seconds between exercises and 60 seconds between rounds.',
        intro: 'Move in order. Use the wall whenever support improves control.',
        moves: [
          {
            name: 'Bodyweight Squat',
            dose: '8–12 repetitions',
            instruction:
              'Sit between the feet to a self-selected depth, then stand without bouncing.',
          },
          {
            name: 'Wall Push-Up',
            dose: '8–15 repetitions',
            instruction:
              'Keep the body aligned and bend the elbows to bring the chest toward the wall.',
          },
          {
            name: 'Bodyweight Good Morning',
            dose: '10–15 repetitions',
            instruction:
              'Move the hips backward and return to tall standing without leaning behind the heels.',
          },
          {
            name: 'Standing Scapular Retraction',
            dose: '10–15 repetitions',
            instruction:
              'Draw the shoulder blades back gently while the ribs stay settled.',
          },
          {
            name: 'Standing Cross-Body Knee Drive',
            dose: '6–10 repetitions each side',
            instruction:
              'Bring one knee toward the opposite hand without rounding or rushing.',
          },
          {
            name: 'Standing Calf Raise',
            dose: '10–15 repetitions',
            instruction:
              'Rise and lower slowly with light wall support as needed.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Easy side steps',
        dose: '45 seconds',
        instruction: 'Use narrow steps and gradually slow down.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '3 turns each side',
        instruction: 'Finish with a smaller, easy range and relaxed breathing.',
      },
    ],
    pacing: [
      'Use one or two rounds when standing endurance or balance is still developing.',
      'A stable support can help you explore a controlled range without turning the exercise into a balance test.',
      'Progress by slowing the lowering phase or adding repetitions before removing useful support.',
    ],
    adaptations: [
      {
        heading: 'Knee bend is limited today?',
        copy: 'Use a shallower squat or repeat the Hip Hinge Reach. Do not force depth to match the written range.',
      },
      {
        heading: 'Wrist loading is not preferred?',
        copy: 'For the wall push-up, use a more upright angle or skip the push movement. This general page cannot determine why a wrist position is uncomfortable.',
      },
      {
        heading: 'Want more resistance?',
        copy: 'Use the one-dumbbell or resistance-band session, then apply its standing substitutions where needed rather than improvising an unstable setup.',
      },
    ],
    limitations: [
      'Without equipment, a standing-only session has limited true pulling resistance and direct horizontal trunk loading.',
      'Avoiding the floor does not make every standing movement appropriate for every person.',
      'This is a general workout example, not a balance assessment, fall-prevention program, or rehabilitation plan.',
    ],
    faqs: [
      {
        question: 'Does standing only mean low impact?',
        answer:
          'No. Standing exercises can still include jumps or fast contacts. This particular plan also avoids jumping, but the two constraints are distinct.',
      },
      {
        question: 'Can I hold a chair for balance?',
        answer:
          'Yes, if it is stable and cannot roll or tip. A wall is often simpler. Use support lightly and keep it within easy reach before starting the repetition.',
      },
      {
        question: 'Why is there no plank?',
        answer:
          'Planks require a floor or raised-surface support position. Standing Cross-Body Knee Drive supplies trunk-control practice while honoring the standing-only constraint.',
      },
    ],
    relatedSlugs: ['quiet-apartment', 'no-jumping', 'resistance-band'],
  },
  {
    slug: '15-minute',
    title: '15-minute full-body workout',
    seoTitle: '15-Minute Full-Body Workout for a Busy Day',
    description:
      'Start a clearly timed 15-minute full-body workout with a two-minute warm-up, 11-minute circuit, two-minute cooldown, and scalable options.',
    eyebrow: 'Short session',
    summary:
      'This session fits the warm-up, main work, and cooldown inside 15 minutes by using one compact circuit. It prioritizes broad movement coverage instead of trying to fit every possible exercise into a short window.',
    duration: '15 minutes',
    equipment: 'None; a wall and floor space',
    space: 'Small room',
    level: 'Beginner-friendly',
    format: 'Timed continuous circuit',
    bestFor: [
      'A busy day when a defined short session is more realistic',
      'A quick full-body circuit without equipment',
      'People who want the timing decided in advance',
    ],
    setup: [
      'Set one timer for 15 minutes and keep a clock visible; there is no need for rapid exercise changes.',
      'Clear a wall and enough floor space for a dead bug before starting.',
      'The schedule is a container, not a requirement to rush. Pause if setup or control needs more time.',
    ],
    warmup: [
      {
        name: 'March in Place',
        dose: '60 seconds (minute 0–1)',
        instruction: 'Start easily and build the arm swing over the minute.',
      },
      {
        name: 'Alternating squat and hinge rehearsal',
        dose: '60 seconds (minute 1–2)',
        instruction:
          'Alternate one shallow Bodyweight Squat with one Hip Hinge Reach at a steady pace.',
      },
    ],
    blocks: [
      {
        heading: 'Eleven-minute main circuit',
        rounds: 'Repeat in order from minute 2 until minute 13',
        rest: 'Rest as needed; aim for about 15 seconds between exercises and 30 seconds after a round.',
        intro:
          'Do controlled repetitions rather than filling every second. Most people will complete two or three rounds.',
        moves: [
          {
            name: 'Bodyweight Squat',
            dose: '8–12 repetitions',
            instruction:
              'Use a comfortable depth and keep the whole foot grounded.',
          },
          {
            name: 'Wall Push-Up',
            dose: '8–12 repetitions',
            instruction:
              'Choose a foot position that lets you move smoothly toward and away from the wall.',
          },
          {
            name: 'Bodyweight Good Morning',
            dose: '10–12 repetitions',
            instruction:
              'Send the hips back without trying to reach a particular depth.',
          },
          {
            name: 'Dead Bug',
            dose: '5–8 repetitions each side',
            instruction:
              'Keep the movement small enough that the trunk remains steady.',
          },
          {
            name: 'Step Jack',
            dose: '30 seconds',
            instruction:
              'Step one side at a time and keep at least one foot grounded.',
          },
        ],
      },
    ],
    cooldown: [
      {
        name: 'Slow march',
        dose: '60 seconds (minute 13–14)',
        instruction: 'Gradually reduce pace while keeping easy movement.',
      },
      {
        name: 'Standing Thoracic Rotation',
        dose: '60 seconds (minute 14–15)',
        instruction:
          'Alternate slow turns and finish when the timer reaches 15 minutes.',
      },
    ],
    pacing: [
      'Begin the cooldown at minute 13 even if you are partway through a round; the workout does not require finishing the list.',
      'Record rounds only if it is helpful, and do not sacrifice range or control to beat a previous count.',
      'For a harder future session, first improve movement quality or use a slightly more challenging variation rather than eliminating rest.',
    ],
    adaptations: [
      {
        heading: 'Need an all-standing session?',
        copy: 'Replace Dead Bug with Standing Cross-Body Knee Drive. Every other exercise already stays standing.',
      },
      {
        heading: 'Want to use one dumbbell?',
        copy: 'Replace Bodyweight Squat with Goblet Squat and Good Morning with Suitcase Deadlift, but add transition time and use a load you can set down safely.',
      },
      {
        heading: 'Only five or ten minutes available?',
        copy: 'Use the quick generator to build a duration-specific session. Do not simply skip all warm-up and cooldown time from this example.',
      },
    ],
    limitations: [
      'A 15-minute session has limited volume and cannot cover every movement pattern with multiple sets.',
      'The exact number of rounds varies with rest, transition time, and individual pace.',
      'Short duration does not guarantee low intensity or suitability for an individual condition.',
    ],
    faqs: [
      {
        question: 'Does the workout really stop at 15 minutes?',
        answer:
          'Yes, if you begin the two-minute cooldown at minute 13. Stop the main circuit wherever you are rather than extending it to complete a round.',
      },
      {
        question: 'Is 15 minutes enough exercise for the week?',
        answer:
          'This is one session, not a weekly prescription. Public-health guidance covers activity accumulated across a week; see the methodology page for the broader context.',
      },
      {
        question: 'Should I skip the warm-up when I am rushed?',
        answer:
          'The warm-up is already included in the 15 minutes. If you have less time, use a shorter session designed around that duration instead of automatically removing preparation.',
      },
    ],
    relatedSlugs: ['no-equipment', 'one-dumbbell', 'quiet-apartment'],
  },
] satisfies CuratedWorkout[];

export const curatedWorkoutBySlug = Object.fromEntries(
  curatedWorkouts.map((workout) => [workout.slug, workout]),
) as Record<string, CuratedWorkout>;

export const getCuratedWorkout = (slug: string): CuratedWorkout => {
  const workout = curatedWorkoutBySlug[slug];

  if (!workout) {
    throw new Error(`Unknown curated workout slug: ${slug}`);
  }

  return workout;
};
