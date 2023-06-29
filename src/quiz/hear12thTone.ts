import { base_notes, TOctave } from "../utils";
import {  IQuiz } from "../quiz-types";
import chalk from "chalk";
import { ListeningQuizBase } from "./quizBase/listeningQuizBase";
import { INotePlay } from "../midiplay";
import { create_scale, chromatic_scale_notes, get_interval_distance } from "../tonal-interface";

export const Hear12thTone: IQuiz<never [], { tempo : number}> = class extends ListeningQuizBase<never []> {
  verify_options(): boolean {
    return true;
  }

  randomNote;
  startingNote;
  chromaticScaleShuffled;
  missingNote;
  octave : TOctave = "4";
  constructor(options: Readonly<never[]>) {
    super(options);
    this.randomNote = base_notes().random_item();
    const chromaticScale = create_scale(this.randomNote, "chromatic");
    this.chromaticScaleShuffled = chromatic_scale_notes(chromaticScale).shuffle_array();
    this.missingNote = this.chromaticScaleShuffled.slice(1, this.chromaticScaleShuffled.length).random_item();
    this.startingNote = this.chromaticScaleShuffled[0];
  }

  get quiz_head() {
    return [
      "Starting note is: " + this.startingNote,
      this.tempoText
    ];
  }
  get question_options() {
    return this.chromaticScaleShuffled.slice(1, this.chromaticScaleShuffled.length);
  }
  get question() {
    return `What note is ${chalk.underline("not")} heard?`;
  }
  answer(): string {
    return this.missingNote;
  }

  change_tempo(tempo: number) {
    Hear12thTone.set_dynamic_options({tempo : tempo})
  }

  tempo() {
    return Hear12thTone.get_dynamic_options().tempo
  }

  override feedback_wrong(): string {
    const chromaticScaleShuffledInOctave = this.chromaticScaleShuffled
    .filter(note => note !== this.missingNote)
    .to_octave_ascending(this.octave);
    
    const notesWithIntervalsRows = chromaticScaleShuffledInOctave
        .map((note, index) => {
            if (index === 0) return `${note}\n`;
            const interval = get_interval_distance(chromaticScaleShuffledInOctave[index - 1], note);
            return `${note}, ${interval}\n`;
        }).join("")
    const answer = `Note: ${chalk.green(this.missingNote)}\nThe intervals are:\n${notesWithIntervalsRows}`

    return super.feedback_wrong() + answer;
  }

  audio() {

    const audio = this.chromaticScaleShuffled
        .filter(note => note !== this.missingNote)
        .to_octave_ascending(this.octave)
        .map(note => { return { noteNames: [note], duration: 1 } as INotePlay });

        return [ { audio : [audio], keyboardKey : "space", onInit : true, message : "play row"} ]
  }

  static get_dynamic_options() {
    return Hear12thTone.dynamic_options
  }

  static set_dynamic_options(options : { tempo : number}) {
    Hear12thTone.dynamic_options = options
  }

  static dynamic_options: { tempo : number} = { tempo : 200 }

  static meta() {
    return {
      get all_options() {
        return [];
      },
      name: "Hear the missing 12th tone",
      description: "Listen to the 12-tone row with one note missing. Identify the missing note.",
    };
  }
};
