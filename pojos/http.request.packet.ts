import {Method} from "axios";

export interface HttpRequestPacket {
    id: string,
    url: string,
    method: Method;
    path: string;
    headers: any;
    body: any;
    params: any;
}
