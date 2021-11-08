#!/usr/bin/env node
import {Tunnel} from "./services/tunnel";
import {ALLOWED_PROTOCOLS, TunnelProtocol} from "./enums/TunnelProtocol";

const yargs = require('yargs');
const argv = yargs
    .command('beammeup', 'Expose your localhost to world', {})
    .option('port', {
        description: 'Your local port for the tunnel',
        alias: 'pt',
        type: 'number',
        default: '80',
        nargs: 1,
    })
    .option('protocol', {
        description: 'Protocol to expose tunnel http|tcp|websocket',
        alias: 'p',
        type: 'number',
        default: 'http',
        nargs: 1,
    })
    .option('host', {
        description: 'Hostname you want to expose',
        alias: 'h',
        type: 'string',
        default: 'localhost',
        nargs: 1,
    })
    .option('token', {
        description: 'User token ,leave blank for free user',
        type: 'string',
        alias: 't',
        default: 'token',
        nargs: 1,
    })
    .option('alias', {
        description: 'Alias/Subdomain for the tunnel',
        alias: 'a',
        type: 'string',
        default: null,
        nargs: 1,
    })
    .help()
    .argv;

const initTunnel = () => {
    const protocol = <TunnelProtocol>(argv.protocol || TunnelProtocol.HTTP);
    if (ALLOWED_PROTOCOLS.indexOf(protocol) < 0) {
        throw new Error('Invalid protocol ' + protocol + ' only ' + ALLOWED_PROTOCOLS.join(',') + ' are allowed')
    }
    const tunnel = new Tunnel(protocol, argv.alias, argv.host, argv.port, argv.token);
    return tunnel.connect();
}
initTunnel();

