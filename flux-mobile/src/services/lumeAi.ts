import { TimelineEvent } from "../types";

export type SuggestedChange = {
  title: string;
  reason: string;
};

export type LumeAgentResult = {
  action?:
    | {
        event: Omit<TimelineEvent, "id">;
        type: "create_event";
      }
    | undefined;
  reply: string;
};

const categoryKeywords: Record<TimelineEvent["category"], string[]> = {
  focus: ["estudio", "enfoque", "deep work", "trabajo profundo", "escribir", "leer"],
  social: ["ocio", "cena", "amigos", "salida", "padel", "pádel", "familia"],
  wellness: ["bienestar", "gimnasio", "gym", "caminar", "meditación", "meditacion", "entrenar", "doctor"],
  work: ["trabajo", "reunión", "reunion", "cliente", "llamada", "sync", "reporte"],
};

function detectCategory(input: string): TimelineEvent["category"] {
  const normalized = input.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords) as [TimelineEvent["category"], string[]][]) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return "work";
}

function extractTime(input: string) {
  const match = input.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function extractQuotedTitle(input: string) {
  const quoted = input.match(/["“](.+?)["”]/);
  return quoted?.[1]?.trim() ?? null;
}

function cleanTitle(raw: string) {
  return raw
    .replace(/(agend(a|ame|ar)|sum(a|ame|ar)|cre(a|ame|ar)|pon(e|eme)|carg(a|ame)|record(a|ame))/gi, "")
    .replace(/\b(para|el|la|las|los|de|del|una|un)\b/gi, " ")
    .replace(/\b(hoy|mañana|manana|a las|alas|a las)\b/gi, " ")
    .replace(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(input: string) {
  const quotedTitle = extractQuotedTitle(input);

  if (quotedTitle) {
    return quotedTitle;
  }

  const withoutScheduleHints = input
    .replace(/recordame|recuérdame|recordá|recorda/gi, "recordatorio")
    .replace(/mañana|manana|hoy|pasado mañana|pasado manana/gi, "")
    .trim();

  const title = cleanTitle(withoutScheduleHints);

  if (!title) {
    return null;
  }

  return title.charAt(0).toUpperCase() + title.slice(1);
}

function buildDescription(input: string, category: TimelineEvent["category"]) {
  const normalized = input.trim();

  if (normalized.length <= 90) {
    return `Bloque creado por Lume para ${category === "work" ? "trabajo" : category === "wellness" ? "bienestar" : category === "focus" ? "enfoque" : "social"}.`;
  }

  return normalized;
}

function wantsScheduling(input: string) {
  return /(agend|suma|agrega|crea|carga|pon[eé]|recorda|recordá|recordame|anota|bloquea)/i.test(input);
}

export function analyzeSchedule(events: TimelineEvent[]): SuggestedChange[] {
  const focusCount = events.filter((event) => event.category === "focus").length;
  const lateEvents = events.filter((event) => Number(event.time.split(":")[0]) >= 18).length;

  return [
    {
      title: focusCount < 2 ? "Reservá un bloque de enfoque" : "Tu foco viene bien encaminado",
      reason:
        focusCount < 2
          ? "Todavía no aparece suficiente tiempo protegido para tareas profundas."
          : "Ya tenés una base sólida de trabajo concentrado para el día.",
    },
    {
      title: lateEvents > 1 ? "Cuidá el cierre del día" : "La tarde está bastante balanceada",
      reason:
        lateEvents > 1
          ? "Hay varias actividades tarde y eso puede dejarte sin aire al final del día."
          : "Todavía tenés margen para sumar un bloque útil sin sobrecargarte.",
    },
  ];
}

export async function processLumeInput(input: string, events: TimelineEvent[], selectedDateLabel: string): Promise<LumeAgentResult> {
  const normalized = input.trim();

  if (!normalized) {
    return {
      reply: "Decime qué querés reorganizar o qué actividad querés que te cargue.",
    };
  }

  if (wantsScheduling(normalized)) {
    const time = extractTime(normalized);
    const title = extractTitle(normalized);
    const category = detectCategory(normalized);

    if (!title) {
      return {
        reply: `Puedo cargarlo en ${selectedDateLabel}, pero necesito un título claro para la actividad.`,
      };
    }

    if (!time) {
      return {
        reply: `Entendí que querés agendar "${title}", pero me falta la hora. Decímela en formato 18:30 y la cargo en ${selectedDateLabel}.`,
      };
    }

    return {
      action: {
        type: "create_event",
        event: {
          category,
          description: buildDescription(normalized, category),
          tags: [`#${category}`],
          time,
          title,
        },
      },
      reply: `Listo, ya te cargué "${title}" para ${selectedDateLabel} a las ${time}. Si querés, ahora también te propongo dónde conviene ubicar otro bloque.`,
    };
  }

  const suggestions = analyzeSchedule(events);

  if (!events.length) {
    return {
      reply:
        "Todavía no tenés actividades cargadas. Si querés, decime algo como 'agendame reunión con diseño a las 11:00' y lo sumo directo al calendario.",
    };
  }

  if (/reorgan|acomod|orden|plan|mejor/i.test(normalized)) {
    return {
      reply: `Viendo tu agenda actual, yo haría esto: ${suggestions[0].title}. ${suggestions[0].reason} Además, ${suggestions[1].title.toLowerCase()}. ${suggestions[1].reason}`,
    };
  }

  if (/qué hago|que hago|suger/i.test(normalized)) {
    return {
      reply: `Mi sugerencia ahora mismo es: ${suggestions[0].title}. ${suggestions[0].reason}`,
    };
  }

  return {
    reply: `Te acompaño con eso. Mirando ${selectedDateLabel}, mi lectura es esta: ${suggestions[0].title}. ${suggestions[0].reason} Si querés, también puedo cargarte una actividad nueva directamente desde este chat.`,
  };
}
