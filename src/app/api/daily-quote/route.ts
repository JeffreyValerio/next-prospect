"use server";

import { NextResponse } from "next/server";

const FALLBACK_QUOTE = {
  text: "La persistencia es el camino al éxito.",
  author: "Charles Chaplin",
};

const LOCAL_QUOTES: Array<{ text: string; author: string }> = [
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "Haz de tu vida un sueño, y de tu sueño una realidad.", author: "Antoine de Saint-Exupéry" },
  { text: "La mejor manera de predecir el futuro es crearlo.", author: "Peter Drucker" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "Tu actitud determina tu dirección.", author: "Desconocido" },
  { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
  { text: "Empieza haciendo lo necesario, después lo posible y de repente estarás logrando lo imposible.", author: "San Francisco de Asís" },
  { text: "La vida es 10% lo que nos sucede y 90% cómo reaccionamos ante ello.", author: "Charles R. Swindoll" },
  { text: "El único lugar donde el éxito viene antes que el trabajo es en el diccionario.", author: "Vidal Sassoon" },
  { text: "La fuerza no proviene de la capacidad corporal, sino de la voluntad del alma.", author: "Mahatma Gandhi" },
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch("https://www.positive-api.online/phrase/esp", {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    if (!response.ok) {
      throw new Error(`Respuesta no válida: ${response.status}`);
    }

    const data = await response.json();
    const text = (data?.text ?? data?.frase ?? data?.quote ?? "").toString().trim();
    const author = (data?.author ?? data?.autor ?? data?.author_name ?? "").toString().trim() || "Desconocido";

    if (!text) {
      throw new Error("La respuesta no contiene una frase válida.");
    }

    return NextResponse.json({
      text,
      author,
      source: "positive-api.online",
    });
  } catch (error) {
    console.error("Error obteniendo la frase diaria:", error);
    const randomQuote = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)] ?? FALLBACK_QUOTE;
    return NextResponse.json(
      {
        text: randomQuote.text,
        author: randomQuote.author,
        source: "local-fallback",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

