const ALLOWED_EMOJIS = ['🇪', '🇱'];

module.exports = async function messageReactionAdd(client, reaction, user) {
    try {
        if (user.bot) return;

        if (reaction.partial) {
            await reaction.fetch();
        }
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }

        const message = reaction.message;
        if (!message.author || message.author.id !== client.user.id) return;

        // Solo aplica esta restricción a mensajes de "Eat or Leave"
        // (identificados porque el propio bot puso las reacciones E y L)
        const hasE = message.reactions.cache.has('🇪');
        const hasL = message.reactions.cache.has('🇱');
        if (!hasE || !hasL) return;

        if (!ALLOWED_EMOJIS.includes(reaction.emoji.name)) {
            await reaction.users.remove(user.id);
        }
    } catch (error) {
        console.error('Error en messageReactionAdd:', error);
    }
};
