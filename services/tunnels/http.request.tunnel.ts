import {HttpRequestPacket} from "../../pojos/http.request.packet";
import axios from "axios";
import {Tunnel} from "../tunnel";

export class HttpRequestTunnel {
    constructor(protected tunnelInstance: Tunnel) {
    }

    tunnel() {
        this.tunnelInstance.on('tunnel.socket.data', async (data) => {
            const payload = JSON.parse(data.toString('utf-8'));
            const request = <HttpRequestPacket>payload.requestData;
            const response = await axios({
                url: this.tunnelInstance.getBaseUrl() + request.url,
                method: request.method,
                params: request.params,
                headers: request.headers,
                data: request.params,
            });
            this.tunnelInstance.sendPacket({
                alias: this.tunnelInstance.tunnelMeta.alias,
                createdAt: new Date(),
                first_packet: false,
                httpData: {
                    requestId: request.id,
                    tunnelAlias: this.tunnelInstance.tunnelMeta.alias,
                    response: {
                        headers: <Object>response.headers,
                        body: response.data,
                        status: response.status,
                    }
                },
            });
        });
    }
}
