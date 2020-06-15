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

export class Adresse {
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
// eslint-disable-next-line @typescript-eslint/no-type-alias
type UUID = string;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Kundendaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface KundeShared {
    _id?: UUID;
    nachname?: string;
    email?: string;
    kategorie?: number;
    newsletter?: boolean;
    geburtsdatum?: Date;
    umsatz?: Umsatz;
    homepage?: string;
    geschlecht?: Geschlecht;
    familienstand?: Familienstand;
    // Dürfen die Interessen da drin stehen ?
    interessen?: Array<string>;
    adresse?: Adresse;
    version?: number;
}

interface Link {
    rel: string;
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
    interessen?: Array<string>;
    links?: Array<Link>;
}

/**
 * Daten aus einem Formular:
 * <ul>
 *  <li> je 1 Control fuer jede Checkbox und
 *  <li> au&szlig;erdem Strings f&uuml;r Eingabefelder f&uuml;r Zahlen.
 * </ul>
 */
export interface KundeForm extends KundeShared {
    sport?: boolean;
    lesen?: boolean;
    reisen?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Kunde {
    // private static readonly SPACE = 2;

    datum: Date | undefined;

    // interessen: Array<string>;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: UUID | undefined,
        public nachname: string | undefined,
        public email: string | undefined,
        public kategorie: number | undefined,
        public newsletter: boolean | undefined,
        public geburtsdatum: Date | undefined,
        public umsatz: Umsatz | undefined,
        public homepage: string | undefined,
        public geschlecht: Geschlecht | undefined,
        public familienstand: Familienstand | undefined,
        public interessen: Array<string> | undefined,
        public adresse: Adresse | undefined,
        public version: number | undefined,
    ) {
        // TODO Parsing, ob der Datum-String valide ist
        this.geburtsdatum =
            geburtsdatum === undefined ? undefined : new Date(geburtsdatum);
        this.interessen = interessen === undefined ? [] : interessen;
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
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const selfLinkJson = kundeServer.links && kundeServer.links[0];
        if (selfLinkJson !== undefined && selfLinkJson.rel === 'self') {
            selfLink = selfLinkJson.href;
        }
        let id: UUID | undefined;
        if (selfLink !== undefined) {
            const lastSlash = selfLink.lastIndexOf('/');
            id = selfLink.slice(Math.max(0, lastSlash + 1));
        }

        let version: number | undefined;
        if (etag !== undefined) {
            // Anfuehrungszeichen am Anfang und am Ende entfernen
            // eslint-disable-next-line unicorn/prefer-string-slice
            const versionStr = etag.substring(1, etag.length - 1);
            version = Number.parseInt(versionStr, 10);
        }

        const kunde = new Kunde(
            id,
            kundeServer.nachname,
            kundeServer.email,
            kundeServer.kategorie,
            kundeServer.newsletter,
            kundeServer.geburtsdatum,
            kundeServer.umsatz,
            kundeServer.homepage,
            kundeServer.geschlecht,
            kundeServer.familienstand,
            kundeServer.interessen,
            kundeServer.adresse,
            version,
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
        const interessen: Array<string> = [];
        if (kundeForm.lesen === true) {
            interessen.push('L');
        }
        if (kundeForm.reisen === true) {
            interessen.push('R');
        }
        if (kundeForm.sport === true) {
            interessen.push('S');
        }

        const testAdresse = new Adresse('12345', 'Mosbach');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const testUmsatz = new Umsatz(45, 'EUR');

        const kunde = new Kunde(
            kundeForm._id,
            kundeForm.nachname,
            kundeForm.email,
            kundeForm.kategorie,
            kundeForm.newsletter,
            kundeForm.geburtsdatum,
            testUmsatz,
            kundeForm.homepage,
            kundeForm.geschlecht,
            kundeForm.familienstand,
            interessen,
            testAdresse,
            kundeForm.version,
        );
        console.log('Kunde.fromForm(): kunde=', kunde);
        return kunde;
    }

    // Property in TypeScript wie in C#
    // https://www.typescriptlang.org/docs/handbook/classes.html#accessors
    get datumFormatted() {
        // z.B. 7. Mai 2020
        const formatter = new Intl.DateTimeFormat('de', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return this.datum === undefined ? '' : formatter.format(this.datum);
    }

    /**
     * Abfrage, ob im Kundetitel der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param nachname Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Kundetitel enthalten ist. Sonst
     *         false.
     */
    containsNachname(nachname: string) {
        return this.nachname === undefined
            ? false
            : this.nachname.toLowerCase().includes(nachname.toLowerCase());
    }

    /**
     * Aktualisierung der Stammdaten des Kunden-Objekts.
     * @param nachname
     * @param familienstand
     * @param email
     * @param homepage
     * @param kategorie
     * @param newsletter
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        nachname: string,
        familienstand: Familienstand,
        email: string,
        homepage: string,
        kategorie: number | undefined,
        newsletter: boolean,
    ) {
        this.nachname = nachname;
        this.familienstand = familienstand;
        this.email = email;
        this.homepage = homepage;
        this.kategorie = kategorie;
        this.newsletter = newsletter;
    }

    /**
     * Abfrage, ob es zum Kunde auch Interessen gibt.
     * @return true, falls es mindestens eine Interesse gibt. Sonst false.
     */
    hasInteressen() {
        if (this.interessen === undefined || this.interessen === undefined) {
            return false;
        }
        return this.interessen.length !== 0;
    }

    /**
     * Abfrage, ob es zum Kunde die angegebene Interesse gibt.
     * @param interesse die zu überprüf. Interesse
     * @return true, falls es die Interesse gibt. Sonst false.
     */
    hasInteresse(interesse: string) {
        if (this.interessen === undefined) {
            return false;
        }
        return this.interessen.includes(interesse);
    }

    /**
     * Aktualisierung der Interessen des Kunde-Objekts.
     * @param lesen ist das Schlagwort LESEN gesetzt
     * @param reisen ist das Schlagwort REISEN gesetzt
     * @param sport ist das Schlagwort SPORT gesetzt
     */
    // updateInteressen

    /**
     * Konvertierung des Kundeobjektes in ein JSON-Objekt für den RESTful
     * Web Service.
     * @return Das JSON-Objekt für den RESTful Web Service
     */
    toJSON(): KundeServer {
        // const datum =
        //     this.datum === undefined
        //         ? undefined
        //         : this.datum.format('YYYY-MM-DD')
        return {
            _id: this._id,
            nachname: this.nachname,
            email: this.email,
            kategorie: this.kategorie,
            newsletter: this.newsletter,
            geburtsdatum: this.geburtsdatum,
            umsatz: this.umsatz,
            homepage: this.homepage,
            geschlecht: this.geschlecht,
            familienstand: this.familienstand,
            interessen: this.interessen,
            adresse: this.adresse,
        };
    }

    updateInteressen(reisen: boolean, lesen: boolean, sport: boolean) {
        this.resetInteressen();
        if (reisen) {
            this.addInteresse('REISEN');
        }
        if (sport) {
            this.addInteresse('SPORT');
        }
        if (lesen) {
            this.addInteresse('LESEN');
        }
    }

    toString() {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return JSON.stringify(this, undefined, 2);
    }

    private resetInteressen() {
        this.interessen = [];
    }

    private addInteresse(interesse: string) {
        if (this.interessen === undefined) {
            this.interessen = [];
        }
        this.interessen.push(interesse);
    }
}
/* eslint-enable max-lines */
