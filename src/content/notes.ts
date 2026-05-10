// Note cards. Empty for now — real titles + blurbs drop in when notes start shipping.

export interface Note {
  slug: string;
  title: string;
  blurb: string;
  date: string;
  readingMinutes: number;
}

export const NOTES: Note[] = [];
