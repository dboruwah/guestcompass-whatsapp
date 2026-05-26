-- Backfill business_id on profiles that have staff records linking them to a business
UPDATE profiles p
SET business_id = s.business_id
FROM staff s
WHERE s.user_id = p.id
  AND p.business_id IS NULL;

-- Also ensure the auth trigger includes business_id when creating a profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
