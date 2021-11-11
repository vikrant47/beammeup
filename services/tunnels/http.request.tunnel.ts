import {HttpRequestPacket} from "../../pojos/http.request.packet";
import axios from "axios";
import {Tunnel} from "../tunnel";
import {OutPacketType, TunnelHttpData, TunnelHttpResponse, TunnelOutPacket} from "../../pojos/tunnel.out.packet";

const UuidV4 = require('uuid').V4;

export class HttpRequestTunnel {
    constructor(protected tunnelInstance: Tunnel) {
    }

    tunnel() {
        this.tunnelInstance.on('tunnel.socket.data', async (data) => {
            const payload = JSON.parse(data.toString('utf-8'));
            const request = <HttpRequestPacket>payload.request;
            const response = await axios({
                url: this.tunnelInstance.getBaseUrl() + request.url,
                method: request.method,
                params: request.params,
                headers: request.headers,
                data: request.params,
                responseType: 'arraybuffer',
            });
            const body = Buffer.from(response.data, 'binary').toString('base64')
            this.sendHttpResponse({
                id: '',
                type: OutPacketType.HttpResponse,
                alias: this.tunnelInstance.tunnelMeta.alias,
                createdAt: new Date(),
                first_packet: false,
                httpData: {
                    alias: this.tunnelInstance.tunnelMeta.alias,
                    requestId: request.id,
                    response: {
                        headers: <Object>response.headers,
                        body: body,
                        status: response.status,
                    }
                },
            });
        });
    }

    sendHttpResponse(response: TunnelOutPacket) {
        const httpData = response.httpData;
        delete response.httpData;
        this.tunnelInstance.sendPacket(response);
        const serializedHttpData = JSON.stringify(httpData);
        console.debug('sending data to server', serializedHttpData);
        this.tunnelInstance.send(serializedHttpData);
        this.tunnelInstance.send('$$$LAST_BYTE_' + response.id);
    }
}
