function merge(mergein, mergeto) {
    if (!mergein) mergein = {};
    if (!mergeto) return mergein;

    for (var item in mergeto) {
        try {
            mergein[item] = mergeto[item];
        } catch (e) {}
    }
    return mergein;
}
