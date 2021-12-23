


let translation = {
    "Welcome, adventurer.": {
        m_fr: `Bienvenue, aventurier.`,
        f_fr: `Bienvenue, aventurière.`,
    },
    "Start a new game": {
        fr: `Commencer une nouvelle partie`,
    },
    "Consult the book of death": {
        fr: `Consulter le livre des morts`,
    },
    "Change language": {
        fr: `Changer de langue`,
    },
    "Change gender": {
        fr: `Changer de genre`,
    },
    "male": {
        fr: "masculin"
    },
    "female": {
        fr: "féminin"
    },
    "YOUR CHARACTER": {
        fr: `VOTRE PERSONNAGE`
    },
    "Name:": {
        fr: `Nom :`
    },
    "Race:": {
        fr: `Type :`
    },
    "Human": {
        m_fr: `Humain`,
        f_fr: `Humaine`,
    },
    "Robot": {
        fr: `Robot`
    },
    "Start": {
        fr: `Commencer`
    },
};



function tr(strings) {

    result = '';

    for (let s = 0; s < strings.length; s++) {

        result += strings[s];
        if (arguments[s+1]) result += translate(arguments[s+1]);
    }
    return result;
}



function translate(txt) {

    if (ui.language == "en") return txt;

    let target = ui.gender + '_' + ui.language;
    if (!(target in translation[txt])) target = ui.language;
    return translation[txt][target];
}


