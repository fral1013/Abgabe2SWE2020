/* eslint-disable max-lines */

/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// eslint-disable-next-line max-classes-per-file
const MIN_KATEGORIE = 0;
const MAX_KATEGORIE = 9;

export enum Interesse {
    SPORT = 'S',
    LESEN = 'L',
    REISEN = 'R',
}

export enum Geschlecht {
    MÄNNLICH = 'M',
    WEIBLICH = 'W',
}

export enum Familienstand {
    VERHEIRATET = 'VH',
    GESCHIEDEN = 'G',
    VERWITWET = 'VW',
    LEDIG = 'L',
}

export class MyUser {
    username: string;

    password: string | undefined;
}
export class MyAdresse {
    plz?: string;

    ort?: string;

    constructor(plz: string, ort: string) {
        this.plz = plz;
        this.ort = ort;
    }
}

export class Umsatz {
    betrag?: number;

    waehrung?: string;

    constructor(betrag: number, weahrung: string) {
        this.betrag = betrag;
        this.waehrung = weahrung;
    }
}

// eslint-disable-next-line max-len
export const ISBN_REGEX = /\d{3}-\d-\d{5}-\d{3}-\d|\d-\d{5}-\d{3}-\d|\d-\d{4}-\d{4}-\d|\d{3}-\d{10}/u;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Kundendaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface KundeShared {
    _id?: string;
    nachname: string;
    email: string;
    familienstand?: Familienstand | '';
    geschlecht: Geschlecht;
    geburtsdatum?: string;
    plz?: string;
    ort?: string;
    newsletter?: boolean;
    version?: number;
    adresse?: MyAdresse;
    username: string;
    passwort?: string;
}

interface Link {
    href: string;
}

/**
 * Daten vom und zum REST-Server:
 * <ul>
 *  <li> Arrays f&uuml;r mehrere Werte, die in einem Formular als Checkbox
 *       dargestellt werden.
 *  <li> Daten mit Zahlen als Datentyp, die in einem Formular nur als
 *       String handhabbar sind.
 * </ul>
 */
export interface KundeServer extends KundeShared {
    kategorie?: number;
    interessen?: Array<string>;
    user?: MyUser;
    _links?: {
        self: Link;
        list?: Link;
        add?: Link;
        update?: Link;
        remove?: Link;
    };
}

/**
 * Daten aus einem Formular:
 * <ul>
 *  <li> je 1 Control fuer jede Checkbox und
 *  <li> au&szlig;erdem Strings f&uuml;r Eingabefelder f&uuml;r Zahlen.
 * </ul>
 */
export interface KundeForm extends KundeShared {
    kategorie: string;
    reisen?: boolean;
    lesen?: boolean;
    sport?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Kunde {
    private static readonly SPACE = 2;

    /* eslint-disable @typescript-eslint/no-invalid-this */
    kategorieArray: Array<boolean> =
        this.kategorie === undefined
            ? new Array(MAX_KATEGORIE - MIN_KATEGORIE).fill(false)
            : new Array(this.kategorie - MIN_KATEGORIE)
                  .fill(true)
                  .concat(
                      new Array(MAX_KATEGORIE - this.kategorie).fill(false),
                  );
    /* eslint-enable @typescript-eslint/no-invalid-this */

    // geburtsdatum: string;

    interessen: Array<string>;

    adresse: MyAdresse;

    user: MyUser;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined,
        public nachname: string,
        public email: string,
        public kategorie: number | undefined,
        public geschlecht: Geschlecht,
        public familienstand: Familienstand | undefined | '',
        public geburtsdatum: string | undefined,
        public newsletter: boolean | undefined,
        public username: string,
        interessen: Array<string> | undefined,
        public version: number | undefined,
        adresse: MyAdresse | undefined,
    ) {
        // TODO Parsing, ob der Datum-String valide ist
        // this.geburtsdatum =
        //    geburtsdatum === undefined ? new Date() : new Date(geburtsdatum);
        this.interessen = interessen === undefined ? [] : interessen;
        const mya: MyAdresse = { plz: '00000', ort: 'Aachen' };
        this.adresse = adresse === undefined ? mya : adresse;
        console.log('Kunde(): this=', this);
    }

    /**
     * Ein Kunde-Objekt mit JSON-Daten erzeugen, die von einem RESTful Web
     * Service kommen.
     * @param kunde JSON-Objekt mit Daten vom RESTful Web Server
     * @return Das initialisierte Kunde-Objekt
     */
    static fromServer(kundeServer: KundeServer, etag?: string) {
        let selfLink: string | undefined;
        const { _links } = kundeServer;
        if (_links !== undefined) {
            const { self } = _links;
            selfLink = self.href;
        }
        let id: string | undefined;
        if (selfLink !== undefined) {
            const lastSlash = selfLink.lastIndexOf('/');
            id = selfLink.slice(lastSlash + 1);
        }

        let version: number | undefined;
        if (etag !== undefined) {
            // Anfuehrungszeichen am Anfang und am Ende entfernen
            const versionStr = etag.slice(1, -1);
            version = Number.parseInt(versionStr, 10);
        }

        const kunde = new Kunde(
            id,
            kundeServer.nachname,
            kundeServer.email,
            kundeServer.kategorie,
            kundeServer.geschlecht,
            kundeServer.familienstand,
            kundeServer.geburtsdatum,
            kundeServer.newsletter,
            kundeServer.username,
            kundeServer.interessen,
            version,
            kundeServer.adresse,
        );
        console.log('Kunde.fromServer(): kunde=', kunde);
        return kunde;
    }

    /**
     * Ein Kunde-Objekt mit JSON-Daten erzeugen, die von einem Formular kommen.
     * @param kunde JSON-Objekt mit Daten vom Formular
     * @return Das initialisierte Kunde-Objekt
     */
    static fromForm(kundeForm: KundeForm) {
        console.log('Kunde.fromForm(): kundeForm=', kundeForm);
        const interessen: Array<string> = [];
        if (kundeForm.reisen === true) {
            interessen.push('R');
        }
        if (kundeForm.lesen === true) {
            interessen.push('L');
        }
        if (kundeForm.sport === true) {
            interessen.push('S');
        }

        const kunde = new Kunde(
            kundeForm._id,
            kundeForm.nachname,
            kundeForm.email,
            Number(kundeForm.kategorie),
            kundeForm.geschlecht,
            kundeForm.familienstand,
            kundeForm.geburtsdatum,
            kundeForm.newsletter,
            kundeForm.username,
            interessen,
            kundeForm.version,
            kundeForm.adresse,
        );
        const myUser: MyUser = {
            username: kundeForm.username,
            password: kundeForm.passwort,
        };
        kunde.user = myUser;
        const myAdr: MyAdresse = {
            plz: kundeForm.plz,
            ort: kundeForm.ort,
        };
        kunde.adresse = myAdr;
        console.log('Kunde.fromForm(): kunde=', kunde);
        return kunde;
    }

    // Property in TypeScript wie in C#
    // https://www.typescriptlang.org/docs/handbook/classes.html#accessors
    /**
     * get geburtsdatumFormatted() {
        // z.B. 7. Mai 2020
        const formatter = new Intl.DateTimeFormat('de', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return this.geburtsdatum === undefined
            ? ''
            : formatter.format(this.geburtsdatum);
    }
    */

    /**
     * Abfrage, ob im Kundennachnamen der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param nachname Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Kundennachnamen enthalten ist. Sonst
     *         false.
     */
    containsNachname(nachname: string) {
        return this.nachname === undefined
            ? false
            : this.nachname.toLowerCase().includes(nachname.toLowerCase());
    }

    /**
     * Die Kategorie ("kategorie") des Kunden um 1 erh&ouml;hen
     */
    rateUp() {
        if (this.kategorie !== undefined && this.kategorie < MAX_KATEGORIE) {
            this.kategorie++;
        }
    }

    /**
     * Die Kategorie ("kategorie") des Kunden um 1 erniedrigen
     */
    rateDown() {
        if (this.kategorie !== undefined && this.kategorie > MIN_KATEGORIE) {
            this.kategorie--;
        }
    }

    /**
     * Abfrage, ob das Kunde dem angegebenen Familienstand zugeordnet ist.
     * @param familienstand der Name des Familienstands
     * @return true, falls das Kunde dem Familienstand zugeordnet ist. Sonst false.
     */
    hasFamilienstand(familienstand: string) {
        return this.familienstand === familienstand;
    }

    /**
     * Aktualisierung der Stammdaten des Kunde-Objekts.
     * @param nachname Der neue Nachname
     * @param kategorie Die neue Kategorie
     * @param geschlecht Die neue Geschlecht (DRUCKAUSGABE oder KINDLE)
     * @param familienstand Der neue Familienstand
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        nachname: string,
        geschlecht: Geschlecht,
        familienstand: Familienstand | undefined | '',
        kategorie: number | undefined,
        // geburtsdatum: Date | undefined,
    ) {
        this.nachname = nachname;
        this.geschlecht = geschlecht;
        this.familienstand = familienstand;
        this.kategorie = kategorie;
        this.kategorieArray =
            kategorie === undefined
                ? new Array(MAX_KATEGORIE - MIN_KATEGORIE).fill(false)
                : new Array(kategorie - MIN_KATEGORIE).fill(true);
        // this.geburtsdatum =
        //     geburtsdatum === undefined ? new Date() : geburtsdatum;
    }

    /**
     * Abfrage, ob es zum Kunde auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Interesse gibt. Sonst false.
     */
    hasInteressen() {
        if (this.interessen === undefined) {
            return false;
        }
        return this.interessen.length !== 0;
    }

    /**
     * Abfrage, ob es zum Kunde das angegebene Interesse gibt.
     * @param interesse das zu &uuml;berpr&uuml;fende Interesse
     * @return true, falls es das Interesse gibt. Sonst false.
     */
    hasInteresse(interesse: string) {
        if (this.interessen === undefined) {
            return false;
        }
        return this.interessen.includes(interesse);
    }

    /**
     * Aktualisierung der Schlagw&ouml;rter des Kunde-Objekts.
     * @param reisen ist das Interesse REISEN gesetzt
     * @param lesen ist das Interesse LESEN gesetzt
     * @param sport ist das Interesse SPORT gesetzt
     */
    updateInteressen(reisen: boolean, lesen: boolean, sport: boolean) {
        this.resetInteressen();
        if (reisen) {
            this.addInteressen('REISEN');
        }
        if (lesen) {
            this.addInteressen('LESEN');
        }
        if (sport) {
            this.addInteressen('SPORT');
        }
    }

    /**
     * Konvertierung des Buchobjektes in ein JSON-Objekt f&uuml;r den RESTful
     * Web Service.
     * @return Das JSON-Objekt f&uuml;r den RESTful Web Service
     */
    toJSON(): KundeServer {
        // const geburtsdatum =
        //    this.geburtsdatum === undefined
        //        ? undefined
        //        : this.geburtsdatum.toISOString();
        // console.log(`toJson(): geburtsdatum=${geburtsdatum}`);
        return {
            _id: this._id,
            nachname: this.nachname,
            email: this.email,
            kategorie: this.kategorie,
            geschlecht: this.geschlecht,
            familienstand: this.familienstand,
            geburtsdatum: this.geburtsdatum,
            newsletter: this.newsletter,
            username: this.username,
            user: this.user,
            interessen: this.interessen,
            adresse: this.adresse,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Kunde.SPACE);
    }

    private resetInteressen() {
        this.interessen = [];
    }

    private addInteressen(interesse: string) {
        if (this.interessen === undefined) {
            this.interessen = [];
        }
        this.interessen.push(interesse);
    }
}
/* eslint-enable max-lines */
