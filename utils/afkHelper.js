function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
        return `hace ${seconds} segundo${seconds === 1 ? '' : 's'}`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `hace ${minutes} minuto${minutes === 1 ? '' : 's'}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `hace ${hours} hora${hours === 1 ? '' : 's'}`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) {
        return 'hace un día';
    }
    return `hace ${days} días`;
}

module.exports = { formatDuration };
