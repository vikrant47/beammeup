export enum OutPacketType {
    HttpResponse = 'HttpResponse',
    ConnectionPacket = 'ConnectionPacket',
}

export interface TunnelOutPacket {
    id: string,
    type: OutPacketType,
    meta?: TunnelMeta;
    httpData?: TunnelHttpData;
    createdAt: Date;
    alias: string;
    first_packet: boolean;
}

export interface TunnelMeta {
    id?: string;
    alias: string;
    clientIp?: string;
    token: string;
    protocol: string;
}

export interface TunnelHttpResponse {
    status: number;
    body: any;
    headers: any;
}

export interface TunnelHttpData {
    requestId: string;
    alias: string;
    response: TunnelHttpResponse;
}
