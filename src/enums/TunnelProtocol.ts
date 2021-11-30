export enum TunnelProtocol {
    HTTP = 'http', TCP = 'tcp', WEBSOCKET = 'websocket'
}

export const ALLOWED_PROTOCOLS = [TunnelProtocol.HTTP, TunnelProtocol.TCP, TunnelProtocol.WEBSOCKET];
