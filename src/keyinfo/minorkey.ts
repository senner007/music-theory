import { Chord } from "@tonaljs/tonal";
import { TRomanNumeral } from "../harmony/romanNumerals";
import { MinorKey } from "@tonaljs/key";
import { primary_chords_and_inversions, seventh_chords_inversions, TChordQualities } from "./keyInfo";

export function key_info_minor(key: MinorKey) {

    const naturalNumerals: TRomanNumeral[] = ["i", "iio", "bIII", "iv", "v", "bVI", "bVII"];
    const harmonicNumerals: TRomanNumeral[] = ["i", "iio", "bIII+", "iv", "V", "bVI", "viio"];
    const melodicNumerals: TRomanNumeral[] = ["i", "ii", "bIII+", "IV", "V", "vio", "viio"];

    const naturalSevenths: TRomanNumeral[] = ["i7", "iio7", "bIII7", "iv7", "v7", "bVI7", "bVII7"];
    const harmonicSevenths: TRomanNumeral[] = ["iM7", "iio7", "bIII+M7", "iv7", "V7", "bVIM7", "viio7"];
    const melodicSevenths: TRomanNumeral[] = ["iM7", "ii7", "bIII+M7", "IV7", "V7", "vio7", "viio7"];

    const naturalSecondaryDominants: TRomanNumeral[] = ["V/iv", "V/V", "bIII", "V/bVII", "V", "bVI", "bVII"];
    const naturalDecondaryDominantsSevenths: TRomanNumeral[] = ["V7/iv", "V7/V", "V7/bVI", "V7/bVII", "V7", "V7/bii", "bVII7"];

    // this chord is overriden since the library has this set to m6 chord and not mMaj7
    const melodicChords = [...key.melodic.chords] as string[];
    melodicChords[0] = key.melodic.tonic + "mMaj7";
    return {
      ...key,
      natural: {
        ...key.natural,
        ...primary_chords_and_inversions(["m", "dim", "M", "m", "m", "M", "M"], naturalNumerals, key.natural.scale),
        ...seventh_chords_inversions(key.natural.chords as TChordQualities[], naturalSevenths),
        secondaryDominants: primary_chords_and_inversions(["M", "M", "M", "M", "M", "M", "M"], naturalSecondaryDominants, key.natural.scale),
        secondaryDominantsSevenths: seventh_chords_inversions(key.natural.scale.map(n => Chord.getChord("7", n).symbol), naturalDecondaryDominantsSevenths)
      },
      harmonic: {
        ...key.harmonic,
        ...primary_chords_and_inversions(["m", "dim", "aug", "m", "M", "M", "dim"], harmonicNumerals, key.harmonic.scale),
        ...seventh_chords_inversions(key.harmonic.chords as TChordQualities[], harmonicSevenths),
      },
      melodic: {
        ...key.melodic,
        chords: melodicChords,
        ...primary_chords_and_inversions(["m", "m", "aug", "M", "M", "dim", "dim"], melodicNumerals, key.melodic.scale),
        ...seventh_chords_inversions(melodicChords, melodicSevenths),
      },
      
    } as const;

}