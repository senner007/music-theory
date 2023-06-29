import chalk from "chalk";
import { INotePlay } from "../midiplay";
import { IQuiz } from "../quiz-types";
import { ITableHeader } from "../solfege";
import {
  TNoteSingleAccidental,
  random_note_single_accidental,
  TIntervalAbsolute,
} from "../utils";
import { AudiateQuizBase } from "./quizBase/audiateQuizBase";
import { create_scale, scale_notes, get_interval_distance, interval_to_absolute, add_octave_above } from "../tonal-interface";

type TOptionsType = [
  { name: string, options: string[] },
  { name: string, options: TIntervalAbsolute[] }
]

export const AudiateContextualIntervals: IQuiz<TOptionsType, {tempo : number}> = class extends AudiateQuizBase<
  TOptionsType
> {
  verify_options(_: TOptionsType): boolean {
    return true;
  }

  randomNote: TNoteSingleAccidental;
  randomScaleType;
  interval;
  scaleThirdOctave;
  timeSignature = 1 as const;
  constructor(options: Readonly<TOptionsType>) {
    super(options);
    const [scaletypes, intervals] = options;
    this.randomNote = random_note_single_accidental();
    this.randomScaleType = scaletypes.options.random_item();
    const randomScale = create_scale(this.randomNote, this.randomScaleType);

    this.scaleThirdOctave = scale_notes(randomScale).to_octave_ascending("3")
    const randomScaleNotes = [
      ...this.scaleThirdOctave,
      ...scale_notes(randomScale).to_octave_ascending("4")
    ];

    const firstNote = randomScaleNotes.random_item();

    const secondTonePossibilities = randomScaleNotes
      .filter((n) => !(n === firstNote))
      .filter((n) => {
        const intervalDistance = get_interval_distance(n, firstNote)
        return intervals.options.includes(interval_to_absolute(intervalDistance));
      });

    const secondNote = secondTonePossibilities.random_item();
    this.interval = [firstNote, secondNote];
  }

  change_tempo(tempo: number) {
    AudiateContextualIntervals.set_dynamic_options({tempo : tempo})
  }

  tempo() {
    return AudiateContextualIntervals.get_dynamic_options().tempo
  }

  get quiz_head() {
    return [
      `Identify and sing the interval from the ${chalk.underline(this.randomScaleType)} scale`,
      this.tempoText
    ];
  }

  get question() {
    return "";
  }

  static get_dynamic_options() {
    return this.dynamic_options
  }

  static set_dynamic_options(options : { tempo : number}) {
    this.dynamic_options = options
  }

  static dynamic_options: { tempo : number} = { tempo : 300 }

  audio() {
    const interval = this.interval.map((n): INotePlay => {
      return { noteNames: [n], duration: 2 };
    });

    const firstNote = [interval[0]];
    const secondNote = [interval[1]];

    const root: INotePlay[] = [{ noteNames: [this.scaleThirdOctave[0]], duration: 1 }];

    const scale = add_octave_above(this.scaleThirdOctave)
      .map((n): INotePlay => {
        return { noteNames: [n], duration: 1 };
      });

    return [
      { audio: interval, keyboardKey: "space", message: "play interval", display: true } as const,
      { audio: [firstNote], keyboardKey: "a", onInit: true, message: "play the fist note" },
      { audio: [secondNote], keyboardKey: "s", message: "play the second note" },
      { audio: [root], keyboardKey: "d", message: "play the root of the scale" },
      { audio: [scale], keyboardKey: "f", message: "play the scale" },

    ];
  }

  get table_header() {
    return this.interval.map((_, index): ITableHeader => {
      index++;
      return { name: index.toString().padStart(2, "0"), duration: 2 };
    });
  }

  static meta() {
    return {
      get all_options(): TOptionsType {
        const scales = [
          "major",
          "aeolian",
          "major pentatonic",
          "dorian",
          // "phrygian",
          "lydian",
          "mixolydian",
          // "locrian",
          "harmonic minor",
          "melodic minor",
        ];
        const intervals: TIntervalAbsolute[] = ["2m", "2M", "3m", "3M", "4P", "4A", "5d", "5P", "6m", "6M"];
        return [
          { name : "scales", options : scales }, 
          { name : "intervals", options: intervals }
        ];
      },
      name: "Audiate contextual intervals",
      description: "Audiate the contextual interval",
    };
  }
};
