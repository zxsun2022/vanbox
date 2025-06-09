-- Enable DELETE operations for users on their own entries.
-- This policy allows a user to delete a row in the 'entries' table
-- if their user ID matches the 'user_id' column of that row.

CREATE POLICY "Users can delete their own entries"
ON public.entries
FOR DELETE
USING (auth.uid() = user_id); 