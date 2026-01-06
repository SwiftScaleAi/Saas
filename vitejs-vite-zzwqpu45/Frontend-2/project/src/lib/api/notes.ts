import { supabase } from "../supabase";

export interface Note {
  id: string;
  candidate_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all notes for a candidate
 */
export async function fetchNotes(candidateId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new note for a candidate
 */
export async function createNote(
  candidateId: string,
  content: string
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ candidate_id: candidateId, content }])
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    throw error;
  }

  return data as Note;
}

/**
 * Update an existing note (optional future use)
 */
export async function updateNote(
  noteId: string,
  content: string
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    console.error("Error updating note:", error);
    throw error;
  }

  return data as Note;
}
