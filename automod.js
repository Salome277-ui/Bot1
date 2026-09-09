const {
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  AutoModerationActionType,
  AutoModerationRuleKeywordPresetType,
  PermissionFlagsBits
} = require("discord.js");

/*
  ============================================================
                    CONFIGURACIÓN DE AUTOMOD
  ============================================================

  Este archivo NO modifica /anuncio.

  Discord permite como máximo 6 reglas de tipo Keyword
  por servidor, por eso agrupamos las palabras en 6 reglas.

  Cada regla puede contener hasta 1000 palabras/frases.
*/

// ============================================================
// LISTAS DE PALABRAS
// ============================================================

// 1. Insultos y ataques
const insultos = [
  "idiota",
  "estupido",
  "estúpido",
  "imbecil",
  "imbécil",
  "tonto",
  "pendejo",
  "pendeja",
  "baboso",
  "babosa",
  "payaso",
  "payasa",
  "ridiculo",
  "ridícula",
  "ridículo",
  "inutil",
  "inútil",
  "perdedor",
  "perdedora",
  "fracasado",
  "fracasada",
  "basura",
  "animal",
  "tarado",
  "tarada",
  "mens0",
  "mensito",
  "bruto",
  "bruta",
  "maldito",
  "maldita"
];

// 2. Spam y flood
const spam = [
  "spam",
  "spamear",
  "spameando",
  "flood",
  "flooding",
  "entra ya",
  "entra ahora",
  "suscribete",
  "suscríbete",
  "sígueme",
  "follow me",
  "like y comparte",
  "comparte esto",
  "gana dinero facil",
  "gana dinero fácil",
  "dinero rapido",
  "dinero rápido"
];

// 3. Estafas / phishing
const estafas = [
  "free nitro",
  "nitro gratis",
  "nitro free",
  "discord nitro gratis",
  "discord gift",
  "gift nitro",
  "regalo nitro",
  "gratis nitro",
  "free robux",
  "robux gratis",
  "robux free",
  "free vbucks",
  "vbucks gratis",
  "cuenta gratis",
  "cuentas gratis",
  "hackea tu cuenta",
  "verifica tu cuenta",
  "verifica ahora",
  "login aqui",
  "login aquí",
  "inicia sesion aqui",
  "inicia sesión aquí",
  "contraseña gratis",
  "password gratis"
];

// 4. Contenido peligroso / malware
const peligro = [
  "virus",
  "malware",
  "troyano",
  "trojan",
  "keylogger",
  "stealer",
  "token grabber",
  "token logger",
  "rat malware",
  "remote access trojan",
  "ransomware",
  "spyware",
  "botnet",
  "cryptojacking"
];

// 5. Doxxing / información privada
const privacidad = [
  "dox",
  "doxxing",
  "doxxeo",
  "doxear",
  "direccion de casa",
  "dirección de casa",
  "numero de telefono",
  "número de teléfono",
  "numero telefonico",
  "número telefónico",
  "contraseña",
  "password",
  "documento de identidad",
  "numero de documento",
  "número de documento",
  "tarjeta de credito",
  "tarjeta de crédito",
  "datos personales",
  "informacion personal",
  "información personal"
];

// 6. Publicidad / invitaciones no autorizadas
const publicidad = [
  "discord.gg/",
  "discord.com/invite/",
  "discordapp.com/invite/",
  "entra a mi servidor",
  "entra en mi servidor",
  "únete a mi servidor",
  "unete a mi servidor",
  "mi servidor de discord",
  "join my server",
  "join our server",
  "join my discord",
  "subscribe",
  "suscribete a mi canal",
  "suscríbete a mi canal",
  "youtube.com/",
  "youtu.be/",
  "tiktok.com/",
  "twitch.tv/",
  "instagram.com/"
];

// ============================================================
// FUNCIÓN PARA CREAR UNA REGLA KEYWORD
// ============================================================

async function crearKeywordRule(guild, nombre, palabras) {
  try {
    const existente = guild.autoModerationRules.cache.find(
      rule => rule.name === nombre
    );

    // Evita duplicar reglas si el bot reinicia
    if (existente) {
      console.log(`⚠️ Ya existe: ${nombre}`);
      return existente;
    }

    const regla = await guild.autoModerationRules.create({
      name: nombre,

      eventType: AutoModerationRuleEventType.MessageSend,

      triggerType: AutoModerationRuleTriggerType.Keyword,

      triggerMetadata: {
        keywordFilter: palabras
      },

      actions: [
        {
          type: AutoModerationActionType.BlockMessage
        }
      ],

      enabled: true,

      reason: "Sistema de AutoMod del bot"
    });

    console.log(`✅ Creada: ${nombre}`);

    return regla;

  } catch (error) {
    console.error(`❌ Error creando ${nombre}:`, error.message);
  }
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

async function configurarAutoMod(guild) {

  // Comprobamos permisos
  const me = guild.members.me;

  if (!me) {
    console.log("❌ No se encontró al bot en el servidor.");
    return;
  }

  if (!me.permissions.has(PermissionFlagsBits.ManageGuild)) {
    console.log(
      `❌ El bot necesita el permiso "Gestionar servidor" en ${guild.name}`
    );
    return;
  }

  console.log(`\n🛡️ Configurando AutoMod en: ${guild.name}`);

  // ==========================================================
  // LAS 6 REGLAS KEYWORD PERMITIDAS
  // ==========================================================

  await crearKeywordRule(
    guild,
    "🛡️ AutoMod | Insultos",
    insultos
  );

  await crearKeywordRule(
    guild,
    "🛡️ AutoMod | Spam",
    spam
  );

  await crearKeywordRule(
    guild,
    "🛡️ AutoMod | Estafas",
    estafas
  );

  await crearKeywordRule(
    guild,
    "🛡️ AutoMod | Malware",
    peligro
  );

  await crearKeywordRule(
    guild,
    "🛡️ AutoMod | Privacidad",
    privacidad
  );

  await crearKeywordRule(
    guild,
    "🛡️ AutoMod | Publicidad",
    publicidad
  );

  // ==========================================================
  // REGLA DE SPAM NATIVO DE DISCORD
  // ==========================================================

  try {

    const existenteSpam =
      guild.autoModerationRules.cache.find(
        rule => rule.name === "🛡️ AutoMod | Discord Spam"
      );

    if (!existenteSpam) {

      await guild.autoModerationRules.create({

        name: "🛡️ AutoMod | Discord Spam",

        eventType: AutoModerationRuleEventType.MessageSend,

        triggerType: AutoModerationRuleTriggerType.Spam,

        actions: [
          {
            type: AutoModerationActionType.BlockMessage
          }
        ],

        enabled: true,

        reason: "Protección contra spam"
      });

      console.log("✅ Regla de spam creada");

    } else {

      console.log("⚠️ La regla de spam ya existe");

    }

  } catch (error) {

    console.error(
      "❌ Error creando regla de spam:",
      error.message
    );

  }

  // ==========================================================
  // PROTECCIÓN CONTRA MUCHAS MENCIONES
  // ==========================================================

  try {

    const existenteMention =
      guild.autoModerationRules.cache.find(
        rule => rule.name === "🛡️ AutoMod | Menciones masivas"
      );

    if (!existenteMention) {

      await guild.autoModerationRules.create({

        name: "🛡️ AutoMod | Menciones masivas",

        eventType: AutoModerationRuleEventType.MessageSend,

        triggerType: AutoModerationRuleTriggerType.MentionSpam,

        triggerMetadata: {

          mentionTotalLimit: 5,

          mentionRaidProtectionEnabled: true

        },

        actions: [
          {
            type: AutoModerationActionType.BlockMessage
          }
        ],

        enabled: true,

        reason: "Protección contra menciones masivas"
      });

      console.log("✅ Regla de menciones creada");

    } else {

      console.log("⚠️ La regla de menciones ya existe");

    }

  } catch (error) {

    console.error(
      "❌ Error creando regla de menciones:",
      error.message
    );

  }

  // ==========================================================
  // PRESETS OFICIALES DE DISCORD
  // ==========================================================

  /*
    IMPORTANTE:

    Discord permite solamente 1 regla KeywordPreset por servidor.

    Esta regla utiliza los filtros oficiales de Discord:
    - Insultos
    - Contenido sexual
    - Slurs
  */

  try {

    const existentePreset =
      guild.autoModerationRules.cache.find(
        rule => rule.name === "🛡️ AutoMod | Filtros de Discord"
      );

    if (!existentePreset) {

      await guild.autoModerationRules.create({

        name: "🛡️ AutoMod | Filtros de Discord",

        eventType: AutoModerationRuleEventType.MessageSend,

        triggerType:
          AutoModerationRuleTriggerType.KeywordPreset,

        triggerMetadata: {

          presets: [
            AutoModerationRuleKeywordPresetType.Profanity,
            AutoModerationRuleKeywordPresetType.SexualContent,
            AutoModerationRuleKeywordPresetType.Slurs
          ]

        },

        actions: [
          {
            type: AutoModerationActionType.BlockMessage
          }
        ],

        enabled: true,

        reason: "Filtros oficiales de AutoMod de Discord"
      });

      console.log("✅ Presets oficiales activados");

    } else {

      console.log("⚠️ Los presets oficiales ya existen");

    }

  } catch (error) {

    console.error(
      "❌ Error creando presets:",
      error.message
    );

  }

  console.log(
    `\n✅ AutoMod terminado en ${guild.name}\n`
  );
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  configurarAutoMod
};

Cómo conectarlo con tu bot

En tu "index.js":

const { configurarAutoMod } = require("./automod");

Y cuando el bot esté listo:

client.once("ready", async () => {

  console.log(`🤖 ${client.user.tag} está conectado.`);

  for (const guild of client.guilds.cache.values()) {

    await configurarAutoMod(guild);

  }

});

Y para que también se configure automáticamente cuando metas el bot en un servidor nuevo:

client.on("guildCreate", async (guild) => {

  console.log(`📥 Entré a: ${guild.name}`);

  await configurarAutoMod(guild);

});

⚠️ Una cosa MUY importante

El bot necesita permiso de Gestionar servidor para crear estas reglas, y las reglas de AutoMod se crean mediante la API de Discord.

Además, esto no modifica "/anuncio", tal como pediste.

Si quieres añadir más palabras, solo tienes que meterlas dentro de las listas. Cada regla Keyword admite hasta 1.000 entradas, así que tienes muchísimo espacio para ampliar el sistema.
