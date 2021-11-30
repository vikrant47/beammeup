import {TunnelProtocol} from "../enums/TunnelProtocol";
import * as net from "net";
import EventEmitter from "events";
import {OutPacketType, TunnelMeta, TunnelOutPacket} from "../pojos/tunnel.out.packet";
import {HttpRequestTunnel} from "./tunnels/http.request.tunnel";


export class Tunnel extends EventEmitter {
    protected connection = new net.Socket();
    public tunnelMeta: TunnelMeta = null;

    constructor(
        protected protocol: TunnelProtocol = TunnelProtocol.HTTP,
        protected alias: string,
        protected host = 'localhost',
        protected port: number,
        protected token = 'token') {
        super();
    }

    getBaseUrl(): string {
        return this.protocol + '://' + this.host + ':' + this.port;
    }

    connect() {
        console.debug('Establishing connection with server');
        this.connection.connect(parseInt(process.env.TUNNEL_PORT) || 8888, process.env.TUNNEL_HOST || 'localhost', () => {
            console.debug('Connected with server, creating tunnel ', this.alias, ' with protocol', this.protocol);
            this.onConnect();
        });
        this.connection.on('data', (data) => {
            console.log('Received: ' + data);
            this.onData(data);
        });

        this.connection.on('close', () => {
            console.log('Disconnected !');
            this.onClose();
        });
        //just added
        this.connection.on("error", (err) => {
            console.log("Service down ! Unable to communicate with with server");
            this.onError();
        });
    }

    onConnect() {
        this.emit('tunnel.socket.connect');
        this.sendPacket({
            id: '',
            type: OutPacketType.ConnectionPacket,
            alias: this.alias,
            meta: {
                alias: this.alias,
                protocol: this.protocol,
                token: this.token,
            },
            first_packet: true,
            createdAt: new Date(),
        });
    }

    onData(data) {
        this.emit('tunnel.socket.data', data);
        if (!this.tunnelMeta) {
            const payload = JSON.parse(data.toString('utf-8'));
            if (payload.type === 'tunnel.error') {
                this.connection.destroy(payload.message);
                throw new Error(payload.message);
            } else if (payload.type === 'tunnel.success') {
                this.tunnelMeta = payload.meta;
                this.alias = payload.meta.alias;
                console.debug('Tunnel meta received ', this.tunnelMeta);
                console.log('Tunnel created ', this.protocol + '://', payload.endpoint, ' -> ', this.host + ':' + this.port);
                if (this.protocol === TunnelProtocol.HTTP) {
                    new HttpRequestTunnel(this).tunnel();
                }
            }
        }
    }

    onError() {
        this.emit('tunnel.socket.error');
    }

    onClose() {
        this.emit('tunnel.socket.close');
    }

    send(buffer: Uint8Array | string, cb?: (err?: Error) => void) {
        this.connection.write(buffer);
    }

    sendPacket(packet: TunnelOutPacket) {
        const serializedPacket = JSON.stringify(packet);
        console.debug('Sending serialized packet ', serializedPacket);
        this.connection.write(serializedPacket);
    }
}
