import { Chord, Progression, RomanNumeral } from "@tonaljs/tonal";
import { Chord as IChord } from "@tonaljs/chord";
import { MajorKey, MinorKey } from "@tonaljs/key";
import { RomanNumeralType } from "./harmonicProgressions";
import { LogError } from "./dev-utils";

export function keyInfo(key: MajorKey | MinorKey) {
  function getChords(chordQualities: readonly string[], scale: readonly string[]) {
    return chordQualities.map((q, index: number) => {
      return Chord.getChord(q, scale[index]);
    });
  }

  function InvChords(primaryChords: IChord[], inversion: number) {
    return primaryChords.map((c) => {
      return Chord.getChord(c.type, c.tonic!, c.notes[inversion]);
    });
  }

  function getPrimaryChords(chordQualities: string[], romanNumerals: RomanNumeralType[], scale: readonly string[]) {
    const primaryChords = getChords(chordQualities, scale).map((c, index) => {
      return { ...c, romanNumeral: romanNumerals[index] };
    });
    const firstInversionChords = InvChords(primaryChords, 1).map((c, index) => {
      return { ...c, romanNumeral: romanNumerals[index] + "6" };
    });
    const secondInversionChords = InvChords(primaryChords, 2).map((c, index) => {
      return { ...c, romanNumeral: romanNumerals[index] + "64" };
    });
    return {
      primaryChords,
      firstInversionChords,
      secondInversionChords,
      allPrimaryChords: () => [...primaryChords, ...firstInversionChords, ...secondInversionChords],
    } as const;
  }

  function replaceSymbolSeven(romanNumeral : RomanNumeralType, from: string, to : string) {
    return romanNumeral.replace(from, to);
  }

  function getSeventhChords(seventhChordsSymbols: readonly string[], romanNumerals: RomanNumeralType[]) {
    const seventhChords = seventhChordsSymbols.map(c => Chord.get(c)).map((c, index) => {
      return { ...c, romanNumeral: romanNumerals[index] };
    });

    const firstInversionChords = InvChords(seventhChords, 1).map((c, index) => {
      return { ...c, romanNumeral: replaceSymbolSeven(romanNumerals[index], "7",  "65")};
    });

    const secondInversionChords = InvChords(seventhChords, 2).map((c, index) => {
      return { ...c, romanNumeral: replaceSymbolSeven(romanNumerals[index], "7", "43") };
    });

    const thirdInversionChords = InvChords(seventhChords, 3).map((c, index) => {
      return { ...c, romanNumeral: replaceSymbolSeven(romanNumerals[index], "7", "42") };
    });
    
    return {
      seventhChords,
      firstInversionChords,
      secondInversionChords,
      thirdInversionChords,
      allSeventhChords: () => [...seventhChords, ...firstInversionChords, ...secondInversionChords, ...thirdInversionChords],
    } as const;
  }

  function getSecondaryDominantChords(seventhChordsSymbols: readonly string[], romanNumerals: RomanNumeralType[]) {
     const seventChords = getSeventhChords(seventhChordsSymbols, romanNumerals)
    
    return {
      SecondaryDominantChords : seventChords.seventhChords,
      SecondaryDominantFirstInversionChords : seventChords.firstInversionChords,
      SecondaryDominantSecondInversionChords : seventChords.secondInversionChords,
      SecondaryDominantThirdInversionChords: seventChords.thirdInversionChords,
      allSecondaryDominantChords: () => [
        ...seventChords.seventhChords, 
        ...seventChords.firstInversionChords, 
        ... seventChords.secondInversionChords, 
        ...seventChords.thirdInversionChords],
    } as const;
  }

  if (key.type === "minor") {
    const naturalNumerals: RomanNumeralType[] = ["i", "iio", "bIII", "iv", "v", "bVI", "bVII"];
    const harmonicNumerals: RomanNumeralType[] = ["i", "iio", "bIII+", "iv", "V", "bVI", "viio"];
    const melodicNumerals: RomanNumeralType[] = ["i", "ii", "bIII+", "IV", "V", "vio", "viio"];

    const naturalSevenths: RomanNumeralType[] = ["i7", "iio7", "bIII7", "iv7", "v7", "bVI7", "bVII7"];
    const harmonicSevenths: RomanNumeralType[] = ["iM7", "iio7", "bIII+M7", "iv7", "V7", "bVIM7", "viio7"];
    const melodicSevenths: RomanNumeralType[] = ["iM7", "ii7", "bIII+M7", "IV7", "V7", "vio7", "viio7"];

    // this chord is overriden since the library has this set to m6 chord and not mMaj7
    const melodicChords = [...key.melodic.chords] as string[];
    melodicChords[0] = key.melodic.tonic + "mMaj7";
    const obj = {
      ...key,
      natural: {
        ...key.natural,
        ...getPrimaryChords(["m", "dim", "M", "m", "m", "M", "M"], naturalNumerals, key.natural.scale),
        ...getSeventhChords(key.natural.chords, naturalSevenths),
      },
      harmonic: {
        ...key.harmonic,
        ...getPrimaryChords(["m", "dim", "aug", "m", "M", "M", "dim"], harmonicNumerals, key.harmonic.scale),
        ...getSeventhChords(key.harmonic.chords, harmonicSevenths),
      },
      melodic: {
        ...key.melodic,
        chords :  melodicChords,
        ...getPrimaryChords(["m", "m", "aug", "M", "M", "dim", "dim"], melodicNumerals, key.melodic.scale),
        ...getSeventhChords(melodicChords, melodicSevenths),
      },
    } as const;
    return obj;
  }

  const majorNumerals: RomanNumeralType[] = ["I", "ii", "iii", "IV", "V", "vi", "viio"];
  const majorSevenths: RomanNumeralType[] = ["I7", "ii7", "iii7", "IV7", "V7", "vi7", "viio7"];
  const secondaryDominants: RomanNumeralType[] = ["V7/ii", "V7/iii", "V7/IV", "V7/V", "V7/vi"];

  const obj = {
    ...key,
    ...getPrimaryChords(["M", "m", "m", "M", "M", "m", "dim"], majorNumerals, key.scale),
    ...getSeventhChords(key.chords, majorSevenths),
    ...getSecondaryDominantChords(key.secondaryDominants.filter(c => c !== ""), secondaryDominants),
    
  } as const;
  return obj;
}

type KeyInfo = ReturnType<typeof keyInfo>;


function getKeyChords(keyInfo: KeyInfo) {
  if (keyInfo.type === "major") {
    return [...keyInfo.allPrimaryChords(), ...keyInfo.allSeventhChords(), ...keyInfo.allSecondaryDominantChords()];
  }
  return [
    ...keyInfo.natural.allPrimaryChords(),
    ...keyInfo.natural.allSeventhChords(),
    ...keyInfo.harmonic.allPrimaryChords(),
    ...keyInfo.harmonic.allSeventhChords(),
    ...keyInfo.melodic.allPrimaryChords(),
    ...keyInfo.melodic.allSeventhChords(),
  ];
}

export function getNumeralBySymbol(keyInfo: KeyInfo, chordNotes: string[]) {
  const chordSymbols: string [] = Chord.detect(chordNotes, { assumePerfectFifth: true });
  const keyChords = getKeyChords(keyInfo);
  
  const chordsInKey = chordSymbols.filter((chord) => keyChords.map((c) => c.symbol).includes(chord));
  const chord = chordsInKey[0];

  return keyChords.filter((c) => c.symbol === chord)[0].romanNumeral;

}
