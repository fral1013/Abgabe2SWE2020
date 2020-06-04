/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
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

/* eslint-disable max-classes-per-file */

export class FindError extends Error {
    readonly statuscode: number;

    readonly cause: Error;

    constructor(statuscode: number, msg: string, cause: Error) {
        super(msg);
        this.name = 'FindError';
        this.statuscode = statuscode;
        this.cause = cause;
    }
}

export class SaveError extends Error {
    readonly statuscode: number;

    readonly cause: Error;

    constructor(statuscode: number, msg: string, cause: Error) {
        super(msg);
        this.name = 'SaveError';
        this.statuscode = statuscode;
        this.cause = cause;
    }
}

export class RemoveError extends Error {
    readonly statuscode: number;

    constructor(statuscode: number) {
        super(statuscode.toString());
        this.name = 'RemoveError';
        this.statuscode = statuscode;
    }
}

/* eslint-enable max-classes-per-file */
