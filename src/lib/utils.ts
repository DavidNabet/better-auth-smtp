import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateUniqueId = (file: File) => {
  return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function toBase64(file: File) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

/**
 * Encodage pour jetons ~...~ utilisant un encodage URI en pourcentage.
 * - encodeURIComponent est utilisé pour encoder un caractère en UTF-8 percent-encoding.
 * - Certains caractères que encodeURIComponent ne transforme pas (._!~*'() et _)
 *   sont pris en charge via une table de correspondance pour forcer l'encodage.
 */
function percentEncodeCharForToken(ch: string): string {
  const forceMap: Record<string, string> = {
    _: "%5F",
    ".": "%2E",
    "!": "%21",
    "~": "%7E",
    "*": "%2A",
    "'": "%27",
    "(": "%28",
    ")": "%29",
  };

  if (ch in forceMap) {
    return forceMap[ch];
  }

  // encodeURIComponent gère tous les autres cas (y compris non-ASCII)
  const enc = encodeURIComponent(ch);
  // Par sécurité, si rien n'a été encodé (cas très rare non couvert ci-dessus)
  // on encode manuellement en UTF-8 via encodeURIComponent sur une concat.
  if (enc === ch) {
    return ch
      .split("")
      .map((c) => encodeURIComponent(c))
      .join("");
  }
  return enc;
}

/**
 * Encode un texte en slug réversible.
 * Règles:
 * - Espaces => '-' (runs collapsés, trim en bord)
 * - [A-Za-z0-9] => minuscule (conservé tel quel)
 * - '-' littéral => "%2D" (pour ne pas le confondre avec les espaces)
 * - Tout autre caractère => encodage pourcentage "%.."
 */
export function slugify(text: string): string {
  if (text === null) return "";
  const input = String(text);

  const out: string[] = [];
  let lastWasHyphen = false;

  for (const ch of input) {
    if (/\s/.test(ch)) {
      if (!lastWasHyphen) {
        out.push("-");
        lastWasHyphen = true;
      }
      continue;
    }

    if (/[A-Za-z0-9]/.test(ch)) {
      out.push(ch.toLowerCase());
      lastWasHyphen = false;
      continue;
    }

    if (ch === "-") {
      out.push("%2D");
      lastWasHyphen = false;
      continue;
    }

    const token = percentEncodeCharForToken(ch);
    out.push(token);
    lastWasHyphen = false;
  }

  let slug = out.join("");
  slug = slug.replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  return slug;
}

/**
 * Décode un slug réversible:
 * 1) Normalise et retire les '-' en bord, puis convertit les '-' restants en espaces (ces '-' proviennent des espaces)
 * 2) Décode les séquences de pourcentage (%HH) restantes vers leurs caractères d'origine
 * 3) Normalise les espaces et capitalise la première lettre
 *
 * Important: l'ordre (tirets -> espaces, puis décodage) permet de préserver les tirets
 * d'origine encodés en %2D.
 */
export function decodeSlug(slug: string): string {
  if (!slug) return "";

  // Sanitize simple des séquences de "-" + trim
  let s = String(slug)
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Les "-" restants correspondent à des espaces originaux
  s = s.replace(/-/g, " ");

  // Décoder toutes les séquences de pourcentages valides
  s = s.replace(/(?:%[0-9A-Fa-f]{2})+/g, (m) => {
    try {
      return decodeURIComponent(m);
    } catch {
      return m; // séquence invalide, on la laisse telle quelle
    }
  });

  // Normalisation et capitalisation
  s = s.replace(/\s+/g, " ").trim();

  return capitalize(s);
}
