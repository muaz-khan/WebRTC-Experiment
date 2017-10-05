if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = getStats;
}

if (typeof window !== 'undefined') {
    window.getStats = getStats;
}
