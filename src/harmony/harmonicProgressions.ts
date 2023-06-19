import { TNoteAllAccidentalOctave } from "../utils";
import fs from "fs";
import { LogError } from "../dev-utils";
import { TRomanNumeralAbove, TRomanNumeral, romanNumeralsDict, to_roman_numeral } from "./romanNumerals";

export type TProgression = Readonly<{
  chords: Readonly<(TRomanNumeral | TRomanNumeralAbove)[]>;
  bass: Readonly<TNoteAllAccidentalOctave[]>;
  isMajor: boolean;
  description?: string;
  isDiatonic: boolean;
  tags: string[];
}>;

type TProgressionsJSON = {
  level: number;
  description: string;
  progressions: TProgression[];
};

const level_1 = JSON.parse(fs.readFileSync("src/progressions/harmonic-progressions.json") as any) as TProgressionsJSON;
const level_2 = JSON.parse(fs.readFileSync("src/progressions/harmonic-progressions-level2.json") as any) as TProgressionsJSON;
const level_3 = JSON.parse(fs.readFileSync("src/progressions/harmonic-progressions-level3.json") as any) as TProgressionsJSON;
const level_5 = JSON.parse(fs.readFileSync("src/progressions/harmonic-progressions-level5.json") as any) as TProgressionsJSON;
const level_circle_of_fifths = JSON.parse(fs.readFileSync("src/progressions/harmonic-progressions-circle-of-fifths.json") as any) as TProgressionsJSON;
const level_circle_of_fifths_extended = JSON.parse(fs.readFileSync("src/progressions/harmonic-progressions-circle-of-fifths-extended.json") as any) as TProgressionsJSON;

export const progressions = [
  level_1,
  level_2,
  level_3,
  level_5,
  level_circle_of_fifths,
  level_circle_of_fifths_extended
];

export function JSON_progressions_verify() {
  const progressionsTemp: string[] = [];
  const progressionsArray: TProgression[] = progressions.map(p => p.progressions).flat();
  progressionsArray.forEach((key, keyIndex) => {
    const chordsString = key.chords.join("") + key.bass.join("");
    if (progressionsTemp.includes(chordsString)) {
      LogError(
        `Json content error at: 
Description : ${key.description} progression : ${chordsString}
Progression is not unique. Similar to progression at index: ${progressionsTemp.indexOf(chordsString)}`
      );
    }
    progressionsTemp.push(chordsString);

    key.chords.forEach((chord, chordIndex) => {
      if (!(chord in romanNumeralsDict || to_roman_numeral(chord) in romanNumeralsDict)) {
        LogError(
          `Json content error at: 
Index : ${chordIndex} chord : ${chord}
Roman numeral not in dictionary`
        );
      }
    });
  });
};