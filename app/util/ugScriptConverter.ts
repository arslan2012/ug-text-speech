/*

# Original Author: neouyghur
# Converted to TypeScript by: Arslan Ablikim
# Licence: MIT License

This is a simple script to convert Uyghur texts written in different Uyghur scripts. It supports Uyghur Arabic,
Latin Common Turkish scripts, Uyghur Latin Script (also known as computer script), Uyghur Yengi (new) script and Uyghur
Cyrillic script. It is written in Python and uses PyQt5 for GUI. The source script will be converted to common turkic script,
then converted to target script. Therefore, the program is not very efficient but easy to add new scripts.

Abbreviations used in this file:

ULS | Uyghur Latin Script
UYS | Uyghur Yengi (New) Script
CPS | Chinese Pinyin Script
UAS | Uyghur Arabic Script
CTS |Common Turkic Script
UCS | Uyghur Cyrillic Script


*/

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
    },
    'UYS': {
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
    },
    'UZBEK': {
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

const uas_group = ['ا', 'ە', 'ب', 'پ', 'ت', 'ج', 'چ', 'خ', 'د', 'ر', 'ز', 'ژ', 'س', 'ش', 'ف', 'ڭ',
'ل', 'لا', 'م', 'ھ', 'و', 'ۇ', 'ۆ', 'ۈ', 'ۋ', 'ې', 'ى', 'ي', 'ق', 'ك', 'گ', 'ن',
'غ', '؟', '،', '؛', '٭'];
const cts_group = ['a', 'e', 'b', 'p', 't', 'c', 'ç', 'x', 'd', 'r', 'z', 'j', 's', 'ş', 'f', 'ñ',
'l', 'la', 'm', 'h', 'o', 'u', 'ö', 'ü', 'v', 'é', 'i', 'y', 'q', 'k', 'g', 'n',
'ğ', '?', ',', ';', '*'];
const ucs_group = ['а', 'ә', 'б', 'п', 'т', 'җ', 'ч', 'х', 'д', 'р', 'з', 'ж', 'с', 'ш', 'ф', 'ң',
'л', 'ла', 'м', 'һ', 'о', 'у', 'ө', 'ү', 'в', 'е', 'и', 'й', 'қ', 'к', 'г', 'н',
'ғ', '?', ',', ';', '*'];

export class UgScriptConverter {
    private source_script: string;
    private target_script: string;
    private apostrophe: boolean;

    constructor(source_script = 'ULS', target_script = 'UAS', apostrophe = false) {
        this.source_script = source_script;
        this.target_script = target_script;
        this.apostrophe = apostrophe;
    }

    public run(text: string, source_script?: string, target_script?: string, apostrophe?: boolean): string {
        this.source_script = (source_script ?? this.source_script).toUpperCase();
        this.target_script = (target_script ?? this.target_script).toUpperCase();
        this.apostrophe = apostrophe ?? this.apostrophe;
    
        const conversionMethods: { [key: string]: { [key: string]: (text: string) => string } } = {
            'UAS': {
                'CTS': text => this.convertUAS2CTS(text),
                'UCS': text => this.convertFunc(text, this.convertUAS2CTS, this.convertCTS2UCS),
                'ULS': text => this.convertFunc(text, this.convertUAS2CTS, text => this.convertCTS2Language(text, 'ULS')),
                'UYS': text => this.convertFunc(text, this.convertUAS2CTS, text => this.convertCTS2Language(text, 'UYS')),
                'UZBEK': text => this.convertFunc(text, this.convertUAS2CTS, text => this.convertCTS2Language(text, 'UZBEK')),
            },
            'ULS': {
                'CTS': text => this.convertULS2CTS(text),
                'UCS': text => this.convertFunc(text, this.convertULS2CTS, this.convertCTS2UCS),
                'UAS': text => this.convertFunc(text, this.convertULS2CTS, this.convertCTS2UAS),
                'UYS': text => this.convertFunc(text, this.convertULS2CTS, text => this.convertCTS2Language(text, 'UYS')),
            },
            'UCS': {
                'CTS': text => this.convertUCS2CTS(text),
                'UAS': text => this.convertFunc(text, this.convertUCS2CTS, this.convertCTS2UAS),
                'ULS': text => this.convertFunc(text, this.convertUCS2CTS, text => this.convertCTS2Language(text, 'ULS')),
                'UYS': text => this.convertFunc(text, this.convertUCS2CTS, text => this.convertCTS2Language(text, 'UYS')),
            },
            'UYS': {
                'CTS': text => this.convertUYS2CTS(text),
                'UAS': text => this.convertFunc(text, this.convertUYS2CTS, this.convertCTS2UAS),
                'ULS': text => this.convertFunc(text, this.convertUYS2CTS, text => this.convertCTS2Language(text, 'ULS')),
                'UCS': text => this.convertFunc(text, this.convertUYS2CTS, this.convertCTS2UCS),
            },
            'CTS': {
                'UAS': text => this.convertCTS2UAS(text),
                'ULS': text => this.convertCTS2Language(text, 'ULS'),
                'UCS': text => this.convertCTS2UCS(text),
                'UYS': text => this.convertCTS2Language(text, 'UYS'),
            },
        };

        const conversionMethod = conversionMethods[this.source_script][this.target_script];

        if (conversionMethod) {
            return conversionMethod(text);
        } else if (this.source_script === this.target_script) {
            return text;
        } else {
            throw new Error('Target script not supported');
        }
    }
      

    private _repalce_via_table(text: string, tab1: string[], tab2: string[]): string {
        for (let i = 0; i < tab1.length; i++) {
            text = text.replaceAll(tab1[i], tab2[i]);
        }
        return text;
    }

    private convertUAS2CTS(text: string): string {
        text = this._repalce_via_table(text, uas_group, cts_group);
        text = this.__revise_CTS(text);
        return text;
    }

    private __revise_CTS(text: string): string {
        // Remove a "U+0626" if it is a beginning of a word
        text = text.replace(/(\s|^)(\u0626)(\w+)/g, (match, p1, p2, p3) => p1 + p3);
    
        // Replace a "U+0626" with "'" if "U+0626" is appeared in a word and its previous character is not in
        // [u'a', u'e', u'é', u'i', u'o', u'u', u'ö', u'ü']
        if (!this.apostrophe) {
            text = text.replace(/(([aeéiouöü])\u0626)/g, (match, p1) => p1[0]);
        }
    
        text = text.replace(/\u0626/g, "'");
        return text;
    }

    private convertUCS2CTS(text: string): string {
        text = text.toLowerCase();
        text = this._repalce_via_table(text, ucs_group, cts_group);
        text = text.replace("я", "ya").replace("ю", "y");
        return text;
    }

    convertCTS2UAS(text: string): string {
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
        // We ignore this special case.
    
        if (this.apostrophe) {
            text = text.replace(/(?<=[^aebptcçxdrzjsşfñllamhouöüvéiyqkgnğ]|^)[aeéiouöü]/g, (m) => '\u0626' + m);
            
            text = text.replace(/([aebptcçxdrzjsşfñllamhouöüvéiyqkgnğ\u0626])(\')[aebptcçxdrzjsşfñllamhouöüvéiyqkgnğ\u0626]/g, m => m[0] + m[2]);
            
            text = this._repalce_via_table(text, cts_group, uas_group);
        } else {
            text = text.replace(/(?<=[^bptcçxdrzjsşfñllmhvyqkgnğ]|^)[aeéiouöü]/g, (m) => '\u0626' + m);
            
            text = this._repalce_via_table(text, cts_group, uas_group);
            
            text = text.replace("'\u0626", '');
        }
        
        return text;
    }

    private convert(text: string, replacements: {[key: string]: string}): string {
        const regex = new RegExp(Object.keys(replacements).join('|'), 'g');
        return text.replace(regex, match => replacements[match]);
    }
    
    private convertULS2CTS(text: string): string {
        const replacements = {
            'ng': 'ñ',
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
        return this.convert(text, replacements);
    }
    
    private convertUYS2CTS(text: string): string {
        const replacements = {
            "n'g": 'ñ',
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
        return this.convert(text, replacements);
    }
    
    public convertCTS2Language(text: string, language: keyof typeof replacementsMaps): string {
        const replacements = replacementsMaps[language];
        if (!replacements) {
            throw new Error(`Unsupported language: ${language}`);
        }
    
        return this.convert(text, replacements);
    }

    private convertCTS2UCS(text: string): string {
        text = text.toLowerCase();
        text = text.replace("ya", "я").replace("y", "ю");
        text = this._repalce_via_table(text, cts_group, ucs_group);
        return text;
    }


    private convertFunc(text: string, convertToCTS: (text: string) => string, convertFromCTS: (text: string) => string): string {
        return convertFromCTS.bind(this)(convertToCTS.bind(this)(text));
    }
}


