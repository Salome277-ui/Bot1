/**
 * Convierte un tag de emoji tipo <:nombre:id> o <a:nombre:id>
 * al formato que espera ButtonBuilder.setEmoji().
 */
function parseEmoji(tag) {
    const match = tag.match(/^<(a)?:(\w+):(\d+)>$/);
    if (!match) return { name: tag };
    return { animated: !!match[1], name: match[2], id: match[3] };
}

module.exports = { parseEmoji };
