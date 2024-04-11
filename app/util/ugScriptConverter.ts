/*

# Original Author: neouyghur
# Converted to TypeScript by: Arslan Ablikim
# Licence: MIT License

is a simple script to convert Uyghur texts written in different Uyghur scripts. It supports Uyghur Arabic,
Latin Common Turkish scripts, Uyghur Latin Script (also known as computer script), Uyghur Yengi (new) script and Uyghur
Cyrillic script. It is written in Python and uses PyQt5 for GUI. The source script will be converted to common turkic script,
then converted to target script. Therefore, the program is not very efficient but easy to add new scripts.

Abbreviations used in file:

ULS | Uyghur Latin Script
UYS | Uyghur Yengi (New) Script
CPS | Chinese Pinyin Script
UAS | Uyghur Arabic Script
CTS |Common Turkic Script
UCS | Uyghur Cyrillic Script


*/

export const UgScriptConverter = (text: string, source_script = 'ULS', target_script = 'UAS', apostrophe = false): string => {
  const conversionMethods: { [key: string]: { [key: string]: (text: string) => string } } = {
    'UAS': {
      'CTS': text => convertUAS2CTS(text),
      'UCS': text => convertFunc(text, convertUAS2CTS, convertCTS2UCS),
      'ULS': text => convertFunc(text, convertUAS2CTS, text => convertCTS2Language(text, 'ULS')),
      'UYS': text => convertFunc(text, convertUAS2CTS, text => convertCTS2Language(text, 'UYS')),
      'UZBEK': text => convertFunc(text, convertUAS2CTS, text => convertCTS2Language(text, 'UZBEK')),
    }, 'ULS': {
      'CTS': text => convertULS2CTS(text),
      'UCS': text => convertFunc(text, convertULS2CTS, convertCTS2UCS),
      'UAS': text => convertFunc(text, convertULS2CTS, convertCTS2UAS),
      'UYS': text => convertFunc(text, convertULS2CTS, text => convertCTS2Language(text, 'UYS')),
    }, 'UCS': {
      'CTS': text => convertUCS2CTS(text),
      'UAS': text => convertFunc(text, convertUCS2CTS, convertCTS2UAS),
      'ULS': text => convertFunc(text, convertUCS2CTS, text => convertCTS2Language(text, 'ULS')),
      'UYS': text => convertFunc(text, convertUCS2CTS, text => convertCTS2Language(text, 'UYS')),
    }, 'UYS': {
      'CTS': text => convertUYS2CTS(text),
      'UAS': text => convertFunc(text, convertUYS2CTS, convertCTS2UAS),
      'ULS': text => convertFunc(text, convertUYS2CTS, text => convertCTS2Language(text, 'ULS')),
      'UCS': text => convertFunc(text, convertUYS2CTS, convertCTS2UCS),
    }, 'CTS': {
      'UAS': text => convertCTS2UAS(text),
      'ULS': text => convertCTS2Language(text, 'ULS'),
      'UCS': text => convertCTS2UCS(text),
      'UYS': text => convertCTS2Language(text, 'UYS'),
    },
  };

  const convertUAS2CTS = (text: string): string => {
    text = replaceViaTable(text, uas_group, cts_group);
    text = reviseCTS(text);
    return text;
  }

  const reviseCTS = (text: string): string => {
    // Remove a "U+0626" if it is a beginning of a word
    text = text.replace(/(\s|^)(\u0626)(\w+)/g, (_match, p1, _p2, p3) => p1 + p3);

    // Replace a "U+0626" with "'" if "U+0626" is appeared in a word and its previous character is not in
    // [u'a', u'e', u'é', u'i', u'o', u'u', u'ö', u'ü']
    if (!apostrophe) {
      text = text.replace(/(([aeéiouöü])\u0626)/g, (_p1, p1) => p1[0]);
    }

    text = text.replace(/\u0626/g, "'");
    return text;
  }

  const convertCTS2UAS = (text: string): string => {
    // CTS to UAS
    // Parameters
    // ----------
    // text : str
    //
    // Returns
    // -------
    //   text

    // (?<=[^bptcçxdrzjsşfñllmhvyqkgnğ])[aeéiouöü] (ont type)
    // (?<=[^bptcçxdrzjsşfñllmhvyqkgnğ]|^)[aeéiouöü]

    // Add a "U+0626" before a vowel if it is the beginning of a word or after a vowel
    // for example
    // "ait" -> "U+0626aU+0626it" ئائىت
    // Threre is special case cuñxua which should not be converted to cuñxu'a as it is written in UAS as  جۇڭخۇا
    // We ignore special case.

    if (apostrophe) {
      text = text.replace(/(?<=[^aebptcçxdrzjsşfñlmhouöüvéiyqkgnğ]|^)[aeéiouöü]/g, (m) => '\u0626' + m);

      text = text.replace(/([aebptcçxdrzjsşfñlmhouöüvéiyqkgnğ\u0626])(')[aebptcçxdrzjsşfñlmhouöüvéiyqkgnğ\u0626]/g, m => m[0] + m[2]);

      text = replaceViaTable(text, cts_group, uas_group);
    } else {
      text = text.replace(/(?<=[^bptcçxdrzjsşfñlmhvyqkgnğ]|^)[aeéiouöü]/g, (m) => '\u0626' + m);

      text = replaceViaTable(text, cts_group, uas_group);

      text = text.replace("'\u0626", '');
    }

    return text;
  }

  const conversionMethod = conversionMethods[source_script][target_script];
  if (conversionMethod) {
    return conversionMethod(text);
  } else if (source_script === target_script) {
    return text;
  } else {
    throw new Error('Target script not supported');
  }
}

const replacementsMaps = {
  'ULS': {
    'ñ': 'ng',
    'e': 'ə',
    'j': 'ⱬ',
    'c': 'j',
    'q': 'ⱪ',
    'ç': 'q',
    'h': 'ⱨ',
    'x': 'h',
    'ş': 'x',
    'ö': 'ø',
    'v': 'w',
    'é': 'e',
    'ğ': 'ƣ'
  }, 'UYS': {
    'ñ': "n'g",
    'e': 'ə',
    'j': 'ⱬ',
    'c': 'j',
    'q': 'ⱪ',
    'ç': 'q',
    'h': 'ⱨ',
    'x': 'h',
    'ş': 'x',
    'ö': 'ø',
    'v': 'w',
    'é': 'e',
    'ğ': 'ƣ'
  }, 'UZBEK': {
    'ñ': 'ng',
    'e': 'e',
    'j': 'j',
    'c': 'c',
    'q': 'q',
    'ç': 'ç',
    'h': 'h',
    'x': 'x',
    'ş': 'ş',
    'ö': 'ö',
    'v': 'v',
    'é': 'é',
    'ğ': 'ğ'
  }
} as const;

const uas_group = ['ا', 'ە', 'ب', 'پ', 'ت', 'ج', 'چ', 'خ', 'د', 'ر', 'ز', 'ژ', 'س', 'ش', 'ف', 'ڭ', 'ل', 'لا', 'م', 'ھ', 'و', 'ۇ', 'ۆ', 'ۈ', 'ۋ', 'ې', 'ى', 'ي', 'ق', 'ك', 'گ', 'ن', 'غ', '؟', '،', '؛', '٭'];
const cts_group = ['a', 'e', 'b', 'p', 't', 'c', 'ç', 'x', 'd', 'r', 'z', 'j', 's', 'ş', 'f', 'ñ', 'l', 'la', 'm', 'h', 'o', 'u', 'ö', 'ü', 'v', 'é', 'i', 'y', 'q', 'k', 'g', 'n', 'ğ', '?', ',', ';', '*'];
const ucs_group = ['а', 'ә', 'б', 'п', 'т', 'җ', 'ч', 'х', 'д', 'р', 'з', 'ж', 'с', 'ш', 'ф', 'ң', 'л', 'ла', 'м', 'һ', 'о', 'у', 'ө', 'ү', 'в', 'е', 'и', 'й', 'қ', 'к', 'г', 'н', 'ғ', '?', ',', ';', '*'];

const replaceViaTable = (text: string, tab1: string[], tab2: string[]): string => {
  for (let i = 0; i < tab1.length; i++) {
    text = text.replaceAll(tab1[i], tab2[i]);
  }
  return text;
}


const convert = (text: string, replacements: { [key: string]: string }): string => {
  const regex = new RegExp(Object.keys(replacements).join('|'), 'g');
  return text.replace(regex, match => replacements[match]);
}

const convertUCS2CTS = (text: string): string => {
  text = text.toLowerCase();
  text = replaceViaTable(text, ucs_group, cts_group);
  text = text.replace("я", "ya").replace("ю", "y");
  return text;
}

const convertULS2CTS = (text: string): string => {
  const replacements = {
    'ng': 'ñ', 'n\'g': 'ng', '\'ng': 'ñ', 'ch': 'ç', 'zh': 'j', 'sh': 'ş', 'w': 'v', 'j': 'c', '\'gh': 'ğ', 'gh': 'ğ'
  };
  return convert(text, replacements);
}

const convertUYS2CTS = (text: string): string => {
  const replacements = {
    "ng": 'ñ',
    'ə': 'e',
    'ⱬ': 'j',
    'j': 'c',
    'ⱪ': 'q',
    'q': 'ç',
    'ⱨ': 'h',
    'h': 'x',
    'x': 'ş',
    'ø': 'ö',
    'w': 'v',
    'e': 'é',
    'ƣ': 'ğ'
  };
  return convert(text, replacements);
}

const convertCTS2Language = (text: string, language: keyof typeof replacementsMaps): string => {
  const replacements = replacementsMaps[language];
  if (!replacements) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return convert(text, replacements);
}

const convertCTS2UCS = (text: string): string => {
  text = text.toLowerCase();
  text = text.replace("ya", "я").replace("y", "ю");
  text = replaceViaTable(text, cts_group, ucs_group);
  return text;
}

const convertFunc = (text: string, convertToCTS: (text: string) => string, convertFromCTS: (text: string) => string): string => {
  return convertFromCTS(convertToCTS(text));
}


