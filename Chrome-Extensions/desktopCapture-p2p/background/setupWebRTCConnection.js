function setupWebRTCConnection(stream) {
    // forcing RTCMultiConnection ONLY
    // reason: webserver doesn't has enough memory and CPU to serve any media server
    shareStreamUsingRTCMultiConnection(stream);

    if (streaming_method === 'RTCMultiConnection') {
        // shareStreamUsingRTCMultiConnection(stream);
    }

    if (streaming_method === 'AntMediaServer') {
        // shareStreamUsingAntMediaServer(stream);
    }
}
