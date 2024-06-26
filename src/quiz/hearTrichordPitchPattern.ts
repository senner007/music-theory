import { random_note_single_accidental } from "../utils";
import { IQuizInstance, IQuiz, TOptionsReturnType, IQuizOptions } from "./quiztypes/quiz-types";
import {
  pitch_pattern_by_name,
  pattern_intervals,
  pitch_pattern_inversions,
  TPitchPatternName,
  pitchPatterns,
} from "../pitchPatterns";
import { ListeningQuizBase } from "./quizBase/listeningQuizBase";
import { INotePlay } from "../midiplay";
import { ObjectEntries } from "../objectUtils";

const pitchPatternKeyNames = ObjectEntries(pitchPatterns).keys;

const options = [{ name : "Pitch patterns", options : () => pitchPatternKeyNames, cliShort : "p" }] as const;

type TOptionsType = typeof options;

export const HearTrichordPitchPatterns: IQuiz<TOptionsType> = class extends ListeningQuizBase<TOptionsReturnType<TOptionsType>> {

  verify_options(options: TOptionsReturnType<TOptionsType>): boolean {
    return options.first_and_only().options.every((pattern) => pitchPatternKeyNames.includes(pattern));
  }

  randomNote;
  randomPitchPattern;
  randomPatternName;
  audioChord;
  audioArpeggio;
  constructor(options: Readonly<TOptionsReturnType<TOptionsType>>) {
    super(options);
    const [pitchPatternOptions] = options

    this.randomNote = random_note_single_accidental();
    this.randomPatternName = pitchPatternOptions.options.random_item();
    this.randomPitchPattern = pitch_pattern_by_name(this.randomPatternName);
    const [chord, arppeggio] = this.prepare_audio();
    this.audioChord = chord;
    this.audioArpeggio = arppeggio;
  }

  private prepare_audio() : INotePlay[][] {
    const pitchIntervals = pattern_intervals(this.randomPitchPattern);
    const patternInversions = pitch_pattern_inversions(this.randomNote, pitchIntervals);
    const patternInversAudio = patternInversions.random_item().to_octave_ascending("4")

    return [
      [{ noteNames: patternInversAudio, duration: 4 }],

      patternInversAudio.map((a) => {
        return { noteNames: [a], duration: 2 };
      }),
    ];
  }

  private get_pattern_description(p: TPitchPatternName) {
    return p + " - " + pitchPatterns[p].toString();
  }

  get quiz_head() {
    return [];
  }
  get question_options() {
    return pitchPatternKeyNames.map(this.get_pattern_description);
  }
  get question() {
    return "Which pitch pattern (or its inversion) do you hear?";
  }
  answer(): string {
    return this.get_pattern_description(this.randomPatternName)
  }

  audio() {
    return [
      { audio: this.audioChord, keyboardKey: "space", onInit: true, channel: 1, message: "play trichord harmonically", solo : true },
      { audio: this.audioArpeggio, keyboardKey: "s", channel: 1, message: "play trichord sequentially", solo : true },
    ] as const;
  }

  protected override initTempo : number = 200;

  static meta() {
    return {
      get all_options() {
        return options;
      },
      name: "Hear trichord pitch patterns",
      description: "Identify the trichord pitch pattern that is being played",
      instructions : [
        "Try to sort the patterns ranging from consonant to dissonant.",
        "Then try to associate each with a musical phenomena similar to associating intervals with songs. eg 0-2-6 has a dominant seven sound",
        "Notice the pleasant sound of 0-1-5 even with the minor second"
      ]
    };
  }
};
