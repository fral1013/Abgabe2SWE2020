/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as minimist from 'minimist';
import * as path from 'path';
import * as shell from 'shelljs';
// @@ts-expect-error
import * as slash from 'slash'; // eslint-disable-line import/namespace

import { dir } from './constants';

const nginxDir = 'C:/Zimmermann/nginx';

const argv = minimist(process.argv.slice(0));
const values = argv._;
const start = values[2] === undefined || values[2] === 'start';
const stop = values[2] === 'stop';
const init = values[2] === 'init';

if (start) {
    console.log('nginx startet ohne Meldung...');
    console.log('Herunterfahren durch "npm run start:nginx stop"');
    shell.exec(`cd ${nginxDir} && nginx`);
} else if (stop) {
    shell.exec(`cd ${nginxDir} && nginx -s quit`);
} else if (init) {
    // Bei file:/// erlaubt ein Browser aus Sicherheitsgründen keine Ajax-Requests,
    // weil JavaScript sonst direkt im Dateisystem lesen koennte
    const { dist, nginx } = dir;
    const basedir = slash(path.join(__dirname, '..', dist));
    const confFileCopy = path.join(nginx, 'conf', 'nginx.conf');

    /* eslint-disable no-null/no-null */
    const readCb = (err: any, data: any) => {
        if (err !== undefined && err !== null) {
            return console.log(err);
        }
        const result = data.replace(/BASEDIR_JZ/gu, basedir);

        const errCb = (errWrite: any) => {
            if (errWrite !== undefined && errWrite !== null) {
                return console.log(errWrite);
            }
        };
        fs.writeFile(confFileCopy, result, 'utf8', errCb);
    };
    /* eslint-enable no-null/no-null */

    fs.readFile('config/webserver/nginx/nginx.conf', 'utf8', readCb);
}

/* eslint-enable @typescript-eslint/no-explicit-any */
