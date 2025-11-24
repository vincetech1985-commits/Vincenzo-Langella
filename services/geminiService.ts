import { GoogleGenAI } from "@google/genai";
import { Gender } from '../types';

export const getFitnessAdvice = async (age: number, gender: Gender, maxHr: number): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment variables.");
    return "Chiave API mancante. Impossibile generare suggerimenti personalizzati al momento.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Agisci come un esperto coach sportivo e cardiologo.
      Ho un utente con le seguenti caratteristiche:
      - Età: ${age} anni
      - Sesso: ${gender === 'M' ? 'Maschio' : 'Femmina'}
      - Frequenza Cardiaca Massima (teorica): ${maxHr} bpm.

      Fornisci 3 suggerimenti brevi, pratici e motivazionali su come iniziare ad allenarsi rispettando le zone cardio.
      Formatta la risposta come un semplice testo discorsivo o elenco puntato, in Italiano. 
      Sii conciso (massimo 100 parole).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Non sono riuscito a generare suggerimenti al momento.";
  } catch (error) {
    console.error("Error generating fitness advice:", error);
    return "Si è verificato un errore durante la generazione dei suggerimenti. Riprova più tardi.";
  }
};